<script lang="ts">
  import { ChatGPTClient } from "$lib/client";
  import { onMount } from "svelte";
  import type { Message } from "$lib/types";
  import ResponseMessage from "$lib/components/ResponseMessage.svelte";

  let inputMessage = $state("");
  const messages: Message[] = $state([]);
  const client = new ChatGPTClient();

  async function sendMessage() {
    const trimmed = inputMessage.trim();

    if (trimmed === "") return; // todo allow empty if imgs are present

    messages.push({ text: trimmed, role: "user" });
    inputMessage = "";

    const response = await client.getResponse(trimmed);
    messages.push({ text: response, role: "assistant" });

    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    const chat = document.querySelector(".chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  const demoMessage1: Message = {
    text: "Create a detailed factsheet about LLMs",
    role: "user",
  };

  const demoMessage2: Message = {
    text: `# Factsheet: Large Language Models (LLMs)

## Overview
- **Definition**: LLMs are artificial intelligence systems designed to understand, generate, and manipulate human language at scale.
- **Functionality**: They process and predict text, enabling tasks like translation, summarization, and conversation.

## Key Characteristics
- **Training Data**: LLMs are trained on vast datasets, comprising books, articles, and internet text.
- **Model Architecture**: Often based on transformer architecture, which utilizes attention mechanisms to weigh the significance of different words.

## Popular Examples
- **GPT (Generative Pre-trained Transformer)**: Developed by OpenAI.
- **BERT (Bidirectional Encoder Representations from Transformers)**: Developed by Google.
- **LLaMA (Large Language Model Meta AI)**: Developed by Meta.

## Applications
- **Natural Language Understanding**: Comprehends and interprets text.
- **Content Generation**: Creates articles, emails, and more.
- **Language Translation**: Converts text between languages.
- **Sentiment Analysis**: Determines emotions and opinions in text.
- **Chatbots and Virtual Assistants**: Powers conversational AI systems.

## Benefits
- **Efficiency**: Automates and speeds up text processing tasks.
- **Versatility**: Adapts to a wide range of applications and industries.
- **Scalability**: Improves as more data and computational power become available.

## Challenges
- **Bias**: May reflect biases present in the training data.
- **Interpretability**: Often functions as a “black box,” making decision-making processes opaque.
- **Resource-Intensive**: Requires substantial computational resources for training.

## Ethical Considerations
- **Data Privacy**: Ensures user data is handled responsibly.
- **Bias Mitigation**: Strives to reduce and address inherent biases.
- **Transparency and Accountability**: Develops clear guidelines for use and deployment.

## Future Directions
- **Fine-tuning and Adaptation**: Enhances models for specific tasks and industries.
- **Efficiency Improvements**: Reduces resource requirements and increases accessibility.
- **Ethical Frameworks**: Develops stronger standards for ethical use.

\`\`\`python
# Example Code
print("Hello, World!")
\`\`\`

LLMs are revolutionizing the field of AI with their ability to process and generate human language, offering both opportunities and challenges for the future.`,
    role: "assistant",
  };

  onMount(() => {
    messages.push(demoMessage1);
    messages.push(demoMessage2);
    scrollChatToBottom();
  });
</script>

<div class="h-screen w-full flex bg-zinc-900 justify-center">
  <div class="w-full sm:w-1/2 flex flex-col bg-zinc-900">
    <div class="flex flex-col h-full">
      <div class="flex flex-col flex-grow p-4 chat overflow-y-auto">
        {#each messages as message, i}
          <div
            class="flex flex-row gap-2 mb-4"
            class:justify-end={message.role === "user"}
            class:justify-start={message.role !== "user"}
          >
            <div
              class="flex flex-col items-center"
              class:items-end={message.role === "user"}
              class:items-start={message.role !== "user"}
            >
              <div
              class="flex flex-col items-center rounded-xl py-2 px-4"
              class:bg-zinc-800={message.role === "user"}
              >
                <!-- this is wrong -->
                {#if message.img}
                  <img
                    src={message.img}
                    alt="User uploaded content"
                    class="w-32 h-32 rounded-lg"
                  />
                {:else}
                  <div class="text-white leading-relaxed">
                    <ResponseMessage {message} />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}

        <div class="h-4"></div>
      </div>
    </div>
  </div>

  <div class="w-full sm:w-1/2 self-end mb-8">
    <div
      class="flex flex-row items-center justify-between w-full bg-zinc-800 rounded-full p-4 gap-2"
    >
      <textarea
        class="pl-3 w-full text-white focus:outline-none bg-transparent resize-none"
        rows="1"
        bind:value={inputMessage}
        placeholder="Type a message..."
        onkeydown={(e) => {
          // todo check this for mobile
          if (e.shiftKey && e.key === "Enter") {
            e.preventDefault();
            inputMessage += "\n";
          } else if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
          }
        }}
      ></textarea>
      <div class="flex justify-end">
        <button
          class="bg-white text-black py-1 px-3 rounded-full"
          onclick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  </div>
</div>
