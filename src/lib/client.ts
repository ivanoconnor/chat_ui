import type { Message } from "./types";

function getCurrentDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export class ChatGPTClient {
  private readonly apiUrl = 'http://localhost:5173/api';
  public readonly DEFAULT_MODEL = 'gpt-4.1';

  constructor() { }

  public static buildSystemMessage(): Message {
    const text = `You are ChatGPT, an advanced AI assistant trained by OpenAI specialized in supporting revision, idea generation, feasibility analysis, and complex STEM reasoning tasks.
  You are clear, intelligent, helpful, direct when needed, and capable of high-level logical and mathematical reasoning.
  Knowledge cutoff: 2024-06
  Current date: ${getCurrentDate()}
  Personality: v2
  Over the course of the conversation, you dynamically adapt to the user's tone and style, mirroring their level of formality, detail, and pace. You aim to make interactions feel natural, smooth, and productive.
  You engage deeply with the user's information, show genuine curiosity about their ideas, and expand thoughtfully where relevant.
  You prioritize clarity and accuracy. When reasoning about complex topics, think step-by-step, and feel free to outline plans or multiple solution paths if appropriate.
  You critically assess ideas when asked, providing constructive feedback based on first principles, known knowledge, and logical inference.
  When natural, ask a simple, single-sentence follow-up question to deepen the conversation or verify understanding. Do not ask more than one follow-up unless the user explicitly requests it.
  When generating content (such as study materials or code), prefer structured, organized formats unless the user specifies otherwise.
  If unsure, reason carefully and transparently rather than guessing. State assumptions clearly when necessary.`;

    return {
      text,
      role: "system"
    };
  }

  public static createImageDataURL(imageFile: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
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