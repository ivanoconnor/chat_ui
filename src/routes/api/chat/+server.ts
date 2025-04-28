import { OPENAI_API_KEY } from "$env/static/private"; // run `yarn dev` first
import { ChatGPTService } from "$lib/server/api";
import type { Message } from "$lib/types";
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const service = new ChatGPTService(OPENAI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();

  const messages = data.messages as Array<Message>;
  const model = data.model as string;

  try {
    if (!model) return error(400, 'Model parameter is required');
    const response = await service.getResponse(messages, model);
    return new Response(JSON.stringify((response)));
  } catch (err) {
    console.error("Error in POST /api/chat:", err);
    return error(500, "Failed to get response");
  }
};