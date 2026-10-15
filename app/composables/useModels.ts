import { MODELS } from '#shared/utils/models'

const DEFAULT_MODEL = MODELS.find(m => m.value === 'ollama/qwen2.5:1.5b')?.value ?? MODELS[0]!.value

function resolveModelValue(value: string | null | undefined) {
  if (value && MODELS.some(m => m.value === value)) {
    return value
  }

  const byLabel = MODELS.find(m => m.label === value)
  return byLabel?.value ?? DEFAULT_MODEL
}

export function useModels() {
  const model = useCookie<string>('model', { default: () => DEFAULT_MODEL })
  const resolved = resolveModelValue(model.value)

  if (model.value !== resolved) {
    model.value = resolved
  }

  return {
    models: MODELS,
    model
  }
}
