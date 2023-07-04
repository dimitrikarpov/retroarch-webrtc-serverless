import React, { useRef, useState } from "react"
import { SelectRoleScreen } from "./components/select-role-screen/select-role-screen"
import { StreamerConnectScreen } from "./components/streamer-connect-screen/streamer-connect-screen"
import { WatcherConnectScreen } from "./components/watcher-connect-screen/watcher-connect-screen"

export type Role = "streamer" | "watcher"

function App() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  const [role, setRole] = useState<Role>()

  return (
    <div>
      {!role && <SelectRoleScreen setRole={setRole} />}
      {role === "streamer" && (
        <StreamerConnectScreen
          peerConnectionRef={peerConnectionRef}
          dataChannerRef={dataChannelRef}
        />
      )}
      {role === "watcher" && (
        <WatcherConnectScreen
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
