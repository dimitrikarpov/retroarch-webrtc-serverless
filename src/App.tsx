import React, { useRef, useState } from "react"
import { SelectRoleScreen } from "./components/select-role-screen/select-role-screen"
import { PlayerConnectScreen } from "./components/player-connect-screen/player-connect-screen"
import { ViewerConnectScreen } from "./components/viewer-connect-screen/viewer-connect-screen"

export type Role = "player" | "viewer"

function App() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  const [role, setRole] = useState<Role>()

  return (
    <div>
      {!role && <SelectRoleScreen setRole={setRole} />}
      {role === "player" && (
        <PlayerConnectScreen
          peerConnectionRef={peerConnectionRef}
          dataChannerRef={dataChannelRef}
        />
      )}
      {role === "viewer" && (
        <ViewerConnectScreen
          peerConnectionRef={peerConnectionRef}
          dataChannerRef={dataChannelRef}
        />
      )}
    </div>
  )
}

export default App

const config = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:19302",
    },
  ],
}
