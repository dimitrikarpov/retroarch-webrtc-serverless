import { useEffect, useRef, useState } from "react"
import { ConnectionContext } from "./connection-context"

type Props = {
  children?: React.ReactNode
}

export const Connection: React.FunctionComponent<Props> = ({ children }) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new")

  useEffect(() => {
    const pc = new RTCPeerConnection(config)

    pc.addEventListener(
      "connectionstatechange",
      () => {
        /* more about connection state https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionstatechange_event */
        setConnectionState(pc.connectionState)
      },
      true,
    )

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
    <ConnectionContext.Provider
      value={{ peerConnectionRef, dataChannelRef, connectionState }}
    >
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
