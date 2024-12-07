<script lang="ts">
  import { ChatGPTClient } from "$lib/client";
  import ResponseMessage from "$lib/components/ResponseMessage.svelte";
  import type { Message } from "$lib/types";
  import { onMount, tick } from "svelte";

  let inputMessage = $state("");
  const messages: Message[] = $state([]);
  const client = new ChatGPTClient();
  let selectedModel = $state(client.DEFAULT_MODEL);

  let textInputElement: HTMLDivElement;

  async function sendMessage() {
    const trimmed = inputMessage.trim();

    if (trimmed === "") return; // todo allow empty if imgs are present

    messages.push({ text: trimmed, role: "user" });
    inputMessage = "";
    await tick();
    scrollChatToBottom();

    const response = await client.getResponse(trimmed, selectedModel);
    messages.push({ text: response, role: "assistant" });

    await tick();
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    // todo if scrolled up more than (?) don't scroll to bottom
    const chat = document.querySelector(".chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function clearMessages() {
    client.clearContext();
    messages.splice(0, messages.length);
  }

  onMount(() => {
    scrollChatToBottom();
    messages.push({
      text: `To show that \\( i_c(t) = \\omega C v_0 \\cos(\\omega t + \\frac{\\pi}{2}) \\) given the voltage across the capacitor \\( v_c(t) = v_0 \\cos(\\omega t) \\) and the relationship \\( i_c(t) = C \\frac{dv_c(t)}{dt} \\), follow these steps:

### 1. Differentiate the Voltage with Respect to Time

Given:
\\[
v_c(t) = v_0 \\cos(\\omega t)
\\]

Differentiate \\( v_c(t) \\) with respect to time \\( t \\):
\\[
\\frac{dv_c(t)}{dt} = \\frac{d}{dt} \\left[ v_0 \\cos(\\omega t) \\right] = -v_0 \\omega \\sin(\\omega t)
\\]

### 2. Express the Current \\( i_c(t) \\)

Using the relationship between current and the derivative of voltage:
\\[
i_c(t) = C \\frac{dv_c(t)}{dt} = C \\left( -v_0 \\omega \\sin(\\omega t) \\right) = -\\omega C v_0 \\sin(\\omega t)
\\]

### 3. Relate Sine to Cosine Using a Phase Shift

Recall the trigonometric identity that relates sine and cosine with a phase shift of \\( \\frac{\\pi}{2} \\):
\\[
\\sin(\\omega t) = \\cos\\left(\\omega t - \\frac{\\pi}{2}\\right)
\\]
\\[
-\\sin(\\omega t) = -\\cos\\left(\\omega t - \\frac{\\pi}{2}\\right) = \\cos\\left(\\omega t + \\frac{\\pi}{2}\\right)
\\]

### 4. Substitute Back into the Current Expression

Substitute the phase-shifted cosine into the expression for \\( i_c(t) \\):
\\[
i_c(t) = -\\omega C v_0 \\sin(\\omega t) = \\omega C v_0 \\cos\\left(\\omega t + \\frac{\\pi}{2}\\right)
\\]

### Final Result

Thus, we have shown that:
\\[
i_c(t) = \\omega C v_0 \\cos\\left(\\omega t + \\frac{\\pi}{2}\\right)
\\]

### Summary

By differentiating the voltage across the capacitor and using trigonometric identities, we established that the current \\( i_c(t) \\) leads the voltage \\( v_c(t) \\) by a phase angle of \\( \\frac{\\pi}{2} \\), resulting in the expression:
\\[
i_c(t) = \\omega C v_0 \\cos\\left(\\omega t + \\frac{\\pi}{2}\\right)
\\]`,
      role: "assistant",
    });
  });
</script>

<div class="h-dvh w-full flex bg-zinc-800 justify-center">
  <div class="w-full flex flex-col">
    <div class="flex flex-col h-full w-full">
      <div
        class="flex flex-col flex-grow p-4 chat overflow-y-auto items-center"
      >
        {#each messages as message, i}
          <div
            class="flex flex-row gap-2 mb-4 w-full sm:w-3/4"
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
                class:bg-neutral-700={message.role === "user"}
              >
                <!-- todo fix to allow messages with images AND text -->
                {#if message.img}
                  <img
                    src={message.img}
                    alt="User uploaded content"
                    class="w-32 h-32 rounded-lg"
                  />
                {:else}
                  <div class="text-white leading-loose">
                    <ResponseMessage {message} />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}

        <!-- spacer -->
        <div class="p-2 sm:p-4"></div>
      </div>

      <div
        class="w-full sm:w-3/4 self-center mb-4 sm:mb-8 flex flex-row items-center px-4 justify-center gap-2"
      >
        <button
          aria-label="Clear chat messages"
          class="bg-transparent hover:bg-neutral-700 fill-neutral-600 hover:fill-neutral-400
          w-14 h-14 p-2.5 rounded-full mt-auto"
          onclick={clearMessages}
        >
          <svg
            viewBox="0 0 512 512"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
            class=""
          >
            <defs id="defs1" />
            <path
              d="M94 187.1C120.8 124.1 183.3 80 256 80c39.7 0 77.8 15.8 105.9 43.9L414.1 176 360 176c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 54.1L395.9 89.9C358.8 52.8 308.5 32 256 32C163.4 32 83.9 88.2 49.8 168.3c-5.2 12.2 .5 26.3 12.7 31.5s26.3-.5 31.5-12.7zm368 157c5.2-12.2-.4-26.3-12.6-31.5s-26.3 .4-31.5 12.6C391 388.1 328.6 432 256 432c-39.7 0-77.8-15.8-105.9-43.9L97.9 336l54.1 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L40 288c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-54.1 52.1 52.1C153.2 459.2 203.5 480 256 480c92.5 0 171.8-56 206-135.9z"
              id="path1"
            />
          </svg>
        </button>
        <div
          class="bg-neutral-700 rounded-[28px] p-4 flex-grow flex flex-row items-center relative"
        >
          <!-- svelte-ignore a11y_autofocus -->
          <div
            contenteditable="plaintext-only"
            autofocus
            role="textbox"
            tabindex="0"
            class="pl-1 pr-8 text-white h-full focus:outline-none input-div inline-block max-h-64 overflow-y-auto w-full"
            bind:this={textInputElement}
            bind:innerText={inputMessage}
            data-placeholder="Type a message..."
            onkeydown={(e) => {
              // todo enter shouldn't send message on touch devices
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          ></div>
          <button
            aria-label="Send message"
            class="bg-white fill-black w-8 h-8 rounded-full absolute right-3 bottom-3 flex items-center justify-center p-2"
            onclick={sendMessage}
          >
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m 273.46931,39.4 c -4.6,-4.7 -10.8,-7.4 -17.4,-7.4 -6.6,0 -12.8,2.7 -17.4,7.4 l -168.000003,176 c -9.2,9.6 -8.8,24.8 0.8,33.9 9.6,9.1 24.8,8.8 33.900003,-0.8 l 126.7,-132.6 V 456 c 0,13.3 10.7,24 24,24 13.3,0 24,-10.7 24,-24 V 115.9 l 126.6,132.7 c 9.2,9.6 24.3,9.9 33.9,0.8 9.6,-9.1 9.9,-24.3 0.8,-33.9 l -168,-176 z"
              />
            </svg>
          </button>
        </div>
        <select
          class="bg-neutral-700 text-white rounded-xl h-14 mt-auto px-2.5"
          bind:value={selectedModel}
        >
          {#each client.getModels() as model}
            <option
              value={model.id}
              title={model.description}
              selected={model.id === selectedModel}>{model.name}</option
            >
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

<style>
  .input-div:empty::before {
    content: attr(data-placeholder);
    color: #a3a3a3;
  }

  ::-webkit-scrollbar {
    background-color: #27272a;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #525252;
    border: 2px solid #27272a;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #737373;
  }
</style>
