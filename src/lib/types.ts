export interface FileAttachment {
  filename: string;
  url: string;
  type: string;
}

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
  files?: FileAttachment[];
  modelId?: string;
};

export interface Model {
  id: string;
  name: string;
  description: string;
  knowledgeCutoff: string;
};


export class gpt41 implements Model {
  id = 'gpt-4.1';
  name = 'GPT-4.1 (default)';
  description = 'Recent GPT-4 family model with strong instruction following and world knowledge';
  knowledgeCutoff = '2024-06-01';
};

export class gpt41mini implements Model {
  id = 'gpt-4.1-mini';
  name = 'GPT-4.1 mini';
  description = 'Small multimodal model, fastest option';
  knowledgeCutoff = '2024-06-01';
};

export class o3 implements Model {
  id = 'o3';
  name = 'o3';
  description = 'Most powerful reasoning model with advanced capabilities';
  knowledgeCutoff = '2024-06-01';
};

export class o4mini implements Model {
  id = 'o4-mini';
  name = 'o4-mini';
  description = 'Latest small reasoning model with chain-of-thought capabilities';
  knowledgeCutoff = '2024-06-01';
};

export class gpt5 implements Model {
  id = 'gpt-5';
  name = 'GPT-5';
  description = 'Flagship model for coding, reasoning, and agentic tasks';
  knowledgeCutoff = '2024-10-01';
}

export class gpt5mini implements Model {
  id = 'gpt-5-mini';
  name = 'GPT-5 mini';
  description = 'Faster, more cost-efficient version of GPT-5';
  knowledgeCutoff = '2024-05-31';
};

export class gpt4o implements Model {
  id = 'gpt-4o';
  name = 'GPT-4o';
  description = 'High-intelligence flagship model for complex, multi-step tasks';
  knowledgeCutoff = '2023-10-01';
};


export const ALL_MODELS: Model[] = [
  new gpt41(),
  new gpt41mini(),
  new o3(),
  new o4mini(),
  new gpt5(),
  new gpt5mini(),
  new gpt4o(),
];