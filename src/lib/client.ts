import { SystemPrompts } from "./systemPrompts";
import type { Message } from "./types";

export class ChatGPTClient {
  private readonly apiUrl = 'http://localhost:5173/api';
  public readonly DEFAULT_MODEL = 'gpt-4.1';

  constructor() { }

  public static buildSystemMessage(): Message {
    return {
      text: SystemPrompts.STEMAssistant,
      role: "system"
    };
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