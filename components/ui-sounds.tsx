"use client"; // plays sounds in the browser and remembers the mute switch
// Interface sounds: tiny, quiet tones made on the fly with the Web Audio API (no sound files to download).
// They are meant to be felt more than heard: under 0.15 s and very low volume, only on presses, slider
// moves and tutorial steps (never hover, typing or scrolling), and every one of them sits on a visual
// change that already happens, so nothing depends on hearing them.
// On by default (the product owner's call); the speaker button in the top bar mutes them, remembered on this device.
// A button can ask for a specific sound with data-sound="start" | "stop" | "tick"; otherwise presses get "tap".
// Browsers only allow sound after a click or tap, which is exactly when these play.
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "l2s-sound";
type Sound = "tap" | "tick" | "start" | "stop";

let ctx: AudioContext | null = null;

function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

// one short note: frequency glides from `from` to `to`, volume rises in 4 ms and fades out by `length`
function note(at: number, from: number, to: number, length: number, volume: number, type: OscillatorType = "sine") {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + length);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

// pitch (0 to 1) only matters for "tick": the slider uses it so faster pace sounds higher
export function playSound(sound: Sound, pitch = 0.5) {
  if (!soundOn() || typeof AudioContext === "undefined") return;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  const t = ctx.currentTime;
  if (sound === "tap") note(t, 520, 380, 0.06, 0.035); // a soft low "pop"
  if (sound === "tick") note(t, 1100 + pitch * 700, 1000 + pitch * 700, 0.025, 0.012, "triangle");
  if (sound === "start") { note(t, 440, 440, 0.07, 0.03); note(t + 0.07, 660, 660, 0.09, 0.03); } // rising: recording on
  if (sound === "stop") { note(t, 660, 660, 0.07, 0.03); note(t + 0.07, 440, 440, 0.09, 0.03); } // falling: recording off
}

// Listens once for the whole site, so every button (and link styled as one) gets its sound
// without each page wiring it up. Range sliders tick at most every 50 ms and only every 4 steps.
export default function UiSounds() {
  useEffect(() => {
    let lastTick = 0;
    let lastValue = NaN;
    function onPress(e: PointerEvent) {
      const el = (e.target as Element).closest<HTMLElement>("button:not(:disabled), a.group\\/button, [data-sound]");
      if (!el) return;
      playSound((el.dataset.sound as Sound | undefined) ?? "tap");
    }
    function onSlide(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.type !== "range") return;
      const value = Number(input.value);
      const now = performance.now();
      if (now - lastTick < 50 || Math.abs(value - lastValue) < 4) return;
      lastTick = now;
      lastValue = value;
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      playSound("tick", (value - min) / (max - min));
    }
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("input", onSlide);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("input", onSlide);
    };
  }, []);
  return null;
}

// The speaker button in the top bar
export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(soundOn()), []);
  function toggle() {
    const next = !on;
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    setOn(next);
    if (next) playSound("tap"); // the press happened while muted, so confirm "sound is on" now
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="max-sm:size-11"
      aria-label="Interface sounds"
      aria-pressed={on}
      onClick={toggle}
    >
      {on ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}
