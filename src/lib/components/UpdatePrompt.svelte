<script lang="ts">
  import { onMount } from "svelte";

  // the downloaded new version, held back while this page runs the old one
  let waiting = $state.raw<ServiceWorker | null>(null);
  // set once the reload button is pressed, so only that swap reloads the page
  let asked = false;

  function accept(): void {
    asked = true;
    waiting?.postMessage("activate");
  }

  onMount(() => {
    if ("serviceWorker" in navigator) {
      const container = navigator.serviceWorker;
      // without a worker in control this is a first visit, not an update
      const offer = (worker: ServiceWorker | null): void => {
        if (worker && container.controller) {
          waiting = worker;
        }
      };
      // a worker still installing is offered once it finishes
      const watch = (worker: ServiceWorker | null): void => {
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") {
            offer(worker);
          }
        });
      };
      void container.ready.then((registration) => {
        offer(registration.waiting);
        watch(registration.installing);
        registration.addEventListener("updatefound", () => {
          watch(registration.installing);
        });
      });
      const swapped = (): void => {
        if (asked) {
          location.reload();
        }
      };
      container.addEventListener("controllerchange", swapped);
      return () => {
        container.removeEventListener("controllerchange", swapped);
      };
    }
  });
</script>

{#if waiting}
  <div
    class="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-4 rounded-full border-[1.5px] border-line bg-raised py-2 pr-2 pl-5 shadow-lg"
    role="status"
  >
    <span class="font-semibold">A new version is ready.</span>
    <button
      type="button"
      class="rounded-full bg-accent px-4 py-1.5 font-semibold text-accent-ink transition duration-150 active:scale-[0.97] motion-reduce:transition-none"
      onclick={accept}
    >
      Reload
    </button>
  </div>
{/if}
