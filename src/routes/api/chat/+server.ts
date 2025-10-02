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
  const stream = data.stream as boolean | undefined;

  try {
    if (!model) return error(400, 'Model parameter is required');

    // Handle streaming requests
    if (stream) {
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of service.streamResponse(messages, model)) {
              const data = `data: ${JSON.stringify({ delta: chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            // Send done signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (err) {
            console.error("Error in streaming:", err);
            const errorData = `data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming requests
    const response = await service.getResponse(messages, model);
    return new Response(JSON.stringify((response)));
  } catch (err) {
    console.error("Error in POST /api/chat:", err);
    return error(500, "Failed to get response");
  }
};