<script lang="ts">
  let {
    sendClose,
    message = "",
    duration = 3000,
  }: {
    sendClose: () => void;
    message: string;
    duration: number;
  } = $props();

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function close() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    sendClose();
  }

  $effect(() => {
    if (duration > 0) {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for auto-dismiss
      timeoutId = setTimeout(() => {
        close();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
</script>

<div
  class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none"
>
  <div
    class="bg-gray-100/95 text-black rounded-lg px-4 py-2.5 flex items-center justify-between shadow-md text-sm w-44 pointer-events-auto animate-fade-in"
  >
    <span class="flex items-center">{message}</span>
    <button
      class="bg-transparent border-0 cursor-pointer p-1 rounded-full flex items-center justify-center hover:bg-black/10"
      onclick={close}
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease;
  }
</style>
