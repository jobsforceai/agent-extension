// utils/storage.ts
import { Storage } from "@plasmohq/storage"

export const storage = new Storage({
  area: "local" // or "sync" if you want sync across devices
})
