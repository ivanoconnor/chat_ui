<script lang="ts">
  import { onMount } from "svelte";

  type Message = {
    content: string;
    sender: "user" | "llm";
    timestamp: Date;
  };

  type LLM = {
    id: string;
    name: string;
  };

  let messages: Message[] = [];
  let inputMessage = "";
  let selectedLLM: string;

  const llmOptions: LLM[] = [
    { id: "gpt3", name: "GPT-3" },
    { id: "gpt4", name: "GPT-4" },
    { id: "claude", name: "Claude" },
    { id: "palm", name: "PaLM" },
  ];

  function sendMessage() {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    messages = [...messages, newMessage];
    inputMessage = "";

    // Simulate LLM response (replace with actual LLM integration)
    setTimeout(() => {
      const llmResponse: Message = {
        content: `This is a simulated response from ${selectedLLM}.`,
        sender: "llm",
        timestamp: new Date(),
      };
      messages = [...messages, llmResponse];
    }, 1000);
  }

  onMount(() => {
    selectedLLM = llmOptions[0].id;
  });
</script>

<div class="h-screen w-full flex bg-zinc-900 justify-center">
  <div class="w-full sm:w-1/2 self-end mb-8">
    <div
      class="flex flex-row items-center justify-between w-full bg-zinc-800 rounded-full p-4 gap-2"
    >
      <textarea
        class="pl-3 w-full text-white focus:outline-none bg-transparent resize-none"
        rows="1"
        bind:value={inputMessage}
        placeholder="Type a message..."
      ></textarea>
      <div class="flex justify-end">
        <button
          class="bg-white text-black py-1 px-3 rounded-full"
          on:click={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  </div>
</div>
