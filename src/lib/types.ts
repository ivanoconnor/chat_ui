export type Message = {
  text: string;
  role: "user" | "assistant";
  img?: string;
};

export type Model = {
  id: string;
  name: string;
  description?: string;
}