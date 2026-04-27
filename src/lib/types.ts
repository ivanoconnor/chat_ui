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
}

import clientConfig from "./client.config.json";

export const ALL_MODELS: Model[] = clientConfig.models as Model[];

/*
Pareto front as of 2026-04-26
in order of increasing cost and capability:
- GPT-5.4 Nano (none)
- GPT-5 Nano (medium)
- GPT-5 Nano (high)
- GPT-5 Mini (medium)
- GPT-5 Mini (high)
- Gemini 3 Flash
- GPT-5.5 (low)
- Gemini 3.1 Pro
- GPT-5.5 (high)
- GPT-5.5 (xhigh)

source: https://ivanoconnor.com/projects/notes/#eJxdTssOwjAM-xp2CxWPXZAmDnxJ1GZtpDad1jLg79lDsG6HSLGd2HY5d-mmFPaZW9aMHgX9J3E6IqsQDfmkbJehhisISryzZPKeLYmmRkfDYoHF0LsqlYUCHVNuNvyQZrJarJvS-nB-lBAkCvSEKcqY8RdrCGT4GQrCx1eBHFu3wmmjwMJwgdZjclvLn3SCro_j0MC0ms3iLm7TdO65O5ievj8BdvY
*/