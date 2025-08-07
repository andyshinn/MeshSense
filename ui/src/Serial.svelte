<script lang="ts">
  import { State } from 'api/src/lib/state'
  import Card from './lib/Card.svelte'
  import { address, connectionStatus } from 'api/src/vars'
  import { smallMode } from './Nodes.svelte'
  import axios from 'axios'
  import { hasAccess } from './lib/util'

  interface SerialPortInfo {
    path: string
    name: string
    manufacturer?: string
    serialNumber?: string
    locationId?: string
    vendorId?: string
    productId?: string
  }

  let serialPortList = new State<SerialPortInfo[]>('serialPortList', [])
  let scanning = false

  async function refreshPorts() {
    if (scanning) return
    scanning = true
    
    try {
      const response = await axios.post('/serial/scan')
      serialPortList.set(response.data)
    } catch (error) {
      console.error('Failed to scan serial ports:', error)
    } finally {
      scanning = false
    }
  }

  // Auto-refresh on component mount
  refreshPorts()
</script>

{#if $connectionStatus == 'disconnected' && $hasAccess}
  <Card {...$$restProps}>
    <h2 slot="title" class="flex items-center justify-between">
      <span>Serial Ports</span>
      <button
        class="refresh-btn"
        class:scanning
        on:click={refreshPorts}
        disabled={scanning}
        title={scanning ? 'Scanning...' : 'Refresh serial ports'}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          class:animate-spin={scanning}
        >
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
      </button>
    </h2>
    <div class="text-sm p-2 flex flex-col gap-1">
      {#if $serialPortList.length == 0}
        <p>
          No serial {#if $smallMode}<br />{/if}ports detected
        </p>
      {/if}
      {#each $serialPortList as port}
        <button
          class="btn"
          on:click={() => {
            $address = port.path
            axios.post('/connect', { address: port.path })
          }}
        >
          {port.name}
        </button>
      {/each}
    </div>
  </Card>
{/if}

<style>
  .refresh-btn {
    @apply p-1 rounded hover:bg-white/20 transition-colors;
  }
  
  .refresh-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>