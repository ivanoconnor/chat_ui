export type Image = {
  url: string;
  detail: "auto" | "low" | "high";
};

export type Message = {
  text?: string;
  // system and developer messages are considered equivalent by the API
  // and are not shown in the UI
  role: "user" | "assistant" | "system" | "developer";
  images?: Image[];
  modelId?: string;
};

export interface Model {
  id: string;
  name: string;
  description?: string;
  isReasoningModel?: boolean;
};

export class gpt41 implements Model {
  id = 'gpt-4.1';
  name = 'GPT-4.1 (default)';
  description = 'Latest GPT-4 model with strong instruction following and world knowledge';
};

export class gpt41mini implements Model {
  id = 'gpt-4.1-mini';
  name = 'GPT-4.1 mini';
  description = 'Small multimodal model. Cheapest and fastest option';
};

export class gpt4o implements Model {
  id = 'gpt-4o';
  name = 'GPT-4o';
  description = 'High-intelligence flagship model for complex, multi-step tasks';
};

export class o3mini implements Model {
  id = 'o3-mini';
  name = 'o3-mini';
  description = 'Latest small reasoning model with chain-of-thought capabilities';
  isReasoningModel = true;
};

export class gpt45 implements Model {
  id = 'gpt-4.5-preview';
  name = 'GPT-4.5';
  description = 'Very large model with high creativity. Very expensive, limited research preview';
};


export const ALL_MODELS: Model[] = [
  new gpt41(),
  new gpt41mini(),
  new gpt4o(),
  new o3mini(),
  new gpt45()
];