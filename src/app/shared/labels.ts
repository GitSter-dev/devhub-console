import { AccountStatus, CaseStatus, ModerationActionType } from '../api/models';

export type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

export function humanize(value: string): string {
  const words = value.toLowerCase().replaceAll('_', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const CASE_STATUS_SEVERITY: Record<CaseStatus, TagSeverity> = {
  OPEN: 'warn',
  ACTIONED: 'danger',
  DISMISSED: 'secondary',
};

const ACCOUNT_STATUS_SEVERITY: Record<AccountStatus, TagSeverity> = {
  ACTIVE: 'success',
  UNVERIFIED: 'secondary',
  SUSPENDED: 'warn',
  BANNED: 'danger',
  DEACTIVATED: 'secondary',
  DELETED: 'contrast',
};

const ACTION_SEVERITY: Record<ModerationActionType, TagSeverity> = {
  DISMISS: 'secondary',
  REMOVE_CONTENT: 'danger',
  WARN: 'warn',
  SUSPEND: 'warn',
  BAN: 'danger',
  RESTORE: 'info',
  REINSTATE: 'info',
};

export function severityTone(severity: number): TagSeverity {
  if (severity >= 4) {
    return 'danger';
  }
  return severity >= 3 ? 'warn' : 'info';
}

export function caseStatusTone(status: CaseStatus): TagSeverity {
  return CASE_STATUS_SEVERITY[status];
}

export function accountStatusTone(status: AccountStatus): TagSeverity {
  return ACCOUNT_STATUS_SEVERITY[status];
}

export function actionTone(action: ModerationActionType): TagSeverity {
  return ACTION_SEVERITY[action];
}
