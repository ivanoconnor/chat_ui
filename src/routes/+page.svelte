<svelte:head>
  <title>Welcome to DocsSite</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <h1 class="text-4xl font-bold mb-6">Welcome to DocsSite</h1>

  <p class="mb-4">
    This is a sample documentation site built with SvelteKit. It demonstrates a
    basic layout for organizing and presenting documentation.
  </p>

  <h2 class="text-2xl font-semibold mt-8 mb-4">Quick Links</h2>

  <ul class="list-disc pl-6 space-y-2">
    <li>
      <a href="/getting-started" class="text-blue-600 hover:underline"
        >Getting Started Guide</a
      >
    </li>
    <li>
      <a href="/api-reference" class="text-blue-600 hover:underline"
        >API Reference</a
      >
    </li>
    <li>
      <a href="/examples" class="text-blue-600 hover:underline">Code Examples</a
      >
    </li>
  </ul>

  <h2 class="text-2xl font-semibold mt-8 mb-4">Latest Updates</h2>

  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-2">New Feature: Dark Mode</h3>
    <p class="text-gray-600">
      We've added a new dark mode feature to improve readability in low-light
      environments.
    </p>
    <a
      href="/blog/dark-mode"
      class="text-blue-600 hover:underline mt-2 inline-block">Read more</a
    >
  </div>
</div>
