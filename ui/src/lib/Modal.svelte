<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  interface Props {
    visible?: boolean;
    title?: string;
    fillHeight?: boolean;
    children?: import('svelte').Snippet;
    [key: string]: any
  }

  let {
    visible = $bindable(false),
    title = '',
    fillHeight = false,
    children,
    ...rest
  }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (visible && e.code == 'Escape') {
      visible = false
      e.stopPropagation()
    }
  }
</script>

<svelte:window onkeydowncapture={handleKeydown} />

{#if visible}
  <button transition:fade={{ duration: 150 }} class="bg-black/30 fixed top-0 left-0 w-full h-full z-20" onclick={() => (visible = false)}> </button>
  <div
    transition:scale={{ duration: 500, start: 0.8 }}
    id="popover-default"
    role="tooltip"
    class:h-full={fillHeight}
    class="{rest.class || ''} fixed z-20 w-[80%] left-[10%] top-[10%] max-h-[80%] flex flex-col
    text-sm transition-opacity duration-300 border rounded-lg shadow-sm text-gray-400 border-gray-600 bg-gray-800"
  >
    <div class="px-3 py-2 border-b rounded-t-lg border-gray-600 bg-gray-700">
      {#if title != undefined}
        <h3 class="font-semibold text-white flex">
          <div class="grow">
            {title}
          </div>

          <button onclick={() => (visible = false)} class="rounded-full bg-black/20 w-7 text-center text-sm opacity-90">X</button>
        </h3>
      {/if}
    </div>
    <div class="px-3 py-2 overflow-auto h-full">
      {#if children}{@render children()}{:else}
        <p>And here's some amazing content. It's very engaging. Right?</p>
      {/if}
    </div>
    <button class="btn btn-sm block ml-auto m-3 btn-primary" onclick={() => (visible = false)}>Close</button>
  </div>
{/if}
