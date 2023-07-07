import { useState } from "react"
import { Connection } from "./components/connection"
import { StartScreen } from "./components/start-screen/start-screen"
import { PlayerScreen } from "./components/player-screen/player-screen"
import { ViewerScreen } from "./components/viewer-screen/viewer-screen"

export type Role = "player" | "viewer" | "offline"

export type Core = "fceumm_libretro" | "genesis_plus_gx_libretro" | "snes9x"

function App() {
  const [rom, setRom] = useState<Uint8Array>()
  const [core, setCore] = useState<Core>()
  const [role, setRole] = useState<Role>()

  return (
    <Connection>
      {!role && (
        <StartScreen
          rom={rom}
          core={core}
          setRom={setRom}
          setCore={setCore}
          setRole={setRole}
        />
      )}
      {role === "player" && <PlayerScreen core={core!} rom={rom!} />}
      {role === "viewer" && <ViewerScreen />}
    </Connection>
  )
}

export default App
