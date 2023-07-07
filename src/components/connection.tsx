import React from "react"
import { useRef, useState } from "react"

type ConnectionContext = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
  connectionState: RTCPeerConnectionState
  init: () => void
  createOffer: (
    stream: MediaStream,
    onOfferCreated: (offer: string) => void,
  ) => Promise<void>
  setOfferAndCreateAnswer: (
    offer: string,
    onStream: (stream: MediaStream) => void,
    onAnswerCreate: (answer: string) => void,
  ) => Promise<void>
  setAnswer: (answer: string) => void
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

type Props = {
  children?: React.ReactNode
}

export const Connection: React.FunctionComponent<Props> = ({ children }) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new")

  const init = () => {
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
  }

  /* player side */
  const createOffer = async (
    stream: MediaStream,
    onOfferCreated: (offer: string) => void,
  ) => {
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, stream)
    })

    /* Create Offer */
    await peerConnectionRef.current?.setLocalDescription(
      await peerConnectionRef.current?.createOffer(),
    )

    peerConnectionRef.current!.onicecandidate = ({ candidate }) => {
      if (candidate) return

      onOfferCreated(peerConnectionRef.current!.localDescription!.sdp)
    }
  }

  /* viewer side */
  const setOfferAndCreateAnswer = async (
    offer: string,
    onStream: (stream: MediaStream) => void,
    onAnswerCreate: (answer: string) => void,
  ) => {
    peerConnectionRef.current!.ontrack = async (event) => {
      const [remoteStream] = event.streams

      onStream(remoteStream)
    }

    /* create answer */
    await peerConnectionRef.current?.setRemoteDescription({
      type: "offer",
      sdp: offer,
    })

    await peerConnectionRef.current?.setLocalDescription(
      await peerConnectionRef.current?.createAnswer(),
    )

    peerConnectionRef.current!.onicecandidate = ({ candidate }) => {
      if (candidate) return

      onAnswerCreate(peerConnectionRef.current!.localDescription!.sdp)
    }
  }

  /* player side */
  const setAnswer = (answer: string) => {
    peerConnectionRef.current?.setRemoteDescription({
      type: "answer",
      sdp: answer,
    })
  }

  return (
    <ConnectionContext.Provider
      value={{
        peerConnectionRef,
        dataChannelRef,
        connectionState,
        init,
        createOffer,
        setOfferAndCreateAnswer,
        setAnswer,
      }}
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
