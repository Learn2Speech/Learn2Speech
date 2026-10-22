export default function formatSize(byte: number): string {
        const megabytes = (byte)/(1024*1024)
        return `${megabytes.toFixed(1)} MB`;
}

