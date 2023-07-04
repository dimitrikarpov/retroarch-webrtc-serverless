import React from "react"

type ConnectionContext = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
}

export const ConnectionContext = React.createContext<ConnectionContext | null>(
  null,
)

export function useConnection() {
  const context = React.useContext(ConnectionContext)

  if (!context) {
    throw new Error(
      `'This component must be used within a <Connection> component.'`,
    )
  }

  return context
}
