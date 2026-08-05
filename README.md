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

## Features

- **Dual Rendering Engines**: Render compositions with **Remotion** (React-based canvas) or **Hyperframes** (HTML/CSS keyframe timeline).
- **BYOB (Bring Your Own Key)**: Pass custom Gemini API keys directly from the UI header without server dependencies.
- **AI Create Mode**: Enter a text prompt to generate complete scripts, scene layouts, word-level timings, and video compositions.
- **AI Editor Mode**: Natural language video editing ("Make captions Hormozi style with yellow pop").
- **Automated CI/CD**: Automatic zero-downtime deployment to Azure VM via GitHub Actions on every push to `master`.

## Deployment

Deploy automatically to your Azure VM using GitHub Actions or manually via Docker Compose:

```bash
docker-compose --env-file .env.production up -d --build
```
