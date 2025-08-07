import { SystemPrompts } from "./systemPrompts";
import { ALL_MODELS, type Message, type Model } from "./types";

export class ChatGPTClient {
  private readonly apiUrl = 'http://localhost:5173/api';
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
}