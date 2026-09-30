import { ModerationActionRequest, ModerationActionType, ReportTarget } from '../api/models';

export interface ActionOption {
  action: ModerationActionType;
  label: string;
  description: string;
}

export const MAX_SUSPENSION_DAYS = 365;
export const MAX_NOTE_LENGTH = 500;

const OPTIONS: ActionOption[] = [
  {
    action: 'DISMISS',
    label: 'Dismiss',
    description: 'Nothing wrong. Puts hidden content back and closes the case.',
  },
  {
    action: 'REMOVE_CONTENT',
    label: 'Remove content',
    description: 'Takes the post or message down and tells the reporters.',
  },
  {
    action: 'WARN',
    label: 'Warn',
    description: 'Closes the case as actioned. The person is not notified.',
  },
  {
    action: 'SUSPEND',
    label: 'Suspend',
    description: 'Signs the person out everywhere and blocks sign-in for the chosen days.',
  },
  {
    action: 'BAN',
    label: 'Ban',
    description: 'Signs the person out for good and hides everything they posted.',
  },
  {
    action: 'RESTORE',
    label: 'Restore content',
    description: 'Puts removed or hidden content back and closes the case as dismissed.',
  },
  {
    action: 'REINSTATE',
    label: 'Reinstate',
    description: 'Lifts a suspension or ban on the owner.',
  },
];

const CONTENT_ONLY = new Set<ModerationActionType>(['REMOVE_CONTENT', 'RESTORE']);

const COMMUNITY_WORDING: Partial<Record<ModerationActionType, Omit<ActionOption, 'action'>>> = {
  REMOVE_CONTENT: {
    label: 'Take down community',
    description: 'Hides the community and its posts from everyone and tells the reporters.',
  },
  RESTORE: {
    label: 'Restore community',
    description: 'Brings a taken-down community back and closes the case as dismissed.',
  },
  WARN: {
    label: 'Warn owner',
    description: 'Closes the case as actioned. The owner is not notified.',
  },
};

export function availableActions(target: ReportTarget): ActionOption[] {
  if (target === 'USER') {
    return OPTIONS.filter((option) => !CONTENT_ONLY.has(option.action));
  }
  if (target === 'COMMUNITY') {
    return OPTIONS.map((option) => ({ ...option, ...COMMUNITY_WORDING[option.action] }));
  }
  return OPTIONS;
}

export function actionProblem(
  action: ModerationActionType | null,
  days: number | null,
): string | null {
  if (!action) {
    return 'Choose an action.';
  }
  if (action === 'SUSPEND' && (days === null || days < 1 || days > MAX_SUSPENSION_DAYS)) {
    return `A suspension lasts between 1 and ${MAX_SUSPENSION_DAYS} days.`;
  }
  return null;
}

export function actionRequest(
  action: ModerationActionType,
  note: string,
  days: number | null,
): ModerationActionRequest {
  const trimmed = note.trim();
  return {
    action,
    ...(trimmed ? { note: trimmed } : {}),
    ...(action === 'SUSPEND' && days !== null ? { days } : {}),
  };
}
