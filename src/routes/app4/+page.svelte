<script lang="ts">
  import { ChatGPTClient } from "$lib/client";

  type Message = {
    text: string;
    role: "user" | "assistant";
    img?: string;
  };

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
                class="flex flex-col items-center bg-zinc-800 rounded-lg p-2"
              >
                {#if message.img}
                  <img
                    src={message.img}
                    alt="User uploaded content"
                    class="w-32 h-32 rounded-lg"
                  />
                {:else}
                  <p class="text-white">{message.text}</p>
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
