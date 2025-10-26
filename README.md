# Chat UI

A responsive chat interface built with SvelteKit providing a UI wrapper around the OpenAI API. Supports file attachments and image uploads.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18 or higher)
- An OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
- Optional: [Docker Desktop](https://www.docker.com/) for containerized deployment

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ivanoconnor/chat_ui.git
cd chat_ui
```

### 2. Set up environment variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 3. Install dependencies
```bash
npm install
```
or if you prefer yarn:
```bash
yarn install
```

### 4. Start the development server
```bash
npm run dev
```
or with yarn:
```bash
yarn dev
```

### 5. Open your browser
Open `http://localhost:5173/` to get started

## Docker Deployment

### Option 1: Docker Compose (Recommended)
1. Make sure Docker Desktop is installed and running
2. Copy and configure your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```
3. Build and start the container:
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost:5173/`

### Option 2: Docker Build
```bash
docker build -t chat-ui .
docker run -p 5173:5173 --env-file .env chat-ui
```

To stop the Docker container, press `Ctrl+C` and then run:
```bash
docker-compose down
```

## Project Structure

```
src/
├── lib/
│   ├── client.ts          # ChatGPT client implementation
│   ├── types.ts           # TypeScript type definitions
│   ├── systemPrompts.ts   # System prompt configurations
│   └── components/        # Reusable Svelte components
└── routes/
    ├── +layout.svelte     # App layout
    ├── +page.server.js    # Root page (redirects to /chat)
    ├── chat/              # Chat interface
    └── api/chat/          # Chat API endpoint
```

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE).

- ✅ Free to use and modify for personal and educational purposes
- ✅ Attribution required
- ❌ Commercial use not permitted without permission
