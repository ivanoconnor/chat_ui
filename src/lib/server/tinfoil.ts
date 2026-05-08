import { ALL_MODELS, type Message, type ReasoningLevelOption } from "$lib/types";
import { type ReasoningEffort } from "openai/resources.mjs";
import { TinfoilAI } from "tinfoil";

export class TinfoilService {
  private readonly client: TinfoilAI;

  constructor(apiKey: string) {
    this.client = new TinfoilAI({ apiKey });
  }

  public async getResponse(
    messages: Array<Message>,
    modelIdentifier: string,
    reasoningLevel?: ReasoningLevelOption
  ): Promise<Message> {
    const conversation: Array<TinfoilAI.Chat.ChatCompletionMessageParam> = [];

    messages.forEach((message) => {

      if (message.role === "system" || message.role === "developer") {
        conversation.unshift({ content: message.text, role: "system" } as TinfoilAI.Chat.ChatCompletionMessageParam);
      } else if (message.role === "user") {

        const userContent: Array<TinfoilAI.Chat.ChatCompletionContentPart> = [];

        if (message.text?.length) {
          userContent.push({ type: "text", text: message.text } as TinfoilAI.Chat.ChatCompletionContentPartText);
        }

        if (message.images?.length) {
          userContent.push(...message.images.map((img) => ({
            type: "image_url",
            image_url: {
              url: img.url,
              detail: img.detail
            },
          } as TinfoilAI.Chat.ChatCompletionContentPartImage)));
        }

        if (message.files?.length) {
          userContent.push(...message.files.map((file) => ({
            type: "file",
            file: {
              filename: file.filename,
              file_data: file.url
            }
          } as TinfoilAI.Chat.ChatCompletionContentPart.File)));
        }

        if (userContent.length === 0) {
          throw new Error("Empty prompt and no inputs provided");
        }

        conversation.push({ content: userContent, role: "user" } as TinfoilAI.Chat.ChatCompletionUserMessageParam);
      } else if (message.role === "assistant") {
        conversation.push({ content: message.text, role: "assistant" } as TinfoilAI.Chat.ChatCompletionAssistantMessageParam);
      }

    });

    const model = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (!model) {
      throw new Error(`Model ${modelIdentifier} not found`);
    }

    let opts = {
      model: modelIdentifier,
      messages: conversation,
      store: false,
      include_usage: true
    } as TinfoilAI.Chat.ChatCompletionCreateParamsNonStreaming;

    if (model.reasoningLevelOpts && model.reasoningLevelOpts.length > 0 && reasoningLevel) {
      opts = { ...opts, reasoning_effort: reasoningLevel as ReasoningEffort };
    }

    // Use chat.completions
    const response = await this.client.chat.completions.create(opts) as TinfoilAI.Chat.ChatCompletion & {
      _request_id?: string | null;
    };

    // Access response text using the output_text convenience property
    const responseText = response.choices[0].message.content;

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
    const conversation: Array<TinfoilAI.Chat.ChatCompletionMessageParam> = [];

    messages.forEach((message) => {

      if (message.role === "system" || message.role === "developer") {
        conversation.unshift({ content: message.text, role: "system" } as TinfoilAI.Chat.ChatCompletionMessageParam);
      } else if (message.role === "user") {

        const userContent: Array<TinfoilAI.Chat.ChatCompletionContentPart> = [];

        if (message.text?.length) {
          userContent.push({ type: "text", text: message.text } as TinfoilAI.Chat.ChatCompletionContentPartText);
        }

        if (message.images?.length) {
          userContent.push(...message.images.map((img) => ({
            type: "image_url",
            image_url: {
              url: img.url,
              detail: img.detail
            },
          } as TinfoilAI.Chat.ChatCompletionContentPartImage)));
        }

        if (message.files?.length) {
          userContent.push(...message.files.map((file) => ({
            type: "file",
            file: {
              filename: file.filename,
              file_data: file.url
            }
          } as TinfoilAI.Chat.ChatCompletionContentPart.File)));
        }

        if (userContent.length === 0) {
          throw new Error("Empty prompt and no inputs provided");
        }

        conversation.push({ content: userContent, role: "user" } as TinfoilAI.Chat.ChatCompletionUserMessageParam);
      } else if (message.role === "assistant") {
        conversation.push({ content: message.text, role: "assistant" } as TinfoilAI.Chat.ChatCompletionAssistantMessageParam);
      }

    });

    const model = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (!model) {
      throw new Error(`Model ${modelIdentifier} not found`);
    }

    let opts = {
      model: modelIdentifier,
      messages: conversation,
      stream: true,
      store: false,
      include_usage: true
    } as TinfoilAI.Chat.ChatCompletionCreateParamsStreaming;

    if (model.reasoningLevelOpts && model.reasoningLevelOpts.length > 0 && reasoningLevel) {
      opts = { ...opts, reasoning_effort: reasoningLevel as ReasoningEffort };
    }

    // streaming enabled
    const stream = await this.client.chat.completions.create(opts); /*& {
      _request_id?: string | null;
    };*/

    // Yield text deltas as they come in
    for await (const event of stream) {
      if (event.choices[0]) {
        yield event.choices[0].delta?.content || "";
      }
    }
  }
}