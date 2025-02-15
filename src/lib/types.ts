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

export class gpt4o implements Model {
  id = 'gpt-4o';
  name = 'GPT-4o (default)';
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

export class o1preview implements Model {
  id = 'o1-preview';
  name = 'o1-preview';
  description = 'Advanced reasoning model with RL chain-of-thought capabilities. Most expensive model, requires usage tier 3 ($100 deposited)';
  isReasoningModel = true;
};

export class o1mini implements Model {
  id = 'o1-mini';
  name = 'o1-mini';
  description = 'Faster and cheaper RL reasoning model. Requires usage tier 3';
  isReasoningModel = true;
};

export class o3mini implements Model {
  id = 'o3-mini';
  name = 'o3-mini';
  description = 'Latest small reasoning model. Requires usage tier 3';
  isReasoningModel = true;
};

export const ALL_MODELS: Model[] = [
  new gpt4o(),
  new gpt4(),
  new gpt4turbo(),
  new gpt4omini(),
  new o1preview(),
  new o1mini(),
  new o3mini()
];