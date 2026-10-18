# AI Chat

A modern AI chat application built with **Nuxt 4, Vue 3, TypeScript, and the Vercel AI SDK**. It supports hosted AI providers and a locally hosted language model through Ollama, with GitHub authentication and persistent chat history.

<p align="center">
  <a href="https://ai-chat-amir-ashrafi.vercel.app"><strong>Live Demo</strong></a>
</p>

## Overview

AI Chat supports two ways to generate AI responses:

1. **Online AI providers** — The application can connect to providers such as Vercel AI Gateway, Anthropic, Google Generative AI, Groq, and OpenAI, provided that the relevant provider is implemented and configured in the project. These services usually require internet access and an API key.
2. **Local AI with Ollama** — The application can send prompts to a model running on a computer that has Ollama installed. This project uses `qwen2.5:1.5b` as its example local model. The model is downloaded to the host computer and can generate responses locally without calling a hosted AI provider.

**Important:** “Local AI” describes where the model runs; it does not automatically mean that the entire website works offline. Authentication, the hosted website, and a remote database may still require an internet connection.

## How local Ollama works

There are two distinct ways to use the local model. Choose the setup that matches how the application is running.

### Option A: Run the application and Ollama on the same computer

This is the simplest local setup:

```text
Browser
   |
   v
Nuxt application running on the computer
   |
   v
Ollama API at 127.0.0.1:11434
   |
   v
qwen2.5:1.5b running on that computer
```

When someone clones and runs the application on their own computer, they can use that computer's Ollama instance after installing Ollama and downloading the model. Each computer needs its own model download and enough memory and processing power to run it.

### Option B: The website is deployed to Vercel, but Ollama runs on one computer

A deployed Vercel application cannot use a website visitor's `127.0.0.1`. From a server-side API route, `127.0.0.1` means the server environment where that route is running, not the visitor's laptop.

To let the deployed website use Ollama on a separate computer, this project can route requests through an authenticated proxy and a Tailscale Funnel HTTPS endpoint:

```text
User's browser
      |
      v
Nuxt application on Vercel
      |
      v
Authenticated HTTPS endpoint (Tailscale Funnel)
      |
      v
Proxy on the designated computer (port 11435)
      |
      v
Ollama API on that computer (port 11434)
      |
      v
qwen2.5:1.5b
```

In this arrangement, **all visitors using the deployed local-model option share the same designated Ollama host**. They do not automatically use their own laptops. The host computer must remain powered on, connected to the internet, and running Ollama, the proxy, and Funnel.

If every visitor must use their own computer's model, each visitor needs to run the application and Ollama locally, or the project needs a separate browser-to-local-Ollama design. That is not achieved by the Vercel-to-one-laptop proxy described above.

## Features

- AI chat interface with support for configured AI providers
- Local model inference through Ollama
- GitHub OAuth authentication
- Persistent conversations and messages
- Streaming AI responses, where supported by the selected provider
- Server-side API routes for AI requests
- Drizzle ORM with Turso/libSQL
- Vercel deployment
- Optional authenticated remote access to a local Ollama instance

## Tech stack

| Technology | Purpose |
|---|---|
| Nuxt 4 | Full-stack application framework |
| Vue 3 | Reactive user interface |
| TypeScript | Type safety |
| Vercel AI SDK | AI integration and response streaming |
| `ai-sdk-ollama` | Ollama model integration, if used by the current server implementation |
| Ollama | Local language-model runtime |
| Qwen 2.5 1.5B | Example local language model |
| Drizzle ORM | Database queries and schema management |
| Turso / libSQL | Persistent database |
| GitHub OAuth | Authentication |
| Vercel | Application hosting |
| Tailscale Funnel | Optional HTTPS access to the remote local-AI proxy |

## Prerequisites

