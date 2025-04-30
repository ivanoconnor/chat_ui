<script lang="ts">
  import { ChatGPTClient } from "$lib/client";
  import ResponseMessage from "$lib/components/ResponseMessage.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { ALL_MODELS, type Image, type Message } from "$lib/types";
  import { onMount, tick } from "svelte";

  let inputMessage = $state("");
  const messages: Message[] = $state([ChatGPTClient.buildSystemMessage()]);
  const client = new ChatGPTClient();
  let selectedModel = $state(client.DEFAULT_MODEL);
  let attachedImages: Image[] = $state([]);

  let textInputElement: HTMLDivElement;
  let fileInputElement: HTMLInputElement;

  // Toast state
  let toastVisible = $state(false);
  let toastMessage = $state("");

  async function sendMessage() {
    const trimmed = inputMessage.trim();

    if (trimmed === "" && attachedImages.length === 0) return;

    const userMessage: Message = {
      text: trimmed,
      role: "user",
    };

    if (attachedImages.length > 0) {
      userMessage.images = [...attachedImages];
      attachedImages = [];
    }

    messages.push(userMessage);
    inputMessage = "";
    await tick();
    scrollChatToBottom();

    const response = await client.getResponse(messages, selectedModel);
    response.modelId = selectedModel; // Set the model ID on the response
    messages.push(response);

    await tick();
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    // todo if scrolled up more than (?) don't scroll to bottom
    const chat = document.querySelector(".chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function clearMessages() {
    if (messages.length > 0) {
      messages.splice(0, messages.length);
      // Add the system message back to the beginning of the array
      messages.push(ChatGPTClient.buildSystemMessage());
    }
    toastMessage = "Messages cleared";
    toastVisible = true;
  }

  function hideToast() {
    toastVisible = false;
  }

  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    try {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.startsWith("image/")) {
          const dataUrl = await ChatGPTClient.createImageDataURL(file);
          attachedImages = [
            ...attachedImages,
            { url: dataUrl, detail: "auto" },
          ];
        }
      }

      // Reset the file input
      if (fileInputElement) {
        fileInputElement.value = "";
      }

      toastMessage = "Image attached";
      toastVisible = true;
    } catch (error) {
      console.error("Error uploading images:", error);
      toastMessage = "Failed to upload image";
      toastVisible = true;
    }
  }

  function removeAttachedImage(index: number) {
    attachedImages = attachedImages.filter((_, i) => i !== index);
  }

  onMount(() => {
    scrollChatToBottom();
  });
</script>

<div class="h-dvh w-full flex bg-zinc-800 justify-center">
  {#if toastVisible}
    <div class="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
      <Toast message={toastMessage} duration={5000} sendClose={hideToast} />
    </div>
  {/if}
  <div class="w-full flex flex-col">
    <div class="flex flex-col h-full w-full">
      <div
        class="flex flex-col flex-grow p-4 chat overflow-y-auto items-center"
      >
        {#each messages as message, i}
          {#if !["system", "developer"].includes(message.role)}
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
                  <!-- Display images if present -->
                  {#if message.images?.length}
                    <div class="flex flex-wrap gap-2 mb-2 w-full">
                      {#each message.images as img}
                        <img
                          src={img.url}
                          alt="User uploaded content"
                          class="w-32 h-32 object-cover rounded-lg"
                        />
                      {/each}
                    </div>
                  {/if}

                  <!-- Display text if present -->
                  {#if message.text?.trim()}
                    <div class="text-white leading-loose">
                      <ResponseMessage {message} />
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/each}

        <!-- spacer -->
        <div class="p-2 sm:p-4"></div>
      </div>

      <!-- Image preview area -->
      {#if attachedImages.length > 0}
        <div class="w-full sm:w-3/4 self-center px-4 mb-2">
          <div class="flex flex-wrap gap-2 bg-neutral-700 p-3 rounded-xl">
            {#each attachedImages as img, index}
              <div class="relative">
                <img
                  src={img.url}
                  alt="Uploaded file preview"
                  class="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onclick={() => removeAttachedImage(index)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div
        class="w-full sm:w-3/4 self-center mb-4 sm:mb-8 flex flex-row items-center px-4 justify-center gap-2"
      >
        <button
          aria-label="Clear chat messages"
          class="bg-transparent hover:bg-neutral-700 fill-neutral-600 hover:fill-neutral-400
          w-14 h-14 p-2.5 rounded-full mt-auto flex-shrink-0"
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

        <!-- Hidden file input -->
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          class="hidden"
          multiple
          bind:this={fileInputElement}
          onchange={handleImageUpload}
        />

        <div
          class="bg-neutral-700 rounded-[28px] p-4 flex-grow flex flex-row items-center relative"
        >
          <!-- Image attachment button -->
          <button
            aria-label="Attach image"
            class="group bg-transparent hover:bg-neutral-600 rounded-full w-8 h-8 flex items-center justify-center absolute left-3 top-3 p-1.5"
            onclick={() => fileInputElement?.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              fill="currentColor"
              class="fill-neutral-400 w-full h-full"
            >
              <path
                d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm152 32c5.3 0 10.2 2.6 13.2 6.9l88 128c3.4 4.9 3.7 11.3 1 16.5s-8.2 8.6-14.2 8.6l-88 0-40 0-48 0-48 0c-5.8 0-11.1-3.1-13.9-8.1s-2.8-11.2 .2-16.1l48-80c2.9-4.8 8.1-7.8 13.7-7.8s10.8 2.9 13.7 7.8l12.8 21.4 48.3-70.2c3-4.3 7.9-6.9 13.2-6.9z"
              />
            </svg>
          </button>

          <!-- svelte-ignore a11y_autofocus -->
          <div
            contenteditable="plaintext-only"
            autofocus
            role="textbox"
            tabindex="0"
            class="pl-8 pr-8 text-white h-full focus:outline-none input-div
            inline-block max-h-64 overflow-y-auto w-full max-w-full text-wrap"
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
          {#each ALL_MODELS as model}
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
