# @todo-list/api

Fastify 5 API (TypeScript, ESM).

## Scripts

| Command       | Description                    |
|---------------|--------------------------------|
| `pnpm dev`    | Start dev server with hot reload |
| `pnpm build`  | Compile TypeScript to `dist/`  |
| `pnpm start`  | Run compiled server            |

## Endpoints

- `GET /health` — returns `{ "status": "ok" }`

Loads environment variables from the repo root `.env` file (see root `.env.example`).
