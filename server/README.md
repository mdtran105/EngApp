# Server: AssemblyAI TTS Proxy

This server contains a small proxy endpoint that calls AssemblyAI Text-to-Speech on behalf of the client so the API key is not exposed to browsers.

Environment variable required:

- `ASSEMBLYAI_API_KEY` — your AssemblyAI API key.

Endpoint:

- `POST /api/tts`
  - Body: `{ "text": "...", "voice": "optional-voice" }`
  - Response: `{ "audioUrl": "https://..." }`

Notes:

- The controller will attempt to poll AssemblyAI for the generated audio if the service returns an ID instead of an immediate `audio_url`.
- This project uses `axios` (already present in `package.json`).
