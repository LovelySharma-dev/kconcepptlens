import { spawnSync } from 'child_process';
import path from 'path';

export interface PythonEngineSuccess {
  ok: true;
  data: Record<string, unknown>;
}

export interface PythonEngineFailure {
  ok: false;
  kind: 'timeout' | 'unavailable' | 'malformed';
  error: string;
}

/**
 * Runs the local Python evidence engine. No network call and no API key.
 * A non-zero status, timeout, or unexpected payload is a failure, not a success.
 */
export function runPythonEngine(payload: Record<string, unknown>): PythonEngineSuccess | PythonEngineFailure {
  const script = path.resolve(__dirname, '../../../python/self_learning_engine.py');
  const commands = process.platform === 'win32' ? [['python'], ['py', '-3']] : [['python3'], ['python']];
  let sawMissing = false;

  for (const command of commands) {
    const result = spawnSync(command[0], [...command.slice(1), script], {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      timeout: 8000,
      windowsHide: true
    });
    const code = (result.error as NodeJS.ErrnoException | undefined)?.code;
    if (code === 'ENOENT') {
      sawMissing = true;
      continue;
    }
    if (result.error) {
      const timedOut = /timed out/i.test(result.error.message);
      return {
        ok: false,
        kind: timedOut ? 'timeout' : 'unavailable',
        error: timedOut
          ? 'The Python engine timed out. No finished evidence update was stored.'
          : 'The Python engine did not finish.'
      };
    }
    if (result.status !== 0 || !result.stdout.trim()) {
      return { ok: false, kind: 'unavailable', error: 'The Python engine did not return a result.' };
    }
    try {
      const data = JSON.parse(result.stdout) as Record<string, unknown>;
      if (!data || typeof data !== 'object' || data.trainedModel !== false) {
        return { ok: false, kind: 'malformed', error: 'The Python engine returned a result that was not accepted.' };
      }
      return { ok: true, data };
    } catch {
      return { ok: false, kind: 'malformed', error: 'The Python engine returned malformed JSON.' };
    }
  }

  return {
    ok: false,
    kind: 'unavailable',
    error: sawMissing
      ? 'Python is not available on this machine. Written explanations still use the local rules.'
      : 'The Python engine could not be started.'
  };
}
