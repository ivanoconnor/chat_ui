<script lang="ts">
  import { marked } from "marked";
  import type { Message } from "$lib/types";
  import hljs from "highlight.js";
  import { onMount } from "svelte";

  export let message: Message;
  onMount(() => {
    // hljs.configure({ languages: ["python"] });
    // hljs.initHighlightingOnLoad();
    hljs.highlightAll();
  });
</script>

<div class="markdown flex flex-col gap-3">
  {@html marked(message.text)}
</div>

<style>
  .markdown :global(h1) {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 600;
  }

  .markdown :global(h2) {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
  }

  .markdown :global(h3) {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 600;
  }

  .markdown :global(strong) {
    font-weight: 600;
  }

  .markdown :global(ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  .markdown :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
  }

  .markdown :global(li) {
    margin-bottom: 0.25rem;
  }

  .markdown :global(code) {
    background-color: black;
    /* color: white; */
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: inline-block;
    border: 1px solid #52525b;
  }
</style>
