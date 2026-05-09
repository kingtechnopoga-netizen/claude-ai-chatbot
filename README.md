# Claudia AI

A Claude.ai-inspired chatbot built with [Puter.js](https://docs.puter.com/). Chat with Claude, GPT, Gemini, DeepSeek, Llama, and more — all from one clean, mobile-friendly interface.

No API keys. No backend. Just open `index.html`.

## Features

- **17+ AI models** — Claude Sonnet/Opus, GPT-5, GPT-4o, Gemini 2.5, DeepSeek, Llama 4, Mistral, Grok
- **Streaming responses** with markdown + code highlighting
- **Image understanding** — upload, paste, or drag-drop images (vision-capable models)
- **Image generation** — DALL-E-style text-to-image
- **Conversation history** saved locally in your browser
- **Dark / light theme** (Claude.ai palette)
- **Mobile-first responsive design** — looks great on phones and tablets
- **Keyboard shortcuts** — `Ctrl/Cmd+K` for new chat, `Esc` to close menus
- **No build step** — pure HTML + CSS + vanilla JS

## Run locally

Just open `index.html` in your browser. That's it.

Or serve it with any static server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy

### Render (one-click)

This repo includes a `render.yaml` blueprint. To deploy:

1. Go to [dashboard.render.com/select-repo?type=blueprint](https://dashboard.render.com/select-repo?type=blueprint)
2. Connect your GitHub and pick `claudeaichat`
3. Click **Apply** — Render reads `render.yaml` and deploys automatically
4. You get a free URL like `https://claudia-ai.onrender.com`

### Other hosts

Works on any static host: GitHub Pages, Netlify, Vercel, Cloudflare Pages, Puter, etc. Just upload the files.

## Tech

- [Puter.js](https://js.puter.com/v2/) for AI access (free, users cover usage)
- Vanilla JavaScript — no frameworks, no build tools

## File structure

```
.
├── index.html    # Markup
├── styles.css    # Claude-inspired dark/light theme
├── app.js        # Chat logic, streaming, model switching, image gen
└── README.md
```

## License

MIT
