import kfs from "key-file-storage"
import { join } from "path"
import { dataDirectory } from "./paths"
import { State } from "./state"

export const store = kfs(join(dataDirectory, "state"))
// store.version = 0.1

/** Return key-values as a `Record` object */
export function getAllKeyValues(): Record<string, unknown> {
  return store["/"].reduce((obj: Record<string, unknown>, key: string) => {
    obj[key] = store[key]
    return obj
  }, {})
}

State.defaults = store
State.subscribe(({ state, action, args }) => {
  if (state.flags.persist == true || state.flags.persist == "api") store(state.name, state.value)
})
