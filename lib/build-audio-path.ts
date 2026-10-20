export default function buildAudioPath(userId: string, fileName: string): string {
    const id = crypto.randomUUID();
    const endingTag = fileName.split(".").pop();
    return `${userId}/${id}.${endingTag}`;
}