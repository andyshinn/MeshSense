<script lang="ts">
  import { run } from 'svelte/legacy';

  import axios from 'axios'
  import { hasAccess } from './util'
  import { State } from 'api/src/lib/state'
  import { headless } from 'api/src/vars'
  import { tick } from 'svelte'



  

  interface Props {
    updateStatus?: any;
    status?: string;
    progress?: number;
    version?: string;
    // $: document.title = `MeshSense ${$version ?? 'Development'}`
    friendlyMessages?: any;
  }

  let {
    updateStatus = new State<any>('updateStatus', {}),
    status = $bindable(''),
    progress = $bindable(0),
    version = $bindable(''),
    friendlyMessages = {
    'update-available': 'New update!',
    'download-progress': 'Downloading Update',
    'update-downloaded': 'Update Ready'
  }
  }: Props = $props();

  run(() => {
    status = friendlyMessages[$updateStatus.event]
    progress = $updateStatus.body?.percent
    version = $updateStatus.body?.version
  });

  function installUpdate() {
    status = 'Installing Update'
    if ($headless) status += '. Please manually restart MeshSense when in headless mode.'
    tick().then(() => {
      axios.get('/installUpdate', { timeout: 500 })
    })
  }

  //runExample()
</script>

{#if status && $hasAccess}
  <div class="fixed top-12 right-5 p-2 w-40 bg-slate-900 rounded-xl z-[99]">
    <div class="text-xs grid items-center gap-1">
      {#if status == 'Update Ready'}
        <button class="btn btn-xs btn-primary grow py-2" onclick={installUpdate}>Install<br />MeshSense {version || ''}</button>
        <!-- <button class="btn btn-xs btn-primary saturate-50" on:click={() => (status = '')}>Changelog</button> -->
        <button class="btn btn-xs btn-primary saturate-50" onclick={() => (status = '')}>Later</button>
      {:else}
        <div class="flex flex-col gap-1">
          {status}
          {#if progress > 0}
            <progress class="progress rounded" value={progress} max="100"></progress>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
