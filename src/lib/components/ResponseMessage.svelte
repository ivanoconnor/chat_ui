<script lang="ts">
  import type { Message } from "$lib/types";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js";
  import katex from "katex";
  import { marked } from "marked";
  import { tick } from "svelte";

  export let message: Message;

  async function renderTex(html: Promise<string> | string) {
    return (await html)
      .replace(/\\\((.*?)\\\)/g, (_, match) => {
        return katex.renderToString(match, {
          throwOnError: false,
          displayMode: false,
          output: "mathml",
        });
      })
      .replace(/\\\[((.|\n)*?)\\\]/g, (_, match) => {
        return katex.renderToString(match, {
          throwOnError: false,
          displayMode: true,
          output: "mathml",
        });
      });
  }

  let renderedText: string;
  $: (async () => {
    renderedText = DOMPurify.sanitize(
      await marked(await renderTex(message.text), {
        breaks: true,
      }),
    );
    await tick();
    hljs.highlightAll();
    await tick();
    renderedText = DOMPurify.sanitize(renderedText);
  })();
</script>

<div class="markdown flex flex-col gap-4">
  {@html renderedText}
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
    background-color: #404040;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: inline-block;
    color: white;
  }

  .markdown :global(code[class*="language-"]) {
    background-color: black;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: inline-block;
    border: 1px solid #404040;
  }

  :global(math[display="block"]) {
    padding: 0.4rem;
  }
</style>
