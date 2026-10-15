import type { UIMessage } from 'ai'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  isStepCount,
  smoothStream,
  streamText,
  toUIMessageStream
} from 'ai'

import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic'
import { anthropic } from '@ai-sdk/anthropic'

import type { GoogleLanguageModelOptions } from '@ai-sdk/google'
import { google } from '@ai-sdk/google'

import type { OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { createOllama } from 'ai-sdk-ollama'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

function getOllamaHost(url: string) {
  return url.replace(/\/v1\/?$/, '')
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An error occurred.'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const ollama = createOllama({
    baseURL: getOllamaHost(config.ollamaBaseURL)
  })
  const groq = createOpenAI({
    name: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: config.groqApiKey
  })
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string()
    }).parse
  )

  const { model, messages, webSearch, reasoning } = await readValidatedBody(
    event,
    z.object({
      model: z.string().refine(
        value => MODELS.some(m => m.value === value),
        {
          message: 'Invalid model'
        }
      ),
      messages: z.array(z.custom<UIMessage>()),
      webSearch: z.boolean().default(true),
      reasoning: z.boolean().default(true)
    }).parse
  )

  const chat = await db.query.chats.findFirst({
    where: () =>
      and(
        eq(schema.chats.id, id as string),
        eq(schema.chats.userId, session.user?.id || session.id)
      ),
    with: {
      messages: true
    }
  })

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found'
    })
  }

  /*
   * Generate chat title directly with OpenAI
   * instead of Vercel AI Gateway.
   */
  if (!chat.title) {
    try {
      const { text: title } = await generateText({
        model: model.startsWith('ollama/')
          ? ollama(model.replace('ollama/', ''))
          : model.startsWith('groq/')
          ? groq.chat(model.replace('groq/', ''))
          : openai('gpt-5-nano'),
        instructions: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
        prompt: JSON.stringify(messages[0])
      })

      await db
        .update(schema.chats)
        .set({ title })
        .where(eq(schema.chats.id, id as string))
    } catch (error) {
      console.error('Failed to generate chat title', error)
    }
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db
      .insert(schema.messages)
      .values({
        id: lastMessage.id,
        chatId: id as string,
        role: 'user',
        parts: lastMessage.parts
      })
      .onConflictDoUpdate({
        target: schema.messages.id,
        set: {
          parts: lastMessage.parts
        }
      })
  }

  /*
   * Web search is a provider-defined tool.
   *
   * Anthropic:
   * anthropic.tools.webSearch_20250305()
   *
   * OpenAI:
   * openai.tools.webSearch()
   */
  const webSearchTool = webSearch
    ? model.startsWith('anthropic/')
      ? anthropic.tools.webSearch_20250305()
      : model.startsWith('openai/')
        ? openai.tools.webSearch()
        : undefined
    : undefined

  const webSearchInstructions = webSearchTool
    ? `**WEB SEARCH:**
- You have access to a web search tool to find current, up-to-date information
- Only use it when the user explicitly asks about recent events, real-time data, or current facts
- Do NOT search proactively — rely on your knowledge first
- Cite your sources when providing information from web search results

`
    : ''

  /*
   * Convert model name from:
   *
   * openai/gpt-5-nano
   *
   * to:
   *
   * openai('gpt-5-nano')
   *
   * This removes the dependency on Vercel AI Gateway.
   */
  const isOllama = model.startsWith('ollama/')
  const enableReasoning = reasoning && !isOllama

  const aiModel = model.startsWith('openai/')
  ? openai(model.replace('openai/', ''))
  : model.startsWith('anthropic/')
    ? anthropic(model.replace('anthropic/', ''))
    : model.startsWith('google/')
      ? google(model.replace('google/', ''))
      : model.startsWith('groq/')
        ? groq.chat(model.replace('groq/', ''))
        : isOllama
          ? ollama(model.replace('ollama/', ''))
          : undefined

  if (!aiModel) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported AI provider: ${model}`
    })
  }

  const abortController = new AbortController()

  event.node.req.on('close', () => {
    abortController.abort()
  })

  const stream = createUIMessageStream({
    onError: getErrorMessage,
    execute: async ({ writer }) => {
      const result = streamText({
        abortSignal: abortController.signal,

        /*
         * IMPORTANT:
         * Previously this was:
         *
         * model,
         *
         * which sends the string to the AI Gateway.
         *
         * Now we send the actual provider model.
         */
        model: aiModel,

        instructions: `You are a knowledgeable and helpful AI assistant. ${
          session.user?.username
            ? `The user's name is ${session.user.username}.`
            : ''
        } Your goal is to provide clear, accurate, and well-structured responses.

**FORMATTING RULES (CRITICAL):**
- ABSOLUTELY NO MARKDOWN HEADINGS: Never use #, ##, ###, ####, #####, or ######
- NO underline-style headings with === or ---
- Use **bold text** for emphasis and section labels instead
- Examples:
  * Instead of "## Usage", write "**Usage:**" or just start directly with content
  * Instead of "# Complete Guide", write "**Complete Guide**" or start directly with content
- Start all responses with content, never with a heading

${webSearchInstructions}

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Break down complex topics into digestible parts
- Maintain a friendly, professional tone`,

        messages: await convertToModelMessages(messages),

        tools: {
          chart: chartTool,
          weather: weatherTool,
          ...(webSearchTool && {
            web_search: webSearchTool
          })
        },

        providerOptions: {
          anthropic: {
            thinking: enableReasoning
              ? {
                  type: 'enabled',
                  budgetTokens: 2048
                }
              : {
                  type: 'disabled'
                }
          } satisfies AnthropicLanguageModelOptions,

          google: {
            thinkingConfig: {
              includeThoughts: enableReasoning,
              thinkingLevel: 'low'
            }
          } satisfies GoogleLanguageModelOptions,

          openai: {
            reasoningEffort:
              enableReasoning || webSearchTool
                ? 'low'
                : 'minimal',

            ...(enableReasoning && {
              reasoningSummary: 'detailed'
            })
          } satisfies OpenAILanguageModelResponsesOptions
        },

        stopWhen: isStepCount(5),

        experimental_transform: smoothStream()
      })

      if (!chat.title) {
        writer.write({
          type: 'data-chat-title',
          data: {
            message: 'Generating title...'
          },
          transient: true
        })
      }

      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          sendSources: true,
          sendReasoning: enableReasoning,
          onError: getErrorMessage
        })
      )
    },

    onEnd: async ({ messages }) => {
      await db
        .insert(schema.messages)
        .values(
          messages.map(message => ({
            id: message.id,
            chatId: chat.id,
            role: message.role as 'user' | 'assistant',
            parts: message.parts
          }))
        )
        .onConflictDoNothing()
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})