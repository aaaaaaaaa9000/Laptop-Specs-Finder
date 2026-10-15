<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/13a2dbeb-8198-48cc-80b5-9474ca6b9f45

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Set `GEMINI_MODEL` to override the default model (`gemini-2.5-flash`)
4. Run the app:
   `npm run dev`

## How search works

1. The server asks Gemini to research the laptop with **Google Search grounding** (model name, series, or part number).
2. A second call converts the research report into a fixed JSON schema (display, CPU, GPU, RAM, storage, battery...) with a match status, "did you mean" suggestions and a confidence level per variant.
3. Source links from the grounding metadata are shown under the results.
4. **Search by label photo**: the camera button uploads a photo of the laptop's bottom sticker; `/api/identify` reads the model name and part number (ignoring serial and regulatory numbers) and runs the search.
5. **History & autocomplete**: successful searches are saved in the browser (localStorage, last 30). Re-opening a saved search costs no API call; "تحديث من الإنترنت" refreshes it. Typing shows suggestions from past queries and from model names found in past results.
6. Results are cached in memory for 7 days per normalized query, and `/api/specs` is rate limited to 30 requests per minute per IP (shared with `/api/identify`).

## Password protection

Set `APP_PASSWORD` (and optionally `APP_USERNAME`, default `user`) to protect the whole app, page and API, with HTTP Basic auth.
In production (`NODE_ENV=production`) the server refuses to start without `APP_PASSWORD`. After 20 failed logins from one IP, logins are blocked for 15 minutes.

## Deploy with Portainer + Traefik

`docker-compose.yml` follows the same layout as the other AI apps on the server (Traefik on `automation-stack_automation-network`, `websecure` entrypoint, `letsencrypt` resolver).

1. Portainer → Stacks → Add stack → **Repository**: this repo, branch `main` (or the feature branch), compose path `docker-compose.yml`.
2. Environment variables:

   | Variable | Required | Default |
   |---|---|---|
   | `GEMINI_API_KEY` | yes | |
   | `APP_PASSWORD` | yes | |
   | `APP_USERNAME` | no | `user` |
   | `APP_DOMAIN` | no | `specs.aaaaaaaaa9000.cloud` |
   | `GEMINI_MODEL` | no | `gemini-2.5-flash` |
   | `RATE_LIMIT_PER_MINUTE` | no | `30` |

3. Make sure `APP_DOMAIN` has a DNS record pointing to the server, then deploy. Use **Pull and redeploy** to update.
