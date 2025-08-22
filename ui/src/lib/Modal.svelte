<script lang="ts">
import { fade, scale } from "svelte/transition"

interface Props {
  visible?: boolean
  title?: string
  fillHeight?: boolean
  children?: import("svelte").Snippet
  [key: string]: any
}

let { visible = $bindable(false), title = "", fillHeight = false, children, ...rest }: Props = $props()

// Determine if we're running in Electron with native modal support
const isElectronWithNativeModal = typeof window !== 'undefined' && window.api?.openSettingsWindow

function handleKeydown(e: KeyboardEvent) {
  if (visible && e.code == "Escape") {
    handleClose()
    e.stopPropagation()
  }
}

function handleClose() {
  visible = false
  
  // If we're in Electron and using native modals, close the BrowserWindow
  if (isElectronWithNativeModal && window.api?.closeSettingsWindow) {
    window.api.closeSettingsWindow()
  }
}
</script>

<svelte:window onkeydowncapture={handleKeydown} />

{#if visible}
  <!-- Only show overlay and transitions for div modals, not native BrowserWindow modals -->
  {#if !isElectronWithNativeModal}
    <button transition:fade={{ duration: 150 }} class="bg-black/30 fixed top-0 left-0 w-full h-full z-20" aria-label="Close modal" onclick={() => handleClose()}> </button>
  {/if}
  
  <div
    transition:scale={{ duration: isElectronWithNativeModal ? 0 : 500, start: 0.8 }}
    id="popover-default"
    role="tooltip"
    class:h-full={fillHeight}
    class="{rest.class || ''} {isElectronWithNativeModal ? 'h-full w-full' : 'fixed z-20 w-[80%] left-[10%] top-[10%] max-h-[80%]'} flex flex-col
    text-sm transition-opacity duration-300 border rounded-lg shadow-sm text-gray-400 border-gray-600 bg-gray-800"
  >
    <div class="px-3 py-2 border-b rounded-t-lg border-gray-600 bg-gray-700">
      {#if title != undefined}
        <h3 class="font-semibold text-white flex">
          <div class="grow">
            {title}
          </div>

          <button onclick={() => handleClose()} class="rounded-full bg-black/20 w-7 text-center text-sm opacity-90">X</button>
        </h3>
      {/if}
    </div>
    <div class="px-3 py-2 overflow-auto h-full">
      {#if children}{@render children()}{:else}
        <p>And here's some amazing content. It's very engaging. Right?</p>
      {/if}
    </div>
    <button class="btn btn-sm block ml-auto m-3 btn-primary" onclick={() => handleClose()}>Close</button>
  </div>
{/if}