Install the tools and configure the services required by your chosen setup:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (or the package manager used by the repository lockfile)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.com/download) for local AI
- A [Turso](https://turso.tech/) database, if using the configured database integration
- A [GitHub OAuth application](https://github.com/settings/developers), if using GitHub sign-in
- A Vercel account, if deploying the web application to Vercel
- Tailscale, only if exposing a local Ollama proxy to the deployed website

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/amir-ashrafi/AI-Chat.git
cd AI-Chat
```

Use the actual repository URL if the project has been moved or renamed.

### 2. Install dependencies

If the repository uses pnpm:

```bash
pnpm install
```

Use the package manager corresponding to the committed lockfile. Check `package.json` before relying on any script name.

### 3. Configure environment variables

Create a local `.env` or `.env.local` file, according to the project's configuration. The following is a reference template; only set variables that the current code actually reads.

```dotenv
# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=""
NUXT_OAUTH_GITHUB_CLIENT_SECRET=""

# Session: use a long, random secret value
NUXT_SESSION_PASSWORD=""

# Turso / libSQL
TURSO_DATABASE_URL=""
TURSO_AUTH_TOKEN=""

# Ollama: local host example.
# The exact base URL depends on the provider/client used in the server code.
# Native Ollama API clients commonly use http://127.0.0.1:11434.
# OpenAI-compatible clients commonly use http://127.0.0.1:11434/v1.
OLLAMA_BASE_URL="http://127.0.0.1:11434"

# Used by this project's server code for the remote proxy URL, if applicable.
# For a deployed setup, replace the example with the HTTPS hostname shown by Tailscale Funnel.
NUXT_OLLAMA_BASE_URL=""

# Keep this server-side secret identical to the token expected by the proxy.
NUXT_OLLAMA_PROXY_TOKEN=""

# Online AI providers: fill in only providers implemented and enabled by the application.
AI_GATEWAY_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""
GROQ_API_KEY=""
OPENAI_API_KEY=""

# Optional services, only if used by the project
BLOB_READ_WRITE_TOKEN=""
```

**Check the actual server code before choosing the Ollama URL format.** The native Ollama API and its OpenAI-compatible API use different endpoint paths. Do not append `/v1` unless the configured client expects the OpenAI-compatible endpoint. Likewise, `NUXT_OLLAMA_BASE_URL` must match how the application builds requests to the proxy.

Never put secrets in `NUXT_PUBLIC_*` variables, commit environment files, or expose API tokens in browser-side code. Keep `.env`, `.env.local`, and other files containing secrets out of Git.

### 4. Install and test the local model

Install Ollama from the [official download page](https://ollama.com/download), then download the model. This download is required the first time on each computer:

```bash
ollama pull qwen2.5:1.5b
```

List locally available models:

```bash
ollama list
```

Run the model interactively:

```bash
ollama run qwen2.5:1.5b
```

Check the local API:

```bash
curl http://127.0.0.1:11434/api/tags
```

The response should list `qwen2.5:1.5b` if the model has been downloaded successfully.

Ollama often runs as a background service after installation. If it is not running, start it in a separate terminal:

```bash
ollama serve
```

If Ollama reports that the address or port is already in use, it may already be running. Do not start multiple instances unnecessarily.

### 5. Start the Nuxt application

```bash
pnpm dev
```

Open the local address printed by Nuxt, commonly:

```text
http://localhost:3000
```

For a local setup, make sure the server-side AI route is configured to reach the Ollama instance on the same computer. If the application uses a remote proxy configuration instead, adjust the local environment variables to match the code before testing.

## Running the remote local-AI proxy

Use this section only if the application is deployed to Vercel while Ollama runs on a separate computer. It assumes an authenticated proxy already exists in `~/ollama-proxy/server.js` and listens on `127.0.0.1:11435`. If that file or proxy implementation does not exist, these commands alone will not create it.

### 1. Start Ollama and verify the model

```bash
ollama list
curl http://127.0.0.1:11434/api/tags
```

If needed, start Ollama:

```bash
ollama serve
```

### 2. Start the authenticated proxy

In a separate terminal:

```bash
cd ~/ollama-proxy
node server.js
```

The proxy should listen only on loopback, for example:

```text
Authenticated Ollama proxy listening on 127.0.0.1:11435
```

The proxy's configured bearer token must match `NUXT_OLLAMA_PROXY_TOKEN` in the Vercel environment. Follow the variable names expected by the actual `server.js`; do not assume that setting a Nuxt environment variable automatically configures a separately run Node.js process.

### 3. Check proxy authentication

A request without a bearer token should be rejected. For example:

```bash
curl -i http://127.0.0.1:11435/api/tags
```

A `401 Unauthorized` response is expected when no valid token is provided. Test an authorized request using the token privately configured for the proxy:

```bash
curl -i \
  -H "Authorization: Bearer YOUR_PROXY_TOKEN" \
  http://127.0.0.1:11435/api/tags
```

Replace `YOUR_PROXY_TOKEN` locally; never commit it or publish it in documentation, logs, screenshots, or chat messages.

### 4. Enable Tailscale Funnel

Install Tailscale and sign in on the computer that hosts Ollama. Check the connection:

```bash
tailscale status
```

Expose the proxy port through Funnel:

```bash
tailscale funnel --bg 11435
```

Check the configured public endpoint:

```bash
tailscale funnel status
```

Use the HTTPS hostname shown by the command as the remote proxy URL in the server environment. Do not assume that a hostname from an example is your own hostname.

**Security:** Never expose Ollama's port `11434` directly to the public internet. Expose only the authenticated proxy, keep its token secret, use HTTPS, and restrict the proxy to the endpoints and HTTP methods the application needs.

### 5. Configure Vercel

In your Vercel project settings, add the environment variables required by your server code. For the remote local-model route, this typically means:

- `NUXT_OLLAMA_BASE_URL`: the HTTPS base URL provided by Tailscale Funnel, formatted exactly as expected by your provider/proxy implementation.
- `NUXT_OLLAMA_PROXY_TOKEN`: the same strong bearer token expected by the proxy.
- Database and OAuth variables required by the app.
- API keys for any online providers you use.

Do not set the remote target to `http://127.0.0.1:11434` expecting it to reach your laptop. In Vercel, that address refers to the Vercel runtime. After changing Vercel environment variables, create a new deployment so the deployment receives the new values.

## Starting and stopping the local AI host

### When you want the deployed website to use your laptop's model

1. Turn on the laptop and connect it to the internet.
2. Verify that Ollama is running and `qwen2.5:1.5b` is installed.
3. Start the authenticated proxy with `node server.js` if it is not already running.
4. Check Tailscale connectivity and run `tailscale funnel status`.
5. Send a test message through the deployed website.

The exact processes that need manual startup depend on how Ollama and the proxy are installed as services on your operating system.

### When you want to turn the laptop off

1. Stop the proxy terminal with `Ctrl+C`, unless it is managed by a service.
2. You can turn off the laptop; there is no need to delete or redeploy the Vercel website just for this.
3. The website may still load, and configured online AI providers may still work. However, requests routed to the laptop's local model will fail until the laptop, Ollama, proxy, and Funnel are available again.

The model is stored on disk after download, so shutting down does not normally require downloading it again. Network usage still occurs when visitors load the website, send prompts, receive responses, use authentication, or access remote services.

### VPN considerations

A VPN can affect routing or connectivity, depending on the VPN and its configuration. First test the complete setup without the VPN, then connect the VPN and repeat the test. If the remote model stops responding, check `tailscale status`, `tailscale funnel status`, proxy logs, and the exact proxy URL and token configuration.

## Database setup

Configure the Turso/libSQL connection using the values required by the project:

```dotenv
TURSO_DATABASE_URL="your-turso-database-url"
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

Run the migration and database commands defined in `package.json` and the project's Drizzle configuration. Do not assume production migrations are applied automatically; confirm the database schema is up to date before using the deployed application.

## GitHub OAuth setup

1. Open [GitHub Developer Settings](https://github.com/settings/developers).
2. Create or select the OAuth application.
3. Set the application homepage URL.
4. Set the authorization callback URL to the exact callback endpoint implemented by this project.
5. Configure the OAuth client ID and client secret in the local environment and in Vercel.
6. Verify the production callback URL matches the value expected by the application.

The callback URL must exactly match the one used by the application.

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Configure the production environment variables.
4. Configure Turso and GitHub OAuth if the application uses them.
5. If using local AI from the deployed website, configure the authenticated proxy URL and token.
6. Deploy and test authentication, database persistence, and AI responses for each configured provider.

A Vercel deployment does not host the Ollama model itself. It calls the configured Ollama host through the proxy when the local-model option is selected. If you need local AI to be available 24/7, use an always-on server or host the model on suitable infrastructure.

## Available scripts

Common commands may include:

```bash
pnpm dev       # Start the development server
pnpm build     # Build the application
pnpm preview   # Preview the production build
```

Confirm the exact script names in `package.json`. Use `npm run <script>` instead if the project is configured for npm.

## Troubleshooting

| Problem | What to check |
|---|---|
| Ollama API is unreachable | Check `ollama list`, start Ollama if needed, and test `curl http://127.0.0.1:11434/api/tags`. |
| Model not found | Run `ollama pull qwen2.5:1.5b` on the computer that will host the model. |
| Proxy returns `401` | Confirm the bearer token in the request matches the token configured in the proxy and server environment. |
| Proxy returns `502` or connection refused | Check that Ollama and the proxy are running and that the proxy forwards to the correct local port. |
| Deployed local AI stops responding | Check whether the host laptop is sleeping, offline, or running without Ollama, proxy, or Funnel. |
| Vercel cannot reach `127.0.0.1` | Use the configured remote HTTPS proxy endpoint; Vercel's loopback address is not your laptop. |
| Environment changes seem ignored | Verify the correct Vercel environment (Production/Preview/Development) and redeploy. |
| Responses are slow | Check the host's RAM, CPU/GPU, model size, and other running workloads. |

## Security

- Keep API keys, OAuth secrets, session passwords, database tokens, and proxy tokens private.
- Never commit `.env` files or credentials to version control.
- Never expose secrets through `NUXT_PUBLIC_*` variables.
- Use a long, randomly generated session password and a strong proxy token.
- Use HTTPS for remote access and authenticate every proxy request.
- Do not expose the Ollama API port directly to the public internet.
- Restrict proxy routes and allowed methods to what the application requires.
- Rotate any credential that may have been exposed.
- Keep dependencies and services updated.

## Future improvements

- Add automated unit and integration tests.
- Improve provider status, timeouts, and error messages when local Ollama is unavailable.
- Add conversation search and organization.
- Improve accessibility and mobile responsiveness.
- Let users choose between configured online providers and the local model in the interface.
- Add a managed, always-on host if continuous local-model availability is required.

## References

- [Ollama downloads](https://ollama.com/download)
- [Ollama API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Ollama OpenAI compatibility](https://ollama.com/blog/openai-compatibility)
- [Tailscale Funnel documentation](https://tailscale.com/docs/features/tailscale-funnel)
- [Tailscale Funnel CLI reference](https://tailscale.com/docs/reference/tailscale-cli/funnel)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [GitHub OAuth applications](https://github.com/settings/developers)

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute this project as open source.

---

**Built with Nuxt, Vue, TypeScript, and Ollama.**
