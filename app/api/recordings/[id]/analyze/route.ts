import {createServerSupabase} from "@/lib/supabase-server"
import {createAdminSupabase} from "@/lib/supabase-admin"
import {UserFacingError} from "@/lib/user-error"
import createAudioURL from "@/lib/create-audio-url"
import {transcribeAudio} from "@/lib/transcription/assemblyai"
import {getFeedback} from "@/lib/feedback/getFeedback"
import {impromptuFromRow} from "@/lib/impromptu/topics"
import {cleanTopic, quickTopicProblem} from "@/lib/topic/check-topic"
import {classifyTopic} from "@/lib/topic/classify-topic"
import type {TopicInfo} from "@/lib/topic/speech-types"
import {cleanScript, countWords} from "@/lib/script/compare-script"
import {STALE_ANALYSIS_MS} from "@/lib/recording-types"
export const maxDuration = 200;
// A topic that can't be evaluated gets this status + code, so the page can show the "can't use that topic" popup.
// The recording stays "uploaded", so the page can ask again (topic-free, or with a new topic) without re-uploading.
function topicRejected(reason: string) {
    return Response.json({error: reason, code: "topic_rejected"}, {status: 422});
}
const DAILY_LIMIT = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const started = Date.now() // Claude gets whatever is left of the 200 seconds (see below)
    const {id} = await params
    if (!UUID.test(id)) {
        return Response.json({error: "Recording not found."}, {status: 404});
    }
    // Optional body (all parts optional; no body at all is fine):
    //   topic  - what the speech is about, typed by the speaker (lib/topic)
    //   script - the script they pasted (lib/script)
    //   redoOf - the earlier recording this take redoes, for the side-by-side compare (lib/redo)
    let body: {topic?: unknown; script?: unknown; redoOf?: unknown} = {}
    try {
        body = ((await request.json()) as typeof body | null) ?? {}
    } catch {
        // no body or not JSON: a plain run
    }
    const rawTopic = body.topic
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
    // Server-side check that the file really is in this user's own folder (the browser could send any path)
    if (!new RegExp(`^${user.id}/[0-9a-f-]{36}\\.[a-zA-Z0-9]{1,5}$`).test(data.file_path)) {
        return Response.json({error: "Recording not found."}, {status: 404});
    }
    // Every server key the analysis needs, checked BEFORE anything starts. A missing one would otherwise
    // crash with no message, or fail halfway (after AssemblyAI was already paid for). The recording stays
    // "uploaded", so it can be analyzed once the key is added. Only the NAMES are logged, never values.
    const missing = ["SUPABASE_SERVICE_ROLE_KEY", "ASSEMBLYAI_API_KEY", "ANTHROPIC_API_KEY"].filter((name) => !process.env[name]);
    if (missing.length > 0) {
        console.error(`Analysis is not set up: missing ${missing.join(", ")}. Add them to .env.local (or the Vercel project settings) and restart.`);
        return Response.json({error: "Feedback isn't available right now. Please try again later."}, {status: 503});
    }
    // Impromptu runs (migration 0008) carry a topic + target length. Only topics on our built-in list
    // count, so text a user typed into the row can never reach the prompt; anything else is a normal run.
    const impromptu = impromptuFromRow(data)
    // A typed topic (ignored on impromptu runs, which already have one). The free keysmash check runs first,
    // before anything is counted or paid for.
    const typedTopic = !impromptu && typeof rawTopic === "string" ? cleanTopic(rawTopic) : ""
    if (typedTopic) {
        const problem = quickTopicProblem(typedTopic)
        if (problem) return topicRejected(problem)
    }
    // A pasted script (ignored on impromptu runs). Fewer than 5 words isn't a script worth comparing.
    const scriptText = !impromptu && typeof body.script === "string" ? cleanScript(body.script) : ""
    const script = countWords(scriptText) >= 5 ? scriptText : null
    // A redo only counts if the earlier recording is this user's own finished one (Row Level Security hides
    // everyone else's) and isn't this same recording. Anything else is quietly treated as a normal run.
    let redoOf: string | null = null
    if (typeof body.redoOf === "string" && UUID.test(body.redoOf) && body.redoOf !== id) {
        const {data: original} = await supabase.from("recordings").select("id").eq("id", body.redoOf).eq("status", "done").maybeSingle()
        if (original) redoOf = original.id
    }
    // From here on, changes go through the admin client: users can't edit status or results themselves
    // (the ownership checks above already ran).
    const admin = createAdminSupabase();
    // Spend cap: transcription and feedback cost money on every call, so each user gets a daily limit.
    // Counted in analysis_log, which only the server can write, so deleting recordings doesn't reset it.
    // The log row is added FIRST and then counted, so 50 requests sent at once can't all read "0 used".
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const {data: logRow, error: logError} = await admin.from("analysis_log").insert({user_id: user.id}).select("id").single()
    if (logError || !logRow) {
        return Response.json({error: "Could not check your daily limit. Please try again."}, {status: 500})
    }
    const {count, error: countError} = await admin.from("analysis_log").select("id", {count: "exact", head: true}).eq("user_id", user.id).gte("created_at", since)
    if (countError || (count ?? DAILY_LIMIT + 1) > DAILY_LIMIT) {
        await admin.from("analysis_log").delete().eq("id", logRow.id)
        return countError
            ? Response.json({error: "Could not check your daily limit. Please try again."}, {status: 500})
            : Response.json({error: "Daily analysis limit reached. Please try again tomorrow."}, {status: 429});
    }
    // The Claude topic check: after the daily limit (so it can't be called endlessly) and before the claim and
    // transcription (so a rejected topic never costs an AssemblyAI run). A rejection keeps its daily-limit
    // entry on purpose: the check itself was a paid call.
    let topic: TopicInfo | null = null
    if (typedTopic) {
        const verdict = await classifyTopic(typedTopic)
        if (!verdict.ok) return topicRejected(verdict.reason)
        topic = {topic: typedTopic, speechType: verdict.speechType}
    }
    // a row stuck on "analyzing" (server timed out) becomes retryable once its analysis is surely dead
    const stale = new Date(Date.now() - STALE_ANALYSIS_MS).toISOString();
    // Repeat guard + claim in ONE step: only a recording that is "uploaded" or "failed" can be switched to
    // "analyzing", so two requests sent at the same time can't both start a paid analysis.
    const {data: claimed, error: updateError} = await admin.from("recordings").update({status: "analyzing", analysis_started_at: new Date().toISOString()}).eq("id", id).eq("user_id", user.id).or(`status.in.(uploaded,failed),and(status.eq.analyzing,analysis_started_at.lt.${stale})`).select("id")
    if (updateError || !claimed || claimed.length === 0) {
        await admin.from("analysis_log").delete().eq("id", logRow.id)
    }
    if (updateError) {
        return Response.json({error: "Could not update status."}, {status: 500})
    }
    if (!claimed || claimed.length === 0) {
        return Response.json({error: data.status === "done"
            ? "This recording has already been analyzed."
            : "This recording is already being analyzed. Check History in a minute."}, {status: 409});
    }

    // The try catch below make sit so that the code will do everything in try but acts as a giant error marker
    // If there is an error in any of these, catch it, end it, and display the error. 
    // Safety system
    try{
        // Takes the path of the file that has been chosen and converts it to link for Assembly AI
        const link = await createAudioURL(data.file_path)
        // Uses the link and physically uses the path that has been cleared by the guards to send in that link and transcribe audio with the link
        const transcript = await transcribeAudio(link)
        // Uses that transcript and gets feedback (plus the impromptu or topic section, if any)
        // Claude gets the time left before the 200-second limit (minus 10s to save), so a slow reply fails
        // cleanly as "failed" (retryable) instead of the server being stopped with the row stuck on "analyzing"
        const timeLeft = (maxDuration - 10) * 1000 - (Date.now() - started)
        const {metrics, feedback} = await getFeedback(transcript, {impromptu, topic, script, signal: AbortSignal.timeout(Math.max(timeLeft, 1000))})
        if (redoOf) feedback.redoOf = redoOf

        //  Here we are now taking the values we got from Rian's code and taking them back and updating our table/database with them
        // They are extremely useful so we are giving the audio to Rian and his code doees his thing and then we take the outputs and reorganize them into the table below
        // These form foundations for charts and display  
        const {error: saveError} = await admin
            .from("recordings")
            .update({
                transcript: transcript,
                metrics: metrics,
                feedback: feedback,
                duration_ms: transcript.durationMs,
                status: 'done'
        })
        .eq("id", id).eq("user_id", user.id)

        if (saveError) {
            throw new UserFacingError("Could not save your results. Please try again.")
        }

        return Response.json({ok: true});

    } catch (err) {
        // only our own friendly messages reach the user; anything unexpected stays in the server log
        const message = err instanceof UserFacingError ? err.message : "Analysis failed. Please try again."

        console.error("Analysis failed for recording", id, err)

        await admin.from("recordings").update({status: "failed", error_message: message}).eq("id", id).eq("user_id", user.id)

        return Response.json({error: message}, {status: 500})
    }
    



    
    

}