# AI Chat

A modern AI chat application built with **Nuxt 4, Vue 3, TypeScript, and Ollama**. Chat with AI models through a clean interface, authenticate with GitHub, and persist conversations in a database.

<p align="center">
  <a href="https://ai-chat-amir-ashrafi.vercel.app">
    <strong>Live Demo</strong>
  </a>
</p>

---

## Overview

AI Chat is a web application that combines a modern conversational interface with server-side AI integration, user authentication, and persistent chat history.

The application supports locally hosted language models through Ollama. The web application can be deployed to Vercel while the AI model runs on a separate computer connected through an authenticated HTTPS tunnel.

## Features

- **AI Chat Interface** — Interact with supported AI language models.
- **Local AI Inference** — Run Qwen 2.5 1.5B through Ollama.
- **GitHub Authentication** — Sign in using GitHub OAuth.
- **Persistent Conversations** — Store chats and messages in a database.
- **Streaming Responses** — Support streaming AI responses through the AI SDK.
- **Server-Side API Routes** — Process chat requests on the Nuxt server.
- **Database Integration** — Manage data with Drizzle ORM and Turso/libSQL.
- **Production Deployment** — Deploy the web application to Vercel.
- **Secure Proxy Access** — Protect remote access to the local Ollama API with a bearer token.

## Tech Stack

| Technology | Purpose |
|---|---|
| Nuxt 4 | Full-stack application framework |
| Vue 3 | Reactive user interface |
| TypeScript | Type safety |
| AI SDK | AI model integration and streaming |
| `ai-sdk-ollama` | Ollama model integration |
| Ollama | Local language model runtime |
| Qwen 2.5 1.5B | Local language model |
| Drizzle ORM | Database access and schema management |
| Turso / libSQL | Persistent database |
| GitHub OAuth | Authentication |
| NuxtHub | Application infrastructure |
| Vercel | Hosting and deployment |
| Tailscale Funnel | HTTPS access to the local AI proxy |

## Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.com/) for local AI inference
- A configured Turso database
- A GitHub OAuth application

### 1. Clone the Repository

```bash
git clone <https://github.com/amir-ashrafi/AI-Chat>
cd chatbot
```

Replace `<https://github.com/amir-ashrafi/AI-Chat>` with your Git repository URL.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env
```

Open `.env` and configure the variables required by your application.

Important variables include:

# Vercel AI Gateway — Vercel Dashboard → AI Gateway
AI_GATEWAY_API_KEY="your-vercel-ai-gateway-api-key"

# Anthropic — https://console.anthropic.com/
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Vercel Blob — Vercel Dashboard → Storage → Blob
BLOB_READ_WRITE_TOKEN="your-vercel-blob-read-write-token"

# Google Gemini — https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY="your-google-generative-ai-api-key"

# Groq — https://console.groq.com/keys
GROQ_API_KEY="your-groq-api-key"

# GitHub OAuth — https://github.com/settings/developers
# OAuth Apps → Your Application
NUXT_OAUTH_GITHUB_CLIENT_ID="your-github-oauth-client-id"
NUXT_OAUTH_GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# Generate a secure random session password
# Example: openssl rand -hex 32
NUXT_SESSION_PASSWORD="your-long-random-session-secret"

# Local Ollama endpoint for local development
OLLAMA_BASE_URL="http://127.0.0.1:11434/v1"

# OpenAI — https://platform.openai.com/api-keys
OPENAI_API_KEY="your-openai-api-key"

# Turso — https://turso.tech/
# Database → Generate database token
TURSO_AUTH_TOKEN="your-turso-database-auth-token"

# Turso Dashboard → Your Database → Connection URL
TURSO_DATABASE_URL="libsql://your-database-name-your-org.turso.io"

# Vercel CLI-generated token for supported development workflows
# Usually managed by Vercel CLI; do not copy a personal token into the example
VERCEL_OIDC_TOKEN=""

# Remote Ollama proxy — configure in Vercel Environment Variables
# Replace with your public HTTPS Tailscale Funnel URL
NUXT_OLLAMA_BASE_URL="https://your-tailscale-funnel-address"

# Private proxy token generated in ~/ollama-proxy/.token
NUXT_OLLAMA_PROXY_TOKEN="your-private-ollama-proxy-token"


Only configure the providers and services used by your application.

**Security:** Never commit your `.env` file, API keys, OAuth secrets, session passwords, or proxy tokens to Git.

### 4. Set Up Ollama

Install Ollama and download the model:

```bash
ollama pull qwen2.5:1.5b
```

Verify the installed model:

```bash
ollama list
```

Check the local Ollama API:

```bash
curl http://127.0.0.1:11434/api/tags
```

The response should include `qwen2.5:1.5b`.

### 5. Run the Development Server

Start the application:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:3000
```

