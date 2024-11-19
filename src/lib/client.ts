import type { Model } from "./types";

export class ChatGPTClient {
  private readonly apiUrl = 'http://localhost:5173/api';
  public readonly DEFAULT_MODEL = 'gpt-4o';

  constructor() { }

  private async postFormData(endpoint: string, formData: FormData): Promise<Response> {
    const response = await fetch(`${this.apiUrl}/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  public async getResponse(prompt: string, model: string = "", imageFiles: File[] = [], imageDetailLevel: "auto" | "low" | "high" = "auto"): Promise<string> {

    const formData = new FormData();
    formData.append('action', 'getResponse');
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('imageDetailLevel', imageDetailLevel);
    imageFiles.forEach(file => formData.append('imageFiles', file));

    const response = await this.postFormData('chat', formData);
    return response.text();
  }

  public async clearContext(): Promise<void> {
    const formData = new FormData();
    formData.append('action', 'clearContext');

    await this.postFormData('chat', formData);
  }

  public getModels(): Model[] {
    const gpt4o = {
      id: 'gpt-4o',
      name: 'GPT-4o (default)',
      description: 'High-intelligence flagship model for complex, multi-step tasks',
    } as Model;

    const gpt4 = {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Large multimodal model that can accurately solve difficult problems',
    } as Model;

    const gpt4turbo = {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'A faster, cheaper, and updated version of GPT-4',
    } as Model;

    const gpt4omini = {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      description: 'Small multimodal model. Cheapest and fastest option',
    } as Model;

    const o1preview = {
      id: 'o1-preview',
      name: 'o1-preview',
      description: 'Advanced reasoning model with RL chain-of-thought capabilities. Most expensive model, requires usage tier 3 ($100 deposited)',
    } as Model;

    const o1mini = {
      id: 'o1-mini',
      name: 'o1-mini',
      description: 'Faster and cheaper RL reasoning model. Requires usage tier 3',
    } as Model;

    return [gpt4o, gpt4omini, gpt4, gpt4turbo, o1preview, o1mini];
  }
}