# SachCheck pilot

Small, dependency-free Node.js web app prototype. It checks pasted claims against previously published fact-checks, recent news coverage, and (when configured) a Gemini web-grounded evidence summary.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and add provider keys. `.env` is ignored by Git.
3. Run `node server.js` from this folder.
4. Open `http://localhost:3000`.

The GDELT news lookup runs without a key. Gemini adds live web-grounded analysis and source citations. Google Fact Check Tools adds matching prior fact-checks. Without keys, the app returns source results where available and does not invent a verdict.

## Provider setup

- Gemini API key: <https://aistudio.google.com/apikey>
- Google Fact Check Tools API: create a key in Google Cloud Console and enable the Fact Check Tools API for that project.

Keep keys on the server in `.env` or deployment secrets. Do not put them in `app.js`, `index.html`, or client-side storage. Free provider quotas and data-use terms can change; check them before a public pilot.

## Current scope

Use pasted claims or transcripts for dependable checks. A social post URL alone does not give this app permission or technical access to download the video/transcript; private/login-gated content is not fetched. The app searches the URL text if entered as a claim but does not scrape social platforms. Automated results are research assistance, not a definitive truth determination.
