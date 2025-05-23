import { ALL_MODELS, type Message } from "$lib/types";
import { OpenAI } from "openai";
import type {
  ResponseInputFile,
  ResponseInputImage,
  ResponseInputItem,
  ResponseInputMessageContentList,
  ResponseInputText,
  ResponseOutputMessage,
  ResponseOutputText
} from "openai/src/resources/responses/responses.js";


export class ChatGPTService {
  private readonly openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  public async getResponse(
    messages: Array<Message>,
    modelIdentifier: string,
  ): Promise<Message> {
    const conversation: Array<ResponseInputItem> = [];

    messages.forEach((message) => {

      if (message.role === "system" || message.role === "developer") {
        conversation.unshift({ content: [{ type: "input_text", text: message.text } as ResponseInputText], role: "system" } as ResponseInputItem.Message);
      } else if (message.role === "user") {

        const userContent: ResponseInputMessageContentList = [];

        if (message.text?.length) {
          userContent.push({ type: "input_text", text: message.text } as ResponseInputText);
        }

        if (message.images?.length) {
          userContent.push(...message.images.map((img) => ({
            type: "input_image",
            image_url: img.url,
            detail: img.detail
          } as ResponseInputImage)));
        }

        if (message.files?.length) {
          userContent.push(...message.files.map((file) => ({
            type: "input_file",
            filename: file.filename,
            file_data: file.url
          } as ResponseInputFile)));
        }

        if (userContent.length === 0) {
          throw new Error("Empty prompt and no inputs provided");
        }

        conversation.push({ content: userContent, role: "user" } as ResponseInputItem.Message);
      } else if (message.role === "assistant") {
        conversation.push({ content: [{ type: "output_text", text: message.text } as ResponseOutputText], role: "assistant" } as ResponseOutputMessage);
      }

    });

    const model = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (!model) {
      throw new Error(`Model ${modelIdentifier} not found`);
    }

    // Use the responses API instead of chat.completions
    const response = await this.openai.responses.create({
      model: modelIdentifier,
      input: conversation,
      // Optional parameters could be added here:
      // stream: false,
      store: false
    });

    // Access response text using the output_text convenience property
    const responseText = response.output_text;

    if (responseText) {
      return {
        text: responseText,
        role: "assistant",
      } as Message;
    } else {
      throw new Error("Empty response");
    }
  }
}