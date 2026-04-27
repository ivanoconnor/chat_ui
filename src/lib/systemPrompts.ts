import clientConfig from "./client.config.json";

export namespace SystemPrompts {
  export const legalAssistant = clientConfig.systemPrompts.legalAssistant.replace('<CURRENT_DATE>', getCurrentDate());
  export const STEMAssistant = clientConfig.systemPrompts.STEMAssistant.replace('<CURRENT_DATE>', getCurrentDate());
  export const defaultAssistant = clientConfig.systemPrompts.defaultAssistant.replace('<CURRENT_DATE>', getCurrentDate());
}

function getCurrentDate(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}