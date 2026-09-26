import { parseSnapshot } from './snapshot';

describe('parseSnapshot', () => {
  it('reads a post snapshot', () => {
    const snapshot = parseSnapshot(
      'POST',
      JSON.stringify({ author: 'ada', body: 'hi', code: '', codeLanguage: '', createdAt: 'x' }),
    );

    expect(snapshot).toMatchObject({ kind: 'POST', author: 'ada', body: 'hi' });
  });

  it('reads a message transcript', () => {
    const snapshot = parseSnapshot(
      'MESSAGE',
      JSON.stringify({
        sender: 'ken',
        messages: [{ seq: '1', sender: 'ken', body: 'yo', code: '' }],
      }),
    );

    expect(snapshot).toMatchObject({ kind: 'MESSAGE', sender: 'ken' });
    expect(snapshot.kind === 'MESSAGE' && snapshot.lines).toHaveLength(1);
  });

  it('falls back to raw text when the snapshot is not JSON', () => {
    expect(parseSnapshot('USER', 'plain')).toEqual({ kind: 'RAW', text: 'plain' });
  });
});
