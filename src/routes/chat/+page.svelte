<script lang="ts">
  import { ChatGPTClient } from "$lib/client";
  import ResponseMessage from "$lib/components/ResponseMessage.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import {
    ALL_MODELS,
    type FileAttachment,
    type Image,
    type Message,
  } from "$lib/types";
  import { onMount, tick } from "svelte";

  let inputMessage = $state("");
  const client = new ChatGPTClient();
  let selectedModel = $state(client.DEFAULT_MODEL);
  let attachedImages: Image[] = $state([]);
  let attachedFiles: FileAttachment[] = $state([]);

  const systemMessage = $derived(
    ChatGPTClient.buildSystemMessage(
      ChatGPTClient.getModelById(selectedModel) || ALL_MODELS[0],
    ),
  );

  // Initialize messages as empty and use a derived value that includes the system message
  const userMessages: Message[] = $state([]);
  
  // Derived messages that always includes the current system message
  const messages = $derived([systemMessage, ...userMessages]);

  let textInputElement: HTMLDivElement;
  let fileInputElement: HTMLInputElement;

  // Toast state
  let toastVisible = $state(false);
  let toastMessage = $state("");

  async function sendMessage() {
    const trimmed = inputMessage.trim();

    if (
      trimmed === "" &&
      attachedImages.length === 0 &&
      attachedFiles.length === 0
    )
      return;

    const userMessage: Message = {
      text: trimmed,
      role: "user",
    };

    if (attachedImages.length > 0) {
      userMessage.images = [...attachedImages];
      attachedImages = [];
    }

    if (attachedFiles.length > 0) {
      userMessage.files = [...attachedFiles];
      attachedFiles = [];
    }

    userMessages.push(userMessage);
    inputMessage = "";
    await tick();
    scrollChatToBottom();

    const response = await client.getResponse(messages, selectedModel);
    response.modelId = selectedModel;
    userMessages.push(response);

    await tick();
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    // todo if scrolled up more than (?) don't scroll to bottom
    const chat = document.querySelector(".chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function clearMessages() {
    if (userMessages.length > 0) {
      userMessages.splice(0, userMessages.length);
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
          const dataUrl = await ChatGPTClient.createFileDataURL(file);
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

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    try {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.startsWith("image/")) {
          const dataUrl = await ChatGPTClient.createFileDataURL(file);
          attachedImages = [
            ...attachedImages,
            { url: dataUrl, detail: "auto" },
          ];
        } else if (file.type === "application/pdf") {
          const dataUrl = await ChatGPTClient.createFileDataURL(file);
          attachedFiles = [
            ...attachedFiles,
            {
              filename: file.name,
              url: dataUrl,
              type: file.type,
            },
          ];
        }
      }

      // Reset the file input
      if (fileInputElement) {
        fileInputElement.value = "";
      }

      toastMessage = "File attached";
      toastVisible = true;
    } catch (error) {
      console.error("Error uploading files:", error);
      toastMessage = "Failed to upload file";
      toastVisible = true;
    }
  }

  async function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    let hasImage = false;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        hasImage = true;
        const file = item.getAsFile();
        if (file) {
          try {
            const dataUrl = await ChatGPTClient.createFileDataURL(file);
            attachedImages = [
              ...attachedImages,
              { url: dataUrl, detail: "auto" },
            ];

            toastMessage = "Image pasted";
            toastVisible = true;
          } catch (error) {
            console.error("Error processing pasted image:", error);
            toastMessage = "Failed to process pasted image";
            toastVisible = true;
          }
        }
      }
    }

    // Let the paste event continue only if no images were found
    // This prevents pasting image representation into the text
    if (hasImage) {
      event.preventDefault();
    }
  }

  function removeAttachedImage(index: number) {
    attachedImages = attachedImages.filter((_, i) => i !== index);
  }

  function removeAttachedFile(index: number) {
    attachedFiles = attachedFiles.filter((_, i) => i !== index);
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
            <!-- Display images first if present -->
            {#if message.images?.length}
              <div
                class="flex flex-row gap-2 mb-1 w-full sm:w-3/4"
                class:justify-end={message.role === "user"}
                class:justify-start={message.role !== "user"}
              >
                <div
                  class="flex flex-col items-center max-w-full"
                  class:items-end={message.role === "user"}
                  class:items-start={message.role !== "user"}
                >
                  <div
                    class="flex flex-col items-center rounded-xl py-2 px-4 max-w-full"
                    class:bg-neutral-700={message.role === "user"}
                  >
                    <div class="flex flex-wrap gap-2 max-w-full">
                      {#each message.images as img}
                        <div class="chat-image-container">
                          <img
                            src={img.url}
                            alt="User uploaded content"
                            class="chat-image"
                          />
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            <!-- Display text in a separate bubble if present -->
            {#if message.text?.trim()}
              <div
                class="flex flex-row gap-2 mb-4 w-full sm:w-3/4"
                class:justify-end={message.role === "user"}
                class:justify-start={message.role !== "user"}
                class:mb-1={i < messages.length - 1 &&
                  messages[i + 1].role === message.role}
              >
                <div
                  class="flex flex-col items-center max-w-full"
                  class:items-end={message.role === "user"}
                  class:items-start={message.role !== "user"}
                >
                  <div
                    class="flex flex-col items-center rounded-xl py-2 px-4 max-w-full"
                    class:bg-neutral-700={message.role === "user"}
                  >
                    <div class="text-white leading-loose max-w-full">
                      <ResponseMessage {message} />
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            <!-- File attachments display -->
            {#if message.files?.length}
              <div
                class="flex flex-row gap-2 mb-1 w-full sm:w-3/4"
                class:justify-end={message.role === "user"}
                class:justify-start={message.role !== "user"}
              >
                <div
                  class="flex flex-col items-center max-w-full"
                  class:items-end={message.role === "user"}
                  class:items-start={message.role !== "user"}
                >
                  <div
                    class="flex flex-col items-center rounded-xl py-2 px-4 max-w-full"
                    class:bg-neutral-700={message.role === "user"}
                  >
                    <div class="flex flex-wrap gap-2 max-w-full">
                      {#each message.files as file}
                        <div class="chat-file-container">
                          <div
                            class="chat-file p-2 bg-neutral-800 rounded-lg flex items-center"
                          >
                            <svg
                              class="w-5 h-5 mr-2 fill-neutral-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"
                              />
                            </svg>
                            <span class="text-neutral-200 text-sm"
                              >{file.filename}</span
                            >
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/if}
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

      <!-- File preview area -->
      {#if attachedFiles.length > 0}
        <div class="w-full sm:w-3/4 self-center px-4 mb-2">
          <div class="flex flex-wrap gap-2 bg-neutral-700 p-3 rounded-xl">
            {#each attachedFiles as file, index}
              <div class="relative">
                <div
                  class="w-24 h-24 flex items-center justify-center bg-gray-800 rounded-lg p-2 text-center"
                >
                  <div>
                    <svg
                      class="w-8 h-8 mx-auto mb-1 fill-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                    >
                      <path
                        d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-16.8 15.8-24.1 26.3-10.7 15.5-11.6 14.2-10.8 13.9zm238.8 8c-.2-17.7-10.5-30.8-21.2-36.3 8.9-.4 16.4 1.8 22.3 5.3 8.5 4.8 9.1 11.9 6 22.2-.2.7-.2 7.8-7.1 8.8zm-9.4-73.2c15.5-6.2 29.2-2.1 47.5-16.4 7.7-6 13.5-13.3 15.9-26.3-8.1-9.1-20.7-3.1-29.9-1.5-23.2 4.1-41.8 24.2-47.7 50.3-1.1 5.1-1.1 13-1.8 19.9h.1c9.7-15.3 13.1-17.8 16-20-.1-.1 3.2-3.2-.1-6zm61.1-15.4c-1-.8-3.3-1.2-4-1.2.6 1.7 3.7 13 5.6 11.9 1.7-1 .9-5.1-1.6-10.7zm-8.7 19.9c-2.3 3.7-6.5 12.1-11.9 8.1-1.3-1 2.6-5.2 2-9.8-.5-4.7-.6-7.8-1.3-9.7-2.3-6.4-7.9-9-13-10.1 1.3 2.5 2.6 10.5.8 18.2-1.3 5.5-2.8 7.8-4.6 8.8-1 .7-2.6 1-3.6-.2-1.2-1.4.5-8.2 2.1-14.2 1.8-6.6 3.1-13.9-.6-19.2-4.2-6.3-12.9-6.5-18.1-6 .3 1.1.5 7.2-2.7 13.6-2.3 4.5-6.1 8-8.5 9.3-2 1.1-3.8 1.2-4.5-.7-.7-1.8 0-8.5 4.5-15.2 3.1-4.6 6.1-7.2 9.1-14.9 3.1-7.9-2-16-8.7-19.8-6.1-3.4-17.5-4.5-27.2.2-14.6 7.1-23 23.5-25 32.8-.4 2 .2 6.4 2.4 7.4 3.6 1.7 5.3-2.3 6-4.2.5-1.5 5.4-18.2 13.9-23.7 5.6-3.6 11.3-2 14 2.9 1.5 2.7 1.3 8.3-.9 13-3.6 7.9-10.3 15.3-10.3 22.5 0 3.5.2 7.2 3.3 9.3 5 3.3 13.7-3.5 17.2-7.7 3.1-3.7 5.1-7.3 6.3-11.5 1 2.8.9 15.6 7.6 16.5 2.9.4 7.2-2.7 9.5-5.1 10.1-10.6 3.8-20.3 8.1-23.3 1.4-1 3.3-.8 4.2.5 1.1 1.7-.3 8.7-1.3 12.7-2.7 11.2-6.6 24.4-.2 33.3 4.7 6.5 10.8 8.9 14.6 9.2 0-8.6 2.4-27.1 13.7-35.8 4.7-3.7 9.5-3.3 13.5.3 3.6 3.2 3.9 7.9 2.4 11-.5 1-2.2 4.2-5.8 7.2 9.7-1.3 16.4 2.7 20.2 7.7 2.7-1.1 8.1-5 9.2-8.1"
                      />
                    </svg>
                    <span class="text-xs text-neutral-300 truncate block"
                      >{file.filename}</span
                    >
                  </div>
                  <button
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onclick={() => removeAttachedFile(index)}
                  >
                    ×
                  </button>
                </div>
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
          accept="image/png, image/jpeg, image/webp, image/gif, application/pdf"
          class="hidden"
          multiple
          bind:this={fileInputElement}
          onchange={handleFileUpload}
        />

        <div
          class="bg-neutral-700 rounded-[28px] p-4 flex-grow flex flex-row items-center relative"
        >
          <!-- Image attachment button -->
          <button
            aria-label="Attach file"
            class="group bg-transparent hover:bg-neutral-600 rounded-full w-8 h-8 flex items-center justify-center absolute left-3 bottom-3 p-1.5"
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
            onpaste={handlePaste}
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

  .input-div {
    white-space: pre-wrap; /* Preserves spaces, only breaks at whitespace */
    word-break: normal; /* Default breaking behavior - break at word boundaries */
    overflow-wrap: anywhere; /* Forces very long words to break if needed without expanding container */
  }

  /* Added styles for chat images that preserve aspect ratio with min/max constraints */
  .chat-image-container {
    min-width: 120px;
    min-height: 120px;
    max-width: 300px;
    max-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-image {
    border-radius: 0.5rem;
    object-fit: contain;
    max-width: 100%;
    max-height: 300px;
    min-width: 80px;
    min-height: 80px;
    width: auto;
    height: auto;
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
