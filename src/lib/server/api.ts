import { ALL_MODELS, type Message, type ReasoningLevelOption } from "$lib/types";
import { OpenAI } from "openai";
import type { ReasoningEffort } from "openai/resources.mjs";
import type {
  ResponseInputFile,
  ResponseInputImage,
  ResponseInputItem,
  ResponseInputMessageContentList,
  ResponseInputText,
  ResponseOutputMessage,
  ResponseOutputText
} from "openai/src/resources/responses/responses.js";

import { Stream } from "openai/streaming.mjs";


export class ChatGPTService {
  private readonly openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  public async getResponse(
    messages: Array<Message>,
    modelIdentifier: string,
    reasoningLevel?: ReasoningLevelOption
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

    let opts = {
      model: modelIdentifier,
      input: conversation,
      store: false
    } as OpenAI.Responses.ResponseCreateParams;

    if (model.reasoningLevelOpts && model.reasoningLevelOpts.length > 0 && reasoningLevel) {
      opts = { ...opts, reasoning: { "effort": reasoningLevel as ReasoningEffort } };
    }

    // Use the responses API instead of chat.completions
    const response = await this.openai.responses.create(opts) as OpenAI.Responses.Response & {
      _request_id?: string | null;
    };

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

  public async *streamResponse(
    messages: Array<Message>,
    modelIdentifier: string,
    reasoningLevel?: ReasoningLevelOption
  ): AsyncGenerator<string, void, unknown> {
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

    let opts = {
      model: modelIdentifier,
      input: conversation,
      stream: true,
      store: false
    } as OpenAI.Responses.ResponseCreateParams;

    if (model.reasoningLevelOpts && model.reasoningLevelOpts.length > 0 && reasoningLevel) {
      opts = { ...opts, reasoning: { "effort": reasoningLevel as ReasoningEffort } };
    }

    // Use the responses API with streaming enabled
    const stream = await this.openai.responses.create(opts) as Stream<OpenAI.Responses.ResponseStreamEvent> & {
      _request_id?: string | null;
    };

    // Yield text deltas as they come in
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta;
      }
    }
  }
}