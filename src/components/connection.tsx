import { useEffect, useRef } from "react"
import { ConnectionContext } from "./connection-context"
import { logStatus } from "../lib/logStatus"

type Props = {
  children?: React.ReactNode
}

export const Connection: React.FunctionComponent<Props> = ({ children }) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  useEffect(() => {
    const pc = new RTCPeerConnection(config)

    pc.oniceconnectionstatechange = (e) => console.log(pc.iceConnectionState)
    pc.onconnectionstatechange = (ev) => logStatus(pc)
    pc.oniceconnectionstatechange = (ev) => logStatus(pc)

    const dc = pc.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    })
    // dc.onopen = () => chat.select()
    dc.onmessage = (e) => console.log(`> ${e.data}`)

    peerConnectionRef.current = pc
    dataChannelRef.current = dc
  }, [])

  return (
    <ConnectionContext.Provider value={{ peerConnectionRef, dataChannelRef }}>
      {children}
    </ConnectionContext.Provider>
  )
}

const config = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:19302",
    },
  ],
}
