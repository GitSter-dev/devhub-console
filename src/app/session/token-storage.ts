import { Injectable, signal } from '@angular/core';
import { TokenPair } from '../api/models';

export const SESSION_KEY = 'devhub.console.session';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly current = signal<TokenPair | null>(readStored());
  readonly pair = this.current.asReadonly();

  constructor() {
    globalThis.addEventListener?.('storage', (event: StorageEvent) => {
      if (event.key === SESSION_KEY || event.key === null) {
        this.current.set(readStored());
      }
    });
  }

  read(): TokenPair | null {
    const pair = readStored();
    if (!samePair(pair, this.current())) {
      this.current.set(pair);
    }
    return pair;
  }

  accessToken(): string | null {
    return this.read()?.accessToken ?? null;
  }

  save(pair: TokenPair): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(pair));
    } catch {}
    this.current.set(pair);
  }

  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    this.current.set(null);
  }
}

function readStored(): TokenPair | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as TokenPair) : null;
  } catch {
    return null;
  }
}

function samePair(a: TokenPair | null, b: TokenPair | null): boolean {
  return a?.accessToken === b?.accessToken && a?.refreshToken === b?.refreshToken;
}
