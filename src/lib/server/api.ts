import { OpenAI } from "openai";
import type { ChatCompletionContentPartImage } from "openai/resources/index.mjs";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam
} from "openai/src/resources/index.js";


function getCurrentDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export class ChatGPTService {
  private readonly openai: OpenAI;
  private readonly messages: ChatCompletionMessageParam[] = [];
  public readonly DEFAULT_MODEL = "gpt-4o";

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.messages.push(ChatGPTService.buildSystemMessage());
  }

  public static buildSystemMessage(): ChatCompletionSystemMessageParam {
    const text = `You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: 2023-10
Personality: v2
Current date: ${getCurrentDate()}`;

    return {
      content: text,
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

  public async getResponse(
    prompt: string,
    model: string = this.DEFAULT_MODEL,
    imageUrls: string[] = [],
    imageDetailLevel: "auto" | "low" | "high" = "auto"
  ): Promise<string> {
    let userContent: string | Array<ChatCompletionContentPart>;
    if (imageUrls.length > 0) {
      if (prompt.trim().length > 0) {
        userContent = [
          { type: "text", text: prompt },
          ...imageUrls.map((url) => ({ type: "image_url", image_url: { url, detail: imageDetailLevel } } as ChatCompletionContentPartImage))
        ];
      } else {
        userContent = imageUrls.map((url) => ({ type: "image_url", image_url: { url, detail: imageDetailLevel } } as ChatCompletionContentPartImage));
      }
    } else {
      userContent = prompt;
    }

    this.messages.push({ content: userContent, role: "user" } as ChatCompletionUserMessageParam);
    const chatMessages: ChatCompletionMessageParam[] = [...this.messages];

    if (model === "o1-mini" || model === "o1-preview" || model === "o1") {
      // remove system message for o1 models
      chatMessages.shift();
    }

    const completion = await this.openai.chat.completions.create({
      messages: chatMessages,
      model: model
    });

    const response = completion.choices[0].message.content;
    if (response) {
      this.messages.push({ content: response, role: "assistant" } as ChatCompletionAssistantMessageParam);
      return response;
    } else {
      throw new Error("Empty response");
    }
  }

  public clearContext(): void {
    this.messages.length = 0;
    this.messages.push(ChatGPTService.buildSystemMessage());
  };
}