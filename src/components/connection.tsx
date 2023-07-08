import React from "react"
import { useRef, useState } from "react"

type ConnectionContextType = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
  connectionState: RTCPeerConnectionState
  init: () => void
  createOffer: (
    // stream: MediaStream,
    onOfferCreated: (offer: string) => void,
  ) => Promise<void>
  setOfferAndCreateAnswer: (
    offer: string,
    onStream: (stream: MediaStream) => void,
    onAnswerCreate: (answer: string) => void,
  ) => Promise<void>
  setAnswer: (answer: string) => void
}

export const ConnectionContext =
  React.createContext<ConnectionContextType | null>(null)

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

  const init = (onMessage?: (e: MessageEvent<any>) => void) => {
    const pc = new RTCPeerConnection(config)

    pc.addEventListener(
      "connectionstatechange",
      () => {
        /* more about connection state https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionstatechange_event */
        setConnectionState(pc.connectionState)
      },
      true,
    )

    /* player side */
    pc.onnegotiationneeded = async () => {
      console.log({
        connectionState,
        remoteDescription: pc.remoteDescription?.sdp,
      })

      /* 
        this prevent executing this code at first time
        because we don't have signalling service and have to manually send offer and answer via messenger or email
        this code will run after connection established and "dataChannel" is ready
        "dataChannel" will be signalling service after connection
       */
      if (!pc.remoteDescription?.sdp) return

      console.log("NEOGATION NEEDED")
      await pc.setLocalDescription(await pc.createOffer())
      dc.send(JSON.stringify({ description: pc.localDescription }))
    }

    const dc = pc.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    })
    // dc.onopen = () => chat.select()
    dc.onmessage = async (e) => {
      onMessage?.(e)
      console.log(`> ${e.data}`)

      try {
        const jsonMessage = JSON.parse(e.data)

        /* new remote description */
        if (jsonMessage.description) {
          console.log("DC: has a description")

          await pc.setRemoteDescription(jsonMessage.description)

          if (jsonMessage.description.type === "offer") {
            await pc.setLocalDescription(await pc.createAnswer())
            dc.send(JSON.stringify({ description: pc.localDescription }))
          }
        }
        console.log("DC:", jsonMessage)
      } catch (e) {
        console.log("DC: Not a JSON")
      }
    }

    peerConnectionRef.current = pc
    dataChannelRef.current = dc
  }

  /* player side */
  const createOffer = async (
    // stream: MediaStream,
    onOfferCreated: (offer: string) => void,
  ) => {
    // stream.getTracks().forEach((track) => {
    //   peerConnectionRef.current?.addTrack(track, stream)
    // })

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

/*

v=0
o=- 2675846892145110273 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=candidate:722962450 1 udp 2113937151 490b8afd-a9a1-4b13-829b-89fcc7bfea7d.local 38940 typ host generation 0 network-cost 999
a=ice-ufrag:ip+o
a=ice-pwd:TPP2Y/kcn1UinUzGAxTu/gda
a=ice-options:trickle
a=fingerprint:sha-256 CA:39:00:B4:6D:4C:C5:9D:1D:99:DF:82:5F:CD:FB:12:A9:B0:F5:74:C3:B1:0D:4D:C2:34:D0:6F:BC:0D:1A:D1
a=setup:actpass
a=mid:0
a=sctp-port:5000
a=max-message-size:262144


*/
