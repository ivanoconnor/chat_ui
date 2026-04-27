import { ALL_MODELS, type Message, type ReasoningLevelOption } from "$lib/types";
import { GoogleGenAI, ThinkingLevel, type Content, type Part } from "@google/genai";

export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async getResponse(
    messages: Array<Message>,
    modelIdentifier: string,
    reasoningLevel?: ReasoningLevelOption
  ): Promise<Message> {
    const contents: Array<Content> = [];
    let systemInstruction = "";

    for (const message of messages) {
      if (message.role === "system" || message.role === "developer") {
        systemInstruction += message.text + "\n";
      } else if (message.role === "user") {
        const parts: Part[] = [];

        if (message.text?.length) {
          parts.push({ text: message.text });
        }

        if (message.images?.length) {
          message.images.forEach(img => {
            const match = img.url.match(/^data:(.+);base64,(.*)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            } else {
              // ??? 
              // todo check this - not sure when this would happen
              parts.push({ text: `[Image: ${img.url}]` });
            }
          });
        }

        if (message.files?.length) {
          message.files.forEach(file => {
            const match = file.url.match(/^data:(.+);base64,(.*)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          });
        }

        if (parts.length === 0) {
          throw new Error("Empty prompt and no inputs provided");
        }

        contents.push({ role: "user", parts });
      } else if (message.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: message.text || "" }] });
      }
    }

    const modelObj = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (!modelObj) {
      throw new Error(`Model ${modelIdentifier} not found`);
    }

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction.trim();
    }

    if (modelObj.reasoningLevelOpts && modelObj.reasoningLevelOpts.length > 0 && reasoningLevel) {
      // gemini supports minimal, low, medium, high
      // map none to minimal and xhigh to high

      if (reasoningLevel === "none") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
      } else if (reasoningLevel === "low") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      } else if (reasoningLevel === "medium") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
      } else if (reasoningLevel === "high" || reasoningLevel === "xhigh") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }
    }

    const response = await this.ai.models.generateContent({
      model: modelIdentifier,
      contents,
      config,
    });

    if (response.text) {
      return {
        text: response.text,
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
    const contents: Array<Content> = [];
    let systemInstruction = "";

    for (const message of messages) {
      if (message.role === "system" || message.role === "developer") {
        systemInstruction += message.text + "\n";
      } else if (message.role === "user") {
        const parts: Part[] = [];

        if (message.text?.length) {
          parts.push({ text: message.text });
        }

        if (message.images?.length) {
          message.images.forEach(img => {
            const match = img.url.match(/^data:(.+);base64,(.*)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          });
        }

        if (message.files?.length) {
          message.files.forEach(file => {
            const match = file.url.match(/^data:(.+);base64,(.*)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          });
        }

        if (parts.length === 0) {
          throw new Error("Empty prompt and no inputs provided");
        }

        contents.push({ role: "user", parts });
      } else if (message.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: message.text || "" }] });
      }
    }

    const modelObj = ALL_MODELS.find((m) => m.id === modelIdentifier);

    if (!modelObj) {
      throw new Error(`Model ${modelIdentifier} not found`);
    }

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction.trim();
    }

    if (modelObj.reasoningLevelOpts && modelObj.reasoningLevelOpts.length > 0 && reasoningLevel) {
      if (reasoningLevel === "high" || reasoningLevel === "xhigh") {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }
    }

    const stream = await this.ai.models.generateContentStream({
      model: modelIdentifier,
      contents,
      config,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}
