export class ChatGPTClient {
  private readonly apiUrl = 'http://localhost:5173/api';
  public readonly DEFAULT_MODEL = 'gpt-4.1';

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
}