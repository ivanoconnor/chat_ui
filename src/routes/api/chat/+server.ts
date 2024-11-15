import { OPENAI_API_KEY } from "$env/static/private"; // run `yarn dev` first
import { ChatGPTService } from "$lib/server/api";
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const service = new ChatGPTService(OPENAI_API_KEY);

export const GET: RequestHandler = ({ url }) => {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
};