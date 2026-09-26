# DevHub console

The moderator console for DevHub: the moderation queue, the audit log, account lookup and platform
stats. It talks only to the `/admin/**`, `/auth/**` and `/users/me` endpoints of the DevHub backend
and is served from the backend's own origin at `/console/`, so it needs no CORS.

Sign in with a **dedicated moderator account**. DevHub keeps one session per account, so using
your personal account here signs your phone out. See `deploy/ADMIN.md` in the backend repo for
granting the role.

## Develop

```bash
npm ci
npm start            # http://localhost:4200/console/, proxies the API to localhost:8080
npm test -- --watch=false
npm run build
```

## Deploy

Pushing to `main` builds the image, pushes it to the `devhub-prod-console` ECR repository and
rolls it with the `devhub-prod-deploy-console` SSM document, which can only run
`/opt/devhub/deploy-console.sh <sha>` on the instance. Roll back by running the workflow with an
existing `image_tag`.

Repository variables (GitHub Environment `production`): `AWS_REGION`,
`AWS_CONSOLE_DEPLOY_ROLE_ARN`, `CONSOLE_ECR_REPOSITORY_URL`, `INSTANCE_ID`,
`DEPLOY_CONSOLE_DOCUMENT`, `DEVHUB_DOMAIN`. All but the domain come from `terraform output` in the
backend repo.
