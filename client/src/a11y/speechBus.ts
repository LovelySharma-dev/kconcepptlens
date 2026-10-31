/**
 * One shared ConceptLens speech channel.
 * Screen-reader live regions are separate and must stay available when this stops.
 */

export type SpeechCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export function speechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Stops ConceptLens-controlled speech only. Does not mute the screen reader. */
export function stopConceptLensSpeech(): void {
  if (!speechSynthesisAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function speakConceptLens(text: string, rate = 1, callbacks: SpeechCallbacks = {}): boolean {
  if (!speechSynthesisAvailable() || !text.trim()) {
    callbacks.onError?.();
    return false;
  }
  stopConceptLensSpeech();
  try {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = rate;
    utterance.onstart = () => callbacks.onStart?.();
    utterance.onend = () => callbacks.onEnd?.();
    utterance.onerror = () => callbacks.onError?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    callbacks.onError?.();
    return false;
  }
}

export function pauseConceptLensSpeech(): void {
  if (!speechSynthesisAvailable()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* ignore */
  }
}

export function resumeConceptLensSpeech(): void {
  if (!speechSynthesisAvailable()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}
