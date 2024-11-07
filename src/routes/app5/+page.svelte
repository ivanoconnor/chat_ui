<script>
  import { onMount } from 'svelte';

  let activeTab = 'description';
  let selectedFunction = 'textGeneration';

  const aiFunctions = [
    { id: 'textGeneration', name: 'Text Generation', type: 'Natural Language Processing' },
    { id: 'imageClassification', name: 'Image Classification', type: 'Computer Vision' },
    { id: 'sentimentAnalysis', name: 'Sentiment Analysis', type: 'Natural Language Processing' },
    { id: 'languageTranslation', name: 'Language Translation', type: 'Natural Language Processing' },
  ];

  /**
     * @param {string} tab
     */
  function setActiveTab(tab) {
    activeTab = tab;
  }

  /**
     * @param {string} functionId
     */
  function setSelectedFunction(functionId) {
    selectedFunction = functionId;
    activeTab = 'description';
  }
  
</script>

<svelte:head>
  <title>AI Model Reference - DocsSite</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js"></script>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <h1 class="text-4xl font-bold mb-6">AI Model Reference</h1>

  <div class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">Select an AI Function</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each aiFunctions as aiFunction}
        <button
          class="p-4 border rounded-lg text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 {selectedFunction === aiFunction.id ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}"
          on:click={() => setSelectedFunction(aiFunction.id)}
        >
          <h3 class="font-semibold">{aiFunction.name}</h3>
          <p class="text-sm text-gray-600">{aiFunction.type}</p>
        </button>
      {/each}
    </div>
  </div>

  {#if selectedFunction === 'textGeneration'}
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Text Generation</h2>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <code class="text-sm font-mono">generate_text(prompt: str, max_length: int, temperature: float)</code>
      </div>

      <p class="mb-4">Generate human-like text based on the given prompt.</p>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Parameters</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2 text-left">Name</th>
              <th class="border p-2 text-left">Type</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">prompt</td>
              <td class="border p-2">string</td>
              <td class="border p-2">The initial text to start the generation</td>
            </tr>
            <tr>
              <td class="border p-2">max_length</td>
              <td class="border p-2">integer</td>
              <td class="border p-2">The maximum length of the generated text</td>
            </tr>
            <tr>
              <td class="border p-2">temperature</td>
              <td class="border p-2">float</td>
              <td class="border p-2">Controls randomness in generation (0.0 to 1.0)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Response</h3>
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="flex border-b">
            <button
              class="px-4 py-2 font-medium {activeTab === 'description' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}"
              on:click={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              class="px-4 py-2 font-medium {activeTab === 'example' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}"
              on:click={() => setActiveTab('example')}
            >
              Example
            </button>
          </div>
          <div class="p-4">
            {#if activeTab === 'description'}
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Field</th>
                    <th class="border p-2 text-left">Type</th>
                    <th class="border p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border p-2">generated_text</td>
                    <td class="border p-2">string</td>
                    <td class="border p-2">The generated text based on the input prompt</td>
                  </tr>
                  <tr>
                    <td class="border p-2">token_count</td>
                    <td class="border p-2">integer</td>
                    <td class="border p-2">The number of tokens in the generated text</td>
                  </tr>
                </tbody>
              </table>
            {:else}
              <pre><code class="language-json">{`{
  "generated_text": "Once upon a time in a distant galaxy, there was a young adventurer named Zara. She dreamed of exploring the vast unknown reaches of space...",
  "token_count": 150
}`}</code></pre>
            {/if}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Errors</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2 text-left">Error</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">InvalidPrompt</td>
              <td class="border p-2">The provided prompt is empty or invalid</td>
            </tr>
            <tr>
              <td class="border p-2">InvalidParameters</td>
              <td class="border p-2">The max_length or temperature is out of the valid range</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {:else if selectedFunction === 'imageClassification'}
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Image Classification</h2>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <code class="text-sm font-mono">classify_image(image: bytes, top_k: int)</code>
      </div>

      <p class="mb-4">Classify the contents of an image and return the top k predictions.</p>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Parameters</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2 text-left">Name</th>
              <th class="border p-2 text-left">Type</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">image</td>
              <td class="border p-2">bytes</td>
              <td class="border p-2">The image data to be classified</td>
            </tr>
            <tr>
              <td class="border p-2">top_k</td>
              <td class="border p-2">integer</td>
              <td class="border p-2">The number of top predictions to return</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Response</h3>
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="flex border-b">
            <button
              class="px-4 py-2 font-medium {activeTab === 'description' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}"
              on:click={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              class="px-4 py-2 font-medium {activeTab === 'example' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}"
              on:click={() => setActiveTab('example')}
            >
              Example
            </button>
          </div>
          <div class="p-4">
            {#if activeTab === 'description'}
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Field</th>
                    <th class="border p-2 text-left">Type</th>
                    <th class="border p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border p-2">predictions</td>
                    <td class="border p-2">array</td>
                    <td class="border p-2">List of top k predictions</td>
                  </tr>
                  <tr>
                    <td class="border p-2">predictions[].label</td>
                    <td class="border p-2">string</td>
                    <td class="border p-2">The predicted class label</td>
                  </tr>
                  <tr>
                    <td class="border p-2">predictions[].confidence</td>
                    <td class="border p-2">float</td>
                    <td class="border p-2">The confidence score for the prediction</td>
                  </tr>
                </tbody>
              </table>
            {:else}
              <pre><code class="language-json">{`{
  "predictions": [
    {
      "label": "golden retriever",
      "confidence": 0.98
    },
    {
      "label": "labrador retriever",
      "confidence": 0.01
    },
    {
      "label": "dog",
      "confidence": 0.005
    }
  ]
}`}</code></pre>
            {/if}
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Errors</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2 text-left">Error</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">InvalidImage</td>
              <td class="border p-2">The provided image data is corrupt or in an unsupported format</td>
            </tr>
            <tr>
              <td class="border p-2">InvalidTopK</td>
              <td class="border p-2">The provided top_k value is out of the valid range</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <p>Documentation for this AI function is coming soon.</p>
  {/if}
</div>