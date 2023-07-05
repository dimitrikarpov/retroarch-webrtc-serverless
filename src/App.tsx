import { useState } from "react"
import { SelectRoleScreen } from "./components/select-role-screen/select-role-screen"
import { PlayerConnectScreen } from "./components/player-connect-screen/player-connect-screen"
import { ViewerConnectScreen } from "./components/viewer-connect-screen/viewer-connect-screen"
import { Connection } from "./components/connection"

export type Role = "player" | "viewer"

function App() {
  const [role, setRole] = useState<Role>()

  return (
    <div className="ml-auto mr-auto mt-24 w-fit">
      {!role && <SelectRoleScreen setRole={setRole} />}
      <Connection>
        {role === "player" && <PlayerConnectScreen />}
        {role === "viewer" && <ViewerConnectScreen />}
      </Connection>
    </div>
  )
}

export default App
