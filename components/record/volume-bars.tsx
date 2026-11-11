"use client";
// Bars that bounce with your voice while recording. The browser's audio analyser splits the
// microphone sound into pitch bands; each bar's height is how loud one band is right now.
// Nothing here is saved or sent anywhere, it only reads the live microphone.
import {useEffect, useRef} from "react";

const BARS = 16;

export default function VolumeBars({stream}: {stream: MediaStream}) {
    const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const audio = new AudioContext();
        const analyser = audio.createAnalyser();
        analyser.fftSize = 256; // 128 bands of ~190 Hz; bands 1-16 cover the speaking voice
        analyser.smoothingTimeConstant = 0.7; // a little smoothing so bars don't flicker
        audio.createMediaStreamSource(stream).connect(analyser);
        const levels = new Uint8Array(analyser.frequencyBinCount);
        let frame = 0;
        // ~60 times a second: read the levels and resize the bars directly
        // (no React state, so the page doesn't re-render 60 times a second)
        const draw = () => {
            analyser.getByteFrequencyData(levels);
            barsRef.current.forEach((bar, i) => {
                if (bar) bar.style.transform = `scaleY(${Math.max(0.08, levels[i + 1] / 255)})`;
            });
            frame = requestAnimationFrame(draw);
        };
        draw();
        // when recording stops: stop the loop and release the audio engine
        return () => {
            cancelAnimationFrame(frame);
            void audio.close();
        };
    }, [stream]);

    return (
        <div aria-hidden="true" className="flex h-12 items-end gap-1">
            {Array.from({length: BARS}, (_, i) => (
                <span key={i} ref={(el) => { barsRef.current[i] = el; }}
                    className="h-full w-1.5 origin-bottom rounded-full bg-brand transition-transform duration-75"
                    style={{transform: "scaleY(0.08)"}} />
            ))}
        </div>
    );
}
