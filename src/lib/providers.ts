import type { AiProvider } from '@/types'

export interface ProviderModel {
  id: string
  label: string
  hint?: string
}

export interface ProviderMeta {
  id: AiProvider
  label: string
  tagline: string
  keyHint: string
  docsUrl: string
  defaultBaseUrl: string
  models: ProviderModel[]
  defaultModel: string
}

export const GEMINI_MODELS: ProviderModel[] = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', hint: 'Recommended · fast multimodal' },
  { id: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B', hint: 'Lightest · lowest cost' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', hint: 'Deeper reasoning · 1M context' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Newer fallback' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Newest fallback' },
]

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    tagline: 'Free key from Google AI Studio',
    keyHint: 'AIza…',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    defaultBaseUrl: '',
    models: GEMINI_MODELS,
    defaultModel: 'gemini-1.5-flash',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    tagline: 'GPT-4o family',
    keyHint: 'sk-…',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', hint: 'Fastest · cheapest' },
      { id: 'gpt-4o', label: 'GPT-4o', hint: 'Balanced multimodal' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', hint: 'Newer small model' },
      { id: 'gpt-4.1', label: 'GPT-4.1', hint: 'Strong reasoning' },
      { id: 'o4-mini', label: 'o4-mini', hint: 'Reasoning model' },
    ],
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    tagline: 'Claude 3.5 / 4',
    keyHint: 'sk-ant-…',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultBaseUrl: 'https://api.anthropic.com',
    models: [
      { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku', hint: 'Fastest · cheapest' },
      { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', hint: 'Balanced' },
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', hint: 'Newest' },
    ],
    defaultModel: 'claude-3-5-haiku-latest',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    tagline: 'One key, hundreds of models',
    keyHint: 'sk-or-…',
    docsUrl: 'https://openrouter.ai/keys',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', hint: 'Fast · cheap' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini', hint: 'Fast · cheap' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', hint: 'Balanced' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', hint: 'Open model' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', hint: 'Low cost' },
    ],
    defaultModel: 'google/gemini-2.0-flash-001',
  },
  {
    id: 'custom',
    label: 'Custom endpoint',
    tagline: 'Any OpenAI-compatible API',
    keyHint: 'your key',
    docsUrl: '',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      { id: '', label: 'Type the model name', hint: 'e.g. llama-3.1-70b' },
    ],
    defaultModel: '',
  },
]

export function providerFor(id: AiProvider): ProviderMeta {
  return PROVIDERS.find((provider) => provider.id === id) || PROVIDERS[0]
}
