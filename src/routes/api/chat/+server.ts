import { OPENAI_API_KEY } from "$env/static/private"; // run `yarn dev` first
import { ChatGPTService } from "$lib/server/api";
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const service = new ChatGPTService(OPENAI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');

  if (!action) {
    return error(400, 'Action parameter is required');
  }

  switch (action) {
    case 'getResponse':
      const prompt = formData.get('prompt')?.toString() || '';
      const model = formData.get('model')?.toString() || service.DEFAULT_MODEL_ID;
      const imageFiles = formData.getAll('imageFiles') as File[];
      const imageDetailLevel = formData.get('imageDetailLevel')?.toString() as "auto" | "low" | "high" || "auto";

      try {
        const imageUrls = await Promise.all(imageFiles.map(file => ChatGPTService.createImageDataURL(file)));
        const response = await service.getResponse(prompt, model, imageUrls, imageDetailLevel);
        return new Response(response);
      } catch (err) {
        return error(500, "Failed to get response");
      }

    case 'clearContext':
      service.clearContext();
      return new Response('Context cleared');

    default:
      return error(400, 'Invalid action parameter');
  }
};