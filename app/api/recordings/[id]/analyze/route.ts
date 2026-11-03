import {createServerSupabase} from "@/lib/supabase-server"
import createAudioURL from "@/lib/create-audio-url"
import {transcribeAudio} from "@/lib/transcription/assemblyai"
import {getFeedback} from "@/lib/feedback/getFeedback"
export const maxDuration = 200;
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const {id} = await params
    const supabase = await createServerSupabase();
    // Checks first if you are trying to access the path that goes from the audio link ot AssemblyAI, you are the user
    // Checks who YOU are first of all. Who is TRYING to access the address (the path to AssemblyAI). Checks if you are a valid, logged in user. Uses server data because it happens fast, immediately and high end, 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
        return Response.json({ error: "Respective user not found." }, { status: 401 }); 
    }
    // Now we are trying to check if the RECORDING is the same as who the user is or if it belongs to the user
    // The above was checking if there even is a user or if it is anonymous and after that we are saying "Yeah its you, but is what you are trying to access yours?"
    // Right below this is where we find the specific file that we are working with using the cookies of the user.
    const {data, error} = await supabase.from("recordings").select("*").eq("id",id).single()
    if (error) {
        return Response.json({error: "Unauthorized user."}, {status: 404});
    }
    // Repeat guard: transcription and feedback cost money on every call, so a recording that is
    // already being analyzed or is finished can't be sent again. "failed" is allowed so it can be retried.
    if (data.status === "analyzing" || data.status === "done") {
        return Response.json({error: "This recording has already been analyzed."}, {status: 409});
    }
    // Basically if every gard runs well, change the status of the recording (identified with ID) to analyzing
    const {error: updateError} = await supabase.from("recordings").update({status: "analyzing"}).eq("id", id)
    if (updateError) {
        return Response.json({error: "Could not update status."}, {status: 500})
    }

    // The try catch below make sit so that the code will do everything in try but acts as a giant error marker
    // If there is an error in any of these, catch it, end it, and display the error. 
    // Safety system
    try{
        // Takes the path of the file that has been chosen and converts it to link for Assembly AI
        const link = await createAudioURL(data.file_path)
        // Uses the link and physically uses the path that has been cleared by the guards to send in that link and transcribe audio with the link
        const transcript = await transcribeAudio(link)
        // Uses that transcript and gets feedback
        const {metrics, feedback} = await getFeedback(transcript)

        //  Here we are now taking the values we got from Rian's code and taking them back and updating our table/database with them
        // They are extremely useful so we are giving the audio to Rian and his code doees his thing and then we take the outputs and reorganize them into the table below
        // These form foundations for charts and display  
        const {error: saveError} = await supabase
            .from("recordings")
            .update({
                transcript: transcript,
                metrics: metrics,
                feedback: feedback,
                duration_ms: transcript.durationMs,
                status: 'done'
        })
        .eq("id", id)

        if (saveError) {
            throw new Error("External values not saved properly.")
        }

        return Response.json({ok: true});

    } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed"

        console.error("Analysis failed for recording", id, err)

        await supabase.from("recordings").update({status: "failed", error_message: message}).eq("id", id)

        return Response.json({error: message}, {status: 500})
    }
    



    
    

}