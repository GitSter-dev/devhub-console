import { actionProblem, actionRequest, availableActions } from './case-actions';

describe('case actions', () => {
  it('offers content actions only when there is content', () => {
    const forUser = availableActions('USER').map((option) => option.action);
    const forPost = availableActions('POST').map((option) => option.action);

    expect(forUser).not.toContain('REMOVE_CONTENT');
    expect(forUser).not.toContain('RESTORE');
    expect(forUser).toContain('SUSPEND');
    expect(forPost).toContain('REMOVE_CONTENT');
    expect(forPost).toContain('RESTORE');
  });

  it('words content actions as taking down a reported community', () => {
    const forCommunity = availableActions('COMMUNITY');
    const takeDown = forCommunity.find((option) => option.action === 'REMOVE_CONTENT');

    expect(takeDown?.label).toBe('Take down community');
    expect(forCommunity.map((option) => option.action)).toContain('RESTORE');
    expect(availableActions('POST').find((option) => option.action === 'REMOVE_CONTENT')?.label).toBe(
      'Remove content',
    );
  });

  it('requires a suspension length between 1 and 365 days', () => {
    expect(actionProblem('SUSPEND', null)).toBeTruthy();
    expect(actionProblem('SUSPEND', 0)).toBeTruthy();
    expect(actionProblem('SUSPEND', 366)).toBeTruthy();
    expect(actionProblem('SUSPEND', 7)).toBeNull();
    expect(actionProblem('BAN', null)).toBeNull();
    expect(actionProblem(null, null)).toBeTruthy();
  });

  it('sends days only with a suspension and drops a blank note', () => {
    expect(actionRequest('BAN', '   ', 7)).toEqual({ action: 'BAN' });
    expect(actionRequest('SUSPEND', ' spam wave ', 7)).toEqual({
      action: 'SUSPEND',
      note: 'spam wave',
      days: 7,
    });
  });
});
