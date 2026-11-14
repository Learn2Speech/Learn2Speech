// Live filler counter: a small, typed wrapper around the browser's built-in speech recognition
// (the Web Speech API). TypeScript doesn't ship types for it, so the few parts we use are described here.
//
// Privacy: some browsers can recognize speech ON the device (newer Chrome, after a one-time language
// download); others send the audio to the browser maker's own speech service (Google in Chrome,
// Microsoft in Edge). checkLiveSupport tells the page which one applies, so it can say so before the
// speaker turns the counter on. Learn2Speech never receives or saves the live text either way.

export const LIVE_LANG = "en-US";

// One recognized phrase. isFinal: the browser won't change it any more.
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
export type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
export type RecognitionErrorEvent = { error: string };

export type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  processLocally?: boolean; // newer browsers: true = only recognize on the device
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type AvailableOptions = { langs: string[]; processLocally: boolean };
type RecognitionConstructor = {
  new (): Recognition;
  // newer browsers only: can it run on the device, and download the language pack if needed
  available?: (options: AvailableOptions) => Promise<"available" | "downloadable" | "downloading" | "unavailable">;
  install?: (options: AvailableOptions) => Promise<boolean>;
};

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// on-device: works without sending audio anywhere. downloadable: on-device after a one-time language
// download. cloud: the browser sends audio to its own speech service. none: no live recognition at all.
export type LiveSupport = "on-device" | "downloadable" | "cloud" | "none";

export async function checkLiveSupport(): Promise<LiveSupport> {
  const Ctor = recognitionConstructor();
  if (!Ctor) return "none";
  if (typeof Ctor.available === "function") {
    try {
      const status = await Ctor.available({ langs: [LIVE_LANG], processLocally: true });
      if (status === "available") return "on-device";
      if (status === "downloadable" || status === "downloading") return "downloadable";
    } catch {
      // older version of the API: fall through to the browser's normal (cloud) recognition
    }
  }
  return "cloud";
}

// Downloads the on-device English pack (no audio is sent). true when it's ready to use.
export async function installOnDevice(): Promise<boolean> {
  const Ctor = recognitionConstructor();
  if (!Ctor || typeof Ctor.install !== "function") return false;
  try {
    return await Ctor.install({ langs: [LIVE_LANG], processLocally: true });
  } catch {
    return false;
  }
}

export function createRecognition(onDevice: boolean): Recognition | null {
  const Ctor = recognitionConstructor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = LIVE_LANG;
  recognition.continuous = true;
  recognition.interimResults = true; // words show up while they're still being said
  if (onDevice) recognition.processLocally = true;
  return recognition;
}
