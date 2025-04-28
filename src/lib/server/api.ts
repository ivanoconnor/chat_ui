import { ALL_MODELS } from "$lib/types";
import { OpenAI } from "openai";
import { ChatGPTClient } from "$lib/client";
import type {
  ResponseInputImage,
  ResponseInputItem,
  ResponseInputMessageContentList,
  ResponseInputText,
  ResponseOutputMessage,
  ResponseOutputText
} from "openai/src/resources/responses/responses.js";


function getCurrentDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export class ChatGPTService {
  private readonly openai: OpenAI;
  private readonly messages: Array<ResponseInputItem> = [];

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.messages.push(ChatGPTService.buildSystemMessage());
  }

  public static buildSystemMessage(): ResponseInputItem.Message {
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
      content: [{ type: "input_text", text } as ResponseInputText],
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
    modelIdentifier: string,
    imageUrls: string[] = [],
    imageDetailLevel: "auto" | "low" | "high" = "auto"
  ): Promise<string> {
    let userContent: ResponseInputMessageContentList = [];
    if (prompt.trim().length > 0) {
      userContent.push({ type: "input_text", text: prompt } as ResponseInputText);
    }

    if (imageUrls.length > 0) {
      userContent.push(...imageUrls.map((url) => ({ type: "input_image", image_url: url, detail: imageDetailLevel } as ResponseInputImage)));
    }

    if (userContent.length === 0) {
      throw new Error("Empty prompt and no images provided");
    }

    this.messages.push({ content: userContent, role: "user" } as ResponseInputItem.Message);

    // Convert stored messages to format expected by responses API
    const inputMessages = [...this.messages];
    const model = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (model?.isReasoningModel) {
      // remove system message for reasoning models
      inputMessages.shift();
    }

    // Use the responses API instead of chat.completions
    const response = await this.openai.responses.create({
      model: modelIdentifier,
      input: inputMessages,
      // Optional parameters could be added here:
      // stream: false,
      // store: true
    });

    // Access response text using the output_text convenience property
    const responseText = response.output_text;

    if (responseText) {
      this.messages.push({ content: [{ type: "output_text", text: responseText } as ResponseOutputText], role: "assistant" } as ResponseOutputMessage);
      return responseText;
    } else {
      throw new Error("Empty response");
    }
  }

  public clearContext(): void {
    this.messages.length = 0;
    this.messages.push(ChatGPTService.buildSystemMessage());
  };
}