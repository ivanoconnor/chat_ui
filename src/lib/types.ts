export type Message = {
  text: string;
  role: "user" | "assistant";
  img?: string;
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

export class gpt4o implements Model {
  id = 'gpt-4o';
  name = 'GPT-4o';
  description = 'High-intelligence flagship model for complex, multi-step tasks';
};

export class gpt4 implements Model {
  id = 'gpt-4';
  name = 'GPT-4';
  description = 'Large multimodal model that can accurately solve difficult problems';
};

export class gpt4turbo implements Model {
  id = 'gpt-4-turbo';
  name = 'GPT-4 Turbo';
  description = 'A faster, cheaper, and updated version of GPT-4';
};

export class gpt4omini implements Model {
  id = 'gpt-4o-mini';
  name = 'GPT-4o mini';
  description = 'Small multimodal model. Cheapest and fastest option';
};

export class o3mini implements Model {
  id = 'o3-mini';
  name = 'o3-mini';
  description = 'Latest small reasoning model with chain-of-thought capabilities';
  isReasoningModel = true;
};

export const ALL_MODELS: Model[] = [
  new gpt41(),
  new gpt4o(),
  new gpt4(),
  new gpt4turbo(),
  new gpt4omini(),
  new o3mini()
];