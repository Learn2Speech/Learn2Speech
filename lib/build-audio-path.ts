export default function buildAudioPath(userId: string, fileName: string): string {
    const id = crypto.randomUUID();
    // only letters/digits survive, so a file name like "a.b/../c" can't change the storage path
    const endingTag = (fileName.split(".").pop() ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "audio";
    return `${userId}/${id}.${endingTag}`;
}