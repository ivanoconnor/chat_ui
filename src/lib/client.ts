import { SystemPrompts } from "./systemPrompts";
import { ALL_MODELS, type Message, type Model } from "./types";

export class ChatGPTClient {
  private readonly apiUrl = '/api';
  public readonly DEFAULT_MODEL = 'gpt-4.1';
  private readonly modelsMap: Record<string, Model> = ALL_MODELS.reduce((acc, model) => {
    acc[model.id] = model;
    return acc;
  }, {} as Record<string, Model>);

  constructor() { }

  public static buildSystemMessage(model: Model): Message {
    const text = SystemPrompts.STEMAssistant.replace('<MODEL_KNOWLEDGE_CUTOFF>', model.knowledgeCutoff);

    return {
      text: text,
      role: "system"
    };
  }

  public static getModelById(modelId: string): Model | undefined {
    return ALL_MODELS.find(model => model.id === modelId);
  }

  public static createFileDataURL(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async getResponse(messages: Array<Message>, model: string): Promise<Message> {

    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Message>;
  }

  public async *streamResponse(messages: Array<Message>, model: string, abortSignal?: AbortSignal): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model,
        stream: true
      }),
      signal: abortSignal
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                yield parsed.delta;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}