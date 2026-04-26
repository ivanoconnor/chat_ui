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
  defaultReasoningLevel?: "none" | "low" | "medium" | "high" | "xhigh";
};


export class gpt5_5 implements Model {
  id = "gpt-5.5";
  name = "GPT-5.5";
  description = "Newest frontier model for complex work. Low and Medium reasoning levels offer the best value for most tasks, while High and XHigh are ideal for the most complex tasks.";
  knowledgeCutoff = "2025-12-01"
  defaultReasoningLevel = "medium" as const;
}

export class gpt_5_4_nano implements Model {
  id = "gpt-5.4-nano";
  name = "GPT-5.4 Nano";
  description = "Small, cheap, and fast model, best for simple tasks. Medium or Xhigh reasoning levels recommended for best value.";
  knowledgeCutoff = "2025-08-31"
  defaultReasoningLevel = "medium" as const;
}

export const ALL_MODELS: Model[] = [
  new gpt5_5(),
  new gpt_5_4_nano(),
];