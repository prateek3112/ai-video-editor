# Professional Video Editor Roadmap

## Goal

Turn CaptionAI into an agent-editable video editor where Codex can make structured professional edits: multilingual captions, caption styles, motion effects, overlays, transitions, sound effects, and deterministic final renders.

## Editing Model

The source of truth should be a timeline edit plan, not FFmpeg strings or UI-only state.

- `video` clips: A-roll, B-roll, trims, media offsets, volume
- `caption` clips: text, timestamps, language/script, style, per-caption position
- `overlay` clips: logos, lower thirds, text cards, social UI, image layers
- `effect` clips: blur, color grade, zooms, flicker, grain, vignette
- `transition` clips: flash white, blur dissolve, whip pan, zoom cut, glitch
- `audio` and `sfx` clips: source audio, music, whooshes, pops, impacts, risers

The initial implementation lives in:

- `lib/edit-plan.ts`
- `lib/effects-registry.ts`
- `lib/composition-compiler.ts`
- `app/api/edit-plan/route.ts`
- `app/api/render/hyperframes/route.ts`

## Rendering Strategy

Keep two render paths:

1. Fast FFmpeg render for current caption exports.
2. Hyperframes-style composition render for rich animated edits.

The Hyperframes path compiles the project into `public/compositions/{projectId}/index.html` plus `edit-plan.json`. This gives Codex a plain HTML/timeline artifact to inspect, modify, preview, and eventually render through Hyperframes.

## Codex Workflow

For a user prompt like "make this a viral Hinglish reel with Cove captions, blur intro, zooms, whooshes, and overlays":

1. Load the project and transcript.
2. Generate an edit plan.
3. Apply structured edit commands.
4. Compile a Hyperframes composition.
5. Preview and inspect frames.
6. Render final MP4.
7. Iterate based on user feedback.

## Next Implementation Steps

1. Add UI buttons to generate and open the Hyperframes composition.
2. Add real SFX assets under `public/sfx`.
3. Add per-effect compilers for blur, flicker, light leaks, zoom cuts, lower thirds, and animated overlays.
4. Add a Codex/Gemini planner endpoint that turns natural language into `EditCommand[]`.
5. Add frame extraction QA so rendered videos can be checked visually before delivery.
6. Add a proper render worker that can run `hyperframes render` when the dependency is installed.
