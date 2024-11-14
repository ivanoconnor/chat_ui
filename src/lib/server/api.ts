import { OPENAI_API_KEY } from "$env/static/private"; // run `yarn dev` first
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

export class API {
  private readonly openai: OpenAI;
  private readonly messages: ChatCompletionMessageParam[] = [];
  public readonly DEFAULT_MODEL = "gpt-4o";

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    this.messages.push(API.buildSystemMessage());
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

  public static createImageURL(imageFile: File) {}

  async getResponse(
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

    const completion = await this.openai.chat.completions.create({
      messages: this.messages,
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

  clearContext(): void {
    this.messages.length = 0;
    this.messages.push(API.buildSystemMessage());
  };
}