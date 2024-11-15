<script lang="ts">
  import { ChatGPTService } from "$lib/services/chatgpt";
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
