<script lang="ts">
import { address, connectionStatus, enableTLS, lastFromRadio, myNodeMetadata, myNodeNum, nodes } from "api/src/vars"
import axios from "axios"
import { preventDefault, run } from "svelte/legacy"
import Card from "./lib/Card.svelte"
import { hasAccess } from "./lib/util"
import { smallMode } from "./Nodes.svelte"

interface Props {
  [key: string]: unknown
}

let { ...rest }: Props = $props()

let connectionIcons = {
  connected: "🟢",
  connecting: "🟡",
  configuring: "🟡",
  searching: "🟡",
  reconnecting: "🟡",
  disconnected: "🔴",
}

function connect() {
  axios.post("/connect", { address: $address })
}

function disconnect() {
  axios.post("/disconnect")
}

let spinnerAngle = $state(0)
let animationInterval: number | undefined

run(() => {
  // Clear any existing interval
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = undefined
  }

  // Start animation if configuring
  if ($lastFromRadio && $connectionStatus == "configuring") {
    animationInterval = setInterval(() => {
      spinnerAngle = (spinnerAngle + 8) % 360
    }, 50) // Update every 50ms for smooth animation
  }
})
</script>

<Card title="Address" {...rest}>
  <!-- @migration-task: migrate this slot by hand, `title` would shadow a prop on the parent component -->
  <h2 slot="title" class="rounded-t flex items-center h-full gap-2">
    <div class="grow">Address</div>
    {#if $connectionStatus}
      <div class="h-full text-right w-full text-yellow-300 font-normal text-sm mt-1 capitalize">{$connectionStatus}</div>
      {#if $connectionStatus == 'configuring'}
        <div style="transform: rotate({spinnerAngle}deg);">⌛</div>
      {/if}
    {/if}
  </h2>
  <form onsubmit={preventDefault(connect)} class="grid {$smallMode ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'} p-2 gap-1 items-center text-sm">
    <!-- Icon and Input -->
    <div class="flex gap-2 items-center">
      {connectionIcons[$connectionStatus]}
      <input disabled={$connectionStatus != 'disconnected'} size="3" class="input w-full" type="text" bind:value={$address} placeholder="Device IP" />
    </div>
    <!-- Cancel Button -->
    {#if $hasAccess}
      {#if $connectionStatus == 'disconnected'}
        <label class="select-none btn cursor-pointer text-center text-sm">
          TLS
          <input type="checkbox" bind:checked={$enableTLS} />
        </label>
        <button class="btn w-full h-full col-span-full saturate-150">Connect</button>
      {:else if $connectionStatus == 'connected'}
        <button type="button" class="btn w-full h-full {$smallMode ? 'col-span-full' : ''}" onclick={disconnect}>Disconnect</button>
      {:else if ['searching', 'connecting', 'configuring', 'reconnecting'].includes($connectionStatus)}
        <button type="button" class="btn w-full h-full" onclick={disconnect}>Cancel</button>
      {/if}
    {/if}
  </form>
</Card>
