export type Message = {
  text: string;
  role: "user" | "assistant";
  img?: string;
};