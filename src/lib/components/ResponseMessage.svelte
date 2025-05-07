<script lang="ts">
  import type { Message } from "$lib/types";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js";
  import katex from "katex";
  import { marked } from "marked";
  import { tick } from "svelte";

  let { message }: { message: Message } = $props();
  let renderedText = $state("");
  let isHovered = $state(false);

  async function processMessage(text: string) {
    try {
      // Store LaTeX expressions with unique identifiers
      const latexExpressions = {
        display: [] as string[],
        inline: [] as string[],
      };

      // Replace display LaTeX with placeholders
      let processedText = text.replace(
        /\\\[((.|\n)*?)\\\]/g,
        (match, content) => {
          const id = `LATEX_DISPLAY_${latexExpressions.display.length}`;
          latexExpressions.display.push(content);
          return id;
        },
      );

      // Replace inline LaTeX with placeholders
      processedText = processedText.replace(
        /\\\((.*?)\\\)/g,
        (match, content) => {
          const id = `LATEX_INLINE_${latexExpressions.inline.length}`;
          latexExpressions.inline.push(content);
          return id;
        },
      );

      // Process markdown
      const markedRenderer = new marked.Renderer();
      markedRenderer.checkbox = (props: { checked: boolean }) => {
        return `<input type="checkbox" ${props.checked ? "checked" : ""}>`;
      };
      markedRenderer.code = ({ text, lang, escaped }) => {
        return `<pre class="code-container"><div class="flex items-center px-4 py-2 text-xs font-sans justify-between h-9 select-none bg-neutral-900 relative left-0 sticky">${lang || "text"}</div><code class="language-${lang}">${text}</code></pre>`;
      };

      const markedResult = await marked(processedText, {
        breaks: true,
        renderer: markedRenderer,
      });

      // Replace placeholders with rendered LaTeX
      let finalResult = markedResult;

      // Replace display LaTeX placeholders
      latexExpressions.display.forEach((latex, index) => {
        const placeholder = `LATEX_DISPLAY_${index}`;
        const rendered = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          output: "mathml",
        });
        finalResult = finalResult.replace(placeholder, rendered);
      });

      // Replace inline LaTeX placeholders
      latexExpressions.inline.forEach((latex, index) => {
        const placeholder = `LATEX_INLINE_${index}`;
        const rendered = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false,
          output: "mathml",
        });
        finalResult = finalResult.replace(placeholder, rendered);
      });

      renderedText = DOMPurify.sanitize(finalResult);

      await tick();
      hljs.highlightAll();

      await tick();
      renderedText = DOMPurify.sanitize(renderedText);
    } catch (error) {
      console.error("Error in rendering pipeline:", error);
    }
  }

  function copyAsMarkdown() {
    if (message?.text) {
      navigator.clipboard
        .writeText(message.text)
        .then(() => {
          showCopySuccess();
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          showCopyFail();
        });
    }
  }

  async function copyWithFormatting() {
    const container = document.createElement("div");
    container.innerHTML = renderedText;

    // Remove copy buttons from the copied content if present
    const buttonsToRemove = container.querySelectorAll(".copy-buttons");
    buttonsToRemove.forEach((btn) => btn.remove());
    const htmlToCopy = container.innerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([htmlToCopy], { type: "text/html" }),
          "text/plain": new Blob([container.innerText], { type: "text/plain" }), // fallback
        }),
      ]);
      showCopySuccess();
    } catch (err) {
      console.error("Failed to copy formatted text: ", err);
      showCopyFail();
    }
  }

  function showCopySuccess() {
    // Could implement a toast or visual feedback here
  }

  function showCopyFail() {
    // Could implement a toast or visual feedback here
  }

  $effect(() => {
    if (message?.text) {
      processMessage(message.text);
    }
  });
</script>

<div
  class="markdown flex flex-col gap-4 max-w-full relative group"
  role="region"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  {@html renderedText}

  {#if message.role === "assistant"}
    <div
      class="message-footer flex flex-row items-center gap-2 mt-1 transition-opacity duration-200"
      class:opacity-0={!isHovered}
      class:opacity-100={isHovered}
    >
      {#if message.modelId}
        <div class="text-xs text-neutral-400 font-mono mr-auto">
          {message.modelId}
        </div>
      {/if}

      <button
        onclick={copyAsMarkdown}
        class="text-xs bg-neutral-700 hover:bg-neutral-600 text-white py-1 px-2 rounded flex items-center gap-1"
        title="Copy as Markdown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          fill="currentColor"
          class="h-3 w-3"
          ><path
            d="M214.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l96 0 0-184c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 184 96 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-160 160z"
          /></svg
        >
        MD
      </button>

      <button
        onclick={copyWithFormatting}
        class="text-xs bg-neutral-700 hover:bg-neutral-600 text-white py-1 px-2 rounded flex items-center gap-1"
        title="Copy with formatting"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path
            d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
          />
        </svg>
        Text
      </button>
    </div>
  {/if}
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
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: block;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-color: #171717 transparent;
    /* white-space: pre; */
  }

  /* .markdown :global(.code-container code) {
    display: inline;
  } */

  .markdown :global(code[class*="language"]) {
    background-color: black;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  :global(math[display="block"]) {
    padding: 0.4rem;
  }
</style>