## Local AI Architecture

The application can run on Vercel while using a language model hosted on your own computer.

```text
+----------------------+
|    User's Browser    |
+----------------------+
           |
           v
+----------------------+
|   Nuxt App on Vercel |
+----------------------+
           |
           v
+----------------------+
| Authenticated HTTPS  |
|       Tunnel         |
+----------------------+
           |
           v
+----------------------+
|    Local Proxy       |
|   Port 11435         |
+----------------------+
           |
           v
+----------------------+
|    Ollama API        |
|   Port 11434         |
+----------------------+
           |
           v
+----------------------+
|     Qwen 2.5 1.5B    |
+----------------------+
```

### Remote Ollama Configuration

When connecting Vercel to a local Ollama instance:

1. Ollama must be running on your computer.
2. The authenticated proxy must be running.
3. Tailscale Funnel must be available.
4. The Vercel environment must contain the correct proxy URL and token.
5. The proxy must forward requests to the local Ollama API.

The Ollama API should not be exposed directly to the public internet. Use the authenticated proxy for remote access.

### Important Availability Note

When the AI model runs on a personal computer, AI requests depend on that computer being powered on, connected to the internet, and running Ollama and the proxy.

The website can remain online on Vercel while the local AI model is unavailable.

For continuous AI availability, consider hosting Ollama on an always-on server.

## Database

The application uses Drizzle ORM with Turso/libSQL for persistent data.

Configure the database connection using:

```dotenv
TURSO_DATABASE_URL="your-turso-database-url"
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

Follow the database and migration commands defined by the project. Do not assume migrations are applied automatically in production.

## GitHub OAuth Setup

1. Open [GitHub Developer Settings](https://github.com/settings/developers).
2. Create or select your OAuth application.
3. Configure the application homepage URL.
4. Set the authorization callback URL to the exact callback endpoint used by the application.
5. Add the OAuth client ID and client secret to the environment variables.
6. Configure the production callback URL for your deployed domain.

The callback URL must match the URL sent by the application during authentication.

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Configure the required production environment variables.
4. Configure the Turso database and GitHub OAuth application.
5. Set the Ollama proxy URL and token if using local AI inference.
6. Deploy the application.
7. Test authentication, database persistence, and AI responses.

After updating environment variables, trigger a new deployment to apply the changes.

## Available Scripts

Common Nuxt commands include:

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

Check `package.json` to confirm which scripts are available in this project.

## Security

- Keep API keys and credentials in private environment variables.
- Never expose secrets through `NUXT_PUBLIC_` variables.
- Never commit `.env` files to version control.
- Use a strong, randomly generated session password.
- Protect the Ollama proxy with bearer-token authentication.
- Use HTTPS for remote connections.
- Rotate credentials immediately if they are exposed.
- Keep dependencies up to date.

## Future Improvements

- Add automated tests.
- Improve error handling and connection status feedback.
- Add conversation search and organization.
- Improve accessibility and mobile responsiveness.
- Add support for additional AI models.
- Host the AI model on dedicated infrastructure for continuous availability.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute this project under an open-source license.

---

**Built with Nuxt, Vue, TypeScript, and Ollama.**
