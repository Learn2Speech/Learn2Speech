const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a']
export default function validateAudio(file: File): string | null {
    if (file.size > 52428800) {
        return "Your audio file is too large! Please upload a smaller one.";
    }
    if (!ALLOWED_TYPES.includes(file.type) ) {
        return "This audio file type is not supported.";
    }
    return null;
}