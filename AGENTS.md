# Project workflow

When starting or building a feature in this project, use the user's SaaS playbook as the default workflow. Adapt the depth to the size and risk of the task.

## Before implementation
- Read the existing project guidance and inspect the relevant code before proposing changes.
- Clarify the product goal, users, core workflow, data and privacy needs, constraints, and what is out of scope when those details affect the design.
- Plan first: explain the approach, key decisions, risks, and alternatives before making broad or consequential changes.
- Keep the existing stack and architecture unless a change is justified; record meaningful lasting decisions here or in project docs.

## While building
- Work in small, reviewable steps and keep changes focused.
- Validate inputs at system boundaries; enforce authentication, authorization, and data ownership on the server.
- Keep secrets out of source and client code. Use environment variables and document required configuration.
- Use migrations for schema changes. Scope tenant-owned data consistently. Make background work, retries, and webhook handling safe where relevant.
- Build useful loading, empty, error, and success states for user-facing flows, with responsive and accessible interaction.

## Before calling work complete
- Review the diff and explain changed files, assumptions, skipped or mocked work, and remaining risks.
- Verify behavior with the checks appropriate to the task and report the actual results. Do not claim checks passed unless they were run.
- For higher-risk changes, pay special attention to permissions, cross-tenant isolation, secrets, failure cases, and a fresh review.
- Prefer simple solutions for the project's current stage; base performance and scaling work on measured needs.
