import { ChangeEventHandler, useState } from "react"
import { Emulator } from "./Emulator"

type Core = "fceumm_libretro" | "genesis_plus_gx_libretro" | "snes9x"

export const OfflinePlayScreen = () => {
  const [rom, setRom] = useState<Uint8Array>()
  const [core, setCore] = useState<Core>("genesis_plus_gx_libretro")

  const onRomUpload: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files?.[0]
    const buffer = await file?.arrayBuffer()

    setRom(new Uint8Array(buffer))
  }

  const onCoreChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setCore(e.target.value as Core)
  }

  return (
    <>
      <p>select rom</p>
      <input type="file" onChange={onRomUpload} />

      <p>select platform</p>
      <select onChange={onCoreChange} value={core}>
        <option value="genesis_plus_gx_libretro">sega</option>
        <option value="fceumm_libretro">nes</option>
      </select>

      {rom && (
        <Emulator
          romBinary={rom}
          coreUrl={`${process.env.PUBLIC_URL}/cores/${core}.js`}
        />
      )}
    </>
  )
}
