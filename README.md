# DevHub · Moderator console

**The console DevHub moderators use to keep the community safe.** Moderators work through
reported content, act on it, and every decision lands in an audit log. A stats page shows
how the platform is doing.

[![deploy](https://github.com/GitSter-dev/devhub-console/actions/workflows/deploy.yml/badge.svg)](https://github.com/GitSter-dev/devhub-console/actions/workflows/deploy.yml)
![Angular 21](https://img.shields.io/badge/Angular-21-DD0031)
![PrimeNG](https://img.shields.io/badge/UI-PrimeNG-2196F3)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)

Part of DevHub: [Mobile app](https://github.com/GitSter-dev/devhub-app) · [Backend](https://github.com/GitSter-dev/devhub-backend) · **Moderator console**

![The moderation queue](docs/screenshots/queue.png)

## What it does

- **Moderation queue.** Reports on posts, messages and users are grouped into cases, ranked by
  severity and filterable by status. Each report keeps a snapshot of the content as it was when
  it was reported.
- **Clear actions.** Dismiss, remove content, warn, suspend (up to a year), ban, restore or
  reinstate, with an optional note explaining why.
- **Audit log.** Every action records which moderator took it, against whom, and why.
- **Account lookup.** Find any user and see their status, how often they report and are
  reported, and their case history.
- **Platform stats.** Totals plus daily sign-ups, posts, reports and moderator actions, charted
  over a chosen range.

## Engineering highlights

- **Only moderators get in.** The console signs in against the same API as the app and refuses any
  account without the admin role. Route guards keep every page behind that check.
- **Sessions that survive expiry.** When an access token expires mid-request, the console refreshes
  it and replays the request. Signing in or out in one tab applies to every tab.
- **Retries that can't do harm.** Only reads are retried on network or gateway errors, so an
  action is never applied twice.
- **Modern Angular.** Standalone components, signals and an `@ngrx/signals` store, with every
  page lazy-loaded.
- **Small, locked-down deployment.** A non-root nginx container is served from the backend's own
  domain under `/console`, so no CORS is needed and a strict Content Security Policy applies.
  It deploys through GitHub OIDC with a live smoke test and one-step rollback.

## Tech stack

| Area | Choices |
|---|---|
| Framework | Angular 21 (standalone, signals), `@ngrx/signals`, RxJS |
| UI | PrimeNG (Aura theme, light and dark), Chart.js |
| Quality | Vitest, Prettier, GitHub Actions |
| Delivery | Docker (nginx, non-root), AWS ECR + SSM via GitHub OIDC |

## Run it locally

Start the [backend](https://github.com/GitSter-dev/devhub-backend) on port 8080 first. The dev
server proxies API calls to it.

```bash
npm ci
npm start   # http://localhost:4200/console/
```

Sign in with a **dedicated moderator account**. DevHub allows one session per account, so using
your personal account here signs your phone out. The backend's
[`deploy/ADMIN.md`](https://github.com/GitSter-dev/devhub-backend/blob/main/deploy/ADMIN.md)
explains how to grant the role.

## Testing & delivery

- Unit tests cover the session store, token refresh, API envelope parsing, case actions and
  content snapshots. Run them with `npm test -- --watch=false`.
- Every pull request runs the tests and a production build.
- Every merge to `main` builds the image, pushes it to ECR and rolls it out over SSM, then checks
  that the live console responds.

<details>
<summary><b>Deployment details</b></summary>

Pushing to `main` builds the image, pushes it to the console's ECR repository and rolls it out
with an SSM document that can only run `/opt/devhub/deploy-console.sh <sha>` on the instance. To
roll back, run the workflow manually with an existing `image_tag`.

Variables in the GitHub `production` environment: `AWS_REGION`, `AWS_CONSOLE_DEPLOY_ROLE_ARN`,
`CONSOLE_ECR_REPOSITORY_URL`, `INSTANCE_ID`, `DEPLOY_CONSOLE_DOCUMENT` and `DEVHUB_DOMAIN`. All
but the domain come from `terraform output` in the backend repo.

</details>

---

© 2026 [GProgrammer1](https://github.com/GProgrammer1). The source is public for review but not licensed for reuse.
