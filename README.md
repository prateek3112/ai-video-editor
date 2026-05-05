<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9aab0b61-cf3c-4e76-91db-acb508207dad

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Local Real AI Notes

- Uploads are stored locally in `public/uploads`.
- Rendered outputs are written to `public/renders`.
- Transcription uses Gemini (`gemini-2.5-flash`) when `GEMINI_API_KEY` is set.
- Export rendering uses local FFmpeg via `@ffmpeg-installer/ffmpeg`.

If Gemini fails or key is missing, the app falls back to deterministic local captions so editing still works.
