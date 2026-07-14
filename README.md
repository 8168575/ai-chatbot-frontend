# AI-CHATBOT-FRONTEND

Live frontend: https://ai-chatbot-frontend-roan-psi.vercel.app/

Vite + React frontend for the HFM Campus AI chatbot.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Environment variable:

- `VITE_BACKEND_URI` for the deployed backend API base, for example `https://ai-chatbot-backend-zgi1.onrender.com/api`

## Vercel

- Framework preset: `Vite`
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`

Set this environment variable in Vercel:

- `VITE_BACKEND_URI`
