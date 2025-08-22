<script module>
import { writable } from 'svelte/store'

export const showConfigModal = writable(false)
export const modalPage = writable("Settings")

export function showPage(pageName = "Settings") {
  modalPage.set(pageName)
  showConfigModal.set(true)
}
</script>

<script>
  import Modal from './lib/Modal.svelte'
  import SettingsMain from './components/SettingsMain.svelte'
</script>

<Modal title="MeshSense" bind:visible={$showConfigModal}>
  <SettingsMain {showConfigModal} {modalPage} />
</Modal>
