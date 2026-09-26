const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 4000;

export function backoff(attempt: number): number {
  return Math.random() * Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt);
}
