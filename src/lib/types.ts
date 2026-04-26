export interface FileAttachment {
  filename: string;
  url: string;
  type: string;
}

export type Image = {
  url: string;
  detail: "auto" | "low" | "high";
};

export type ReasoningLevelOption = "none" | "low" | "medium" | "high" | "xhigh";

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
  reasoningLevelOpts?: readonly ReasoningLevelOption[]; // only enforced client-side
  defaultReasoningLevel?: ReasoningLevelOption;
};

/*
Pareto front as of 2026-04-26
in order of increasing cost and capability:
- GPT-5.4 Nano (none)
- GPT-5 Nano (medium)
- GPT-5 Nano (high)
- GPT-5 Mini (medium)
- GPT-5 Mini (high)
- GPT-5.4 Nano (xhigh)
- GPT-5.5 (low)
- GPT-5.5 (medium)
- GPT-5.5 (high)
- GPT-5.5 (xhigh)

source: https://ivanoconnor.com/projects/notes/#eJx1UstygzAM_JrmpjIkcOlMpod-iQdU0NSWPNhJ278vYIofJBcj7a6klfHovXVvVaUmT5_UkdKKlf515F4VVUZ61K4arIcWGjDEBAZ7upn3QF036uX8EaJ24xNAy3fM9ijrVqIsDBMqJ0w8JK0e46EoSVmxFOnTliMNY6k9mCqL5ZKQdlqGSb0eqZVG9uAflssmX2Goc6vhRubDKB01iTrbMxe2cI5M7j-dEdXHperE2yLY20hznByWWR1nVxgusLAWnsCm39H6yU-pi2b5NsmzOSH34AXmzzWGc0dnhR2CJ4MnYo9a04DcIRD3-DPrvpDh5vCakXcXmUdlnTh_qFjAXNyJsWqieamD2E7U4R8YmCgq
*/

export class gpt_5_4_nano implements Model {
  id = "gpt-5.4-nano";
  name = "GPT-5.4 Nano";
  description = "Small, cheap, and fast model, best for simple tasks. Reasoning level Xhigh is recommended for solid performance and high speed.";
  knowledgeCutoff = "2025-08-31";
  reasoningLevelOpts = ["none", "xhigh"] as const;
  defaultReasoningLevel = "xhigh" as const;
}

export class gpt_5_nano implements Model {
  id = "gpt-5-nano";
  name = "GPT-5 Nano";
  description = "Small, fast, and very cheap model, best for simple tasks. Use Medium or High reasoning levels for best results.";
  knowledgeCutoff = "2024-05-31";
  reasoningLevelOpts = ["medium", "high"] as const;
  defaultReasoningLevel = "medium" as const;
}

export class gpt_5_mini implements Model {
  id = "gpt-5-mini";
  name = "GPT-5 Mini";
  description = "Medium-sized model, good for a wide range of tasks. Use Medium or High reasoning levels for best results.";
  knowledgeCutoff = "2024-05-31";
  reasoningLevelOpts = ["medium", "high"] as const;
  defaultReasoningLevel = "medium" as const;
}

export class gpt5_5 implements Model {
  id = "gpt-5.5";
  name = "GPT-5.5";
  description = "Newest frontier model for complex work. Low and Medium reasoning levels offer the best value for most tasks, while High and XHigh are ideal for the most complex tasks.";
  knowledgeCutoff = "2025-12-01";
  reasoningLevelOpts = ["low", "medium", "high", "xhigh"] as const;
  defaultReasoningLevel = "medium" as const;
}

export const ALL_MODELS: Model[] = [
  new gpt_5_4_nano(),
  new gpt_5_nano(),
  new gpt_5_mini(),
  new gpt5_5(),
];