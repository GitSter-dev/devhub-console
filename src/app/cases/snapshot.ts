import { ReportTarget } from '../api/models';

export interface PostSnapshot {
  kind: 'POST';
  author: string;
  body: string;
  code: string;
  codeLanguage: string;
  createdAt: string;
}

export interface MessageLine {
  seq: string;
  sender: string;
  body: string;
  code: string;
}

export interface MessageSnapshot {
  kind: 'MESSAGE';
  sender: string;
  createdAt: string;
  lines: MessageLine[];
}

export interface UserSnapshot {
  kind: 'USER';
  username: string;
  displayName: string;
  bio: string;
  githubUsername: string;
  websiteUrl: string;
}

export interface RawSnapshot {
  kind: 'RAW';
  text: string;
}

export type Snapshot = PostSnapshot | MessageSnapshot | UserSnapshot | RawSnapshot;

export function parseSnapshot(target: ReportTarget, raw: string): Snapshot {
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { kind: 'RAW', text: raw };
  }
  const text = (key: string) => (typeof value[key] === 'string' ? (value[key] as string) : '');
  switch (target) {
    case 'POST':
      return {
        kind: 'POST',
        author: text('author'),
        body: text('body'),
        code: text('code'),
        codeLanguage: text('codeLanguage'),
        createdAt: text('createdAt'),
      };
    case 'MESSAGE':
      return {
        kind: 'MESSAGE',
        sender: text('sender'),
        createdAt: text('createdAt'),
        lines: Array.isArray(value['messages']) ? (value['messages'] as MessageLine[]) : [],
      };
    case 'USER':
      return {
        kind: 'USER',
        username: text('username'),
        displayName: text('displayName'),
        bio: text('bio'),
        githubUsername: text('githubUsername'),
        websiteUrl: text('websiteUrl'),
      };
  }
}
