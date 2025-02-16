<script lang="ts">
  import type { Message } from "$lib/types";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js";
  import katex from "katex";
  import { marked } from "marked";
  import { tick } from "svelte";

  export let message: Message;
  let renderedText: string;

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

  async function processMessage(text: string) {
    try {
      const texRendered = await renderTex(text);

      const markedRenderer = new marked.Renderer();
      markedRenderer.checkbox = (props: { checked: boolean }) => {
        return `<input type="checkbox" ${props.checked ? "checked" : ""}>`;
      };
      markedRenderer.code = ({ text, lang, escaped }) => {
        return `<pre class="code-container"><code class="language-${lang}">${text}</code></pre>`;
      };

      const markedResult = await marked(texRendered, {
        breaks: true,
        renderer: markedRenderer,
      });

      renderedText = DOMPurify.sanitize(markedResult);

      await tick();
      hljs.highlightAll();

      await tick();
      renderedText = DOMPurify.sanitize(renderedText);
    } catch (error) {
      console.error("Error in rendering pipeline:", error);
    }
  }

  $: {
    if (message?.text) {
      processMessage(message.text);
    }
  }
</script>

<div class="markdown flex flex-col gap-4 w-full max-w-full">
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

  .markdown :global(blockquote) {
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .markdown :global(input[type="checkbox"]) {
    pointer-events: none;
  }

  .markdown :global(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 0.375rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }

  .markdown :global(th) {
    background-color: rgba(255, 255, 255, 0.075);
    font-weight: 600;
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }

  .markdown :global(td) {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }

  .markdown :global(tr:last-child td) {
    border-bottom: none;
  }

  .markdown :global(tr td:last-child) {
    border-right: none;
  }

  .markdown :global(tr th:last-child) {
    border-right: none;
  }

  .markdown :global(code) {
    background-color: rgba(255, 255, 255, 0.2);
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: inline-block;
    color: white;
  }

  .markdown :global(.code-container) {
    background-color: black;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: block;
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 100%;
    overflow-x: auto;
    white-space: pre;
  }

  .markdown :global(.code-container code) {
    display: inline;
    /* width: max-content; */
  }

  .markdown :global(code[class*="language"]) {
    background-color: black;
    padding: 0px;
  }

  :global(math[display="block"]) {
    padding: 0.4rem;
  }
</style>
