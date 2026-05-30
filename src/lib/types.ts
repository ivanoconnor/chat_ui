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
  provider: "openai" | "google" | "tinfoil";
  knowledgeCutoff: string;
  reasoningLevelOpts?: readonly ReasoningLevelOption[]; // only enforced client-side
  defaultReasoningLevel?: ReasoningLevelOption;
}

import clientConfig from "./client.config.json";

export const ALL_MODELS: Model[] = clientConfig.models as Model[];

/*
Pareto front as of 2026-04-26
in order of increasing cost and capability:
- GPT-5.4 Nano (none)
- GPT-5 Nano (medium)
- Gemma 4 31B (reasoning)
- GPT-5 Mini (high)
- Gemini 3 Flash
- GPT-5.5 (low)
- GLM 5.1 (reasoning)
- Gemini 3.1 Pro
- GPT-5.5 (high)
- GPT-5.5 (xhigh)

source: https://ivanoconnor.com/projects/notes/#eJx1jksKwzAMRE_T7FTTTzaF0EVPYmzFFjhSiNykvX2TpuSzKEKgeSM0ijm3ejPGdplqcmSTZZveSnq0ZBrxmNQEbIgJLlAnqxE6tCpMHO7EGVOigOywcuJHBsQeX8XWmRE40VzteK9fWMwxVWgzlGNFCvFwfszyCmxZgIXX3MUs1wmSDJP68-rWOkHbydjYEw7LhclcxJS5E9Cgp2ez2_6xD4aVcj4
*/