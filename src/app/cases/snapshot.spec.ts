import { parseSnapshot } from './snapshot';

describe('parseSnapshot', () => {
  it('reads a post snapshot', () => {
    const snapshot = parseSnapshot(
      'POST',
      JSON.stringify({ author: 'ada', body: 'hi', code: '', codeLanguage: '', createdAt: 'x' }),
    );

    expect(snapshot).toMatchObject({ kind: 'POST', author: 'ada', body: 'hi' });
  });

  it('keeps the community a post was made in', () => {
    const snapshot = parseSnapshot('POST', JSON.stringify({ author: 'ada', community: 'rustaceans' }));

    expect(snapshot).toMatchObject({ kind: 'POST', community: 'rustaceans' });
  });

  it('reads a community snapshot', () => {
    const snapshot = parseSnapshot(
      'COMMUNITY',
      JSON.stringify({ communityId: 'c1', slug: 'rustaceans', name: 'Rustaceans', description: '' }),
    );

    expect(snapshot).toEqual({
      kind: 'COMMUNITY',
      slug: 'rustaceans',
      name: 'Rustaceans',
      description: '',
    });
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
