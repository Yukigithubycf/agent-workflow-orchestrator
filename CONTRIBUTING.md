# Contributing to AstraFlow

Thank you for contributing to AstraFlow. This repository is a monorepo: use the
root commands for the complete application, and the module commands for focused
backend or frontend work.

## Development setup

Start with the setup wizard from the repository root:

```bash
make setup
make doctor
```

The full development stack is started with `make dev`. Backend development
commands live in `backend/`, while frontend commands run from `frontend/`.
See `AGENTS.md`, `backend/AGENTS.md`, and `frontend/AGENTS.md` for the current
architecture and development conventions.

## Tests and formatting

Run the checks relevant to your changes before opening a pull request:

```bash
# Backend
cd backend
make format
make lint
make test

# Frontend
cd frontend
pnpm check
pnpm test
```

Backend tests are offline by default. Tests that call real external APIs are
explicitly opt-in and must not run in CI. To run them locally with configured
API credentials:

```bash
cd backend
make test-live
```

The equivalent low-level opt-in is `DEER_FLOW_RUN_LIVE_TESTS=1`; prefer the
`make test-live` target so the expected pytest markers and paths stay aligned.

## Pull requests

- Add or update tests for behavior changes.
- Keep `README.md` and the relevant `AGENTS.md` synchronized with code changes.
- Do not commit `.env`, `config.yaml`, `extensions_config.json`, credentials,
  generated logs, dependency caches, or local runtime data.
- Keep commits focused and describe user-visible behavior and verification in
  the pull request.
