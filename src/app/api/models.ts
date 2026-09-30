export type Role = 'USER' | 'ADMIN';
export type AccountStatus =
  'ACTIVE' | 'UNVERIFIED' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED' | 'DELETED';
export type CaseStatus = 'OPEN' | 'ACTIONED' | 'DISMISSED';
export type ReportTarget = 'POST' | 'MESSAGE' | 'USER' | 'COMMUNITY';
export type ReportReason =
  'SPAM' | 'IMPERSONATION' | 'HARASSMENT' | 'HATE' | 'SEXUAL' | 'VIOLENCE' | 'SELF_HARM' | 'OTHER';
export type ModerationActionType =
  | 'DISMISS'
  | 'REMOVE_CONTENT'
  | 'WARN'
  | 'SUSPEND'
  | 'BAN'
  | 'RESTORE'
  | 'REINSTATE'
  | 'COMMUNITY_BAN'
  | 'COMMUNITY_UNBAN';

export interface TokenPair {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
}

export interface CaseCommunity {
  id: string;
  slug: string;
  name: string;
}

export interface CommunitySummary {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
}

export interface CaseView {
  id: string;
  targetType: ReportTarget;
  targetId: string;
  ownerId: string;
  ownerUsername: string;
  status: CaseStatus;
  reporterCount: number;
  severity: number;
  autoHidden: boolean;
  firstReportedAt: string;
  lastReportedAt: string;
  community: CaseCommunity | null;
}

export interface CasePage {
  items: CaseView[];
  nextCursor: string | null;
}

export interface ReportView {
  id: string;
  reporterUsername: string;
  reason: ReportReason;
  note: string | null;
  snapshot: string;
  createdAt: string;
}

export interface ActionView {
  moderatorUsername: string;
  action: ModerationActionType;
  note: string | null;
  actsUntil: string | null;
  createdAt: string;
}

export interface CaseDetail {
  moderationCase: CaseView;
  reports: ReportView[];
  actions: ActionView[];
}

export interface ModerationActionRequest {
  action: ModerationActionType;
  note?: string;
  days?: number;
}

export interface AuditEntry {
  id: string;
  caseId: string | null;
  moderatorUsername: string;
  action: ModerationActionType;
  targetUserId: string | null;
  targetUsername: string | null;
  note: string | null;
  actsUntil: string | null;
  createdAt: string;
  community: CaseCommunity | null;
}

export interface AuditPage {
  items: AuditEntry[];
  nextCursor: string | null;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
}

export interface UserDetail {
  user: UserSummary;
  emailVerifiedAt: string | null;
  suspendedUntil: string | null;
  bannedAt: string | null;
  deactivatedAt: string | null;
  deletedAt: string | null;
  postCount: number;
  reportsFiled: number;
  reportsAgainst: number;
  cases: CaseView[];
}

export interface StatsTotals {
  users: number;
  verifiedUsers: number;
  posts: number;
  openCases: number;
  suspended: number;
  banned: number;
}

export interface StatsDay {
  date: string;
  signups: number;
  posts: number;
  reports: number;
  actions: number;
}

export interface StatsOverview {
  totals: StatsTotals;
  daily: StatsDay[];
}
