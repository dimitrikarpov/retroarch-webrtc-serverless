import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { useConnection } from "../connection-context"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

export const ViewerScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, dataChannelRef, connectionState, init } =
    useConnection()
  const [value, copy] = useCopyToClipboard()
  const [phase, setPhase] = useState<
    "wait-offer" | "copy-answer" | "connected" | "wait-connection"
  >("wait-offer")

  const onOfferChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setOffer(e.target.value)
  }

  const onOfferSet = async () => {
    /* init peer connection */

    console.log(1)

    init()

    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })

    console.log(2)

    peerConnectionRef.current!.ontrack = async (event) => {
      console.log("track event", event)

      const [remoteStream] = event.streams
      videoRef.current!.srcObject = remoteStream

      videoRef.current?.play()
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

      setAnswer(peerConnectionRef.current?.localDescription?.sdp)
    }

    setPhase("copy-answer")
  }

  const onAnswerCopyClick = () => {
    if (!answer) return

    copy(answer)
    setPhase("wait-connection")
  }

  useEffect(() => {
    if (connectionState === "connected") {
      setPhase("connected")
    }
  }, [connectionState])

  const onSendMessageClick = () => {
    dataChannelRef.current?.send("YYHUHUHUHUHUHUHUHU")
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <div>
        <video ref={videoRef} width="800" height="600"></video>
      </div>

      {phase === "wait-offer" && (
        <>
          <p>Paste here Streamer's Connection Offer</p>

          <Textarea value={offer} onChange={onOfferChange} />
          <Button onClick={onOfferSet}>set offer</Button>
        </>
      )}

      {phase === "copy-answer" && (
        <>
          <p>Send these Answer to the Streamer</p>

          <Textarea disabled value={answer} className="h-40 w-full" />
          <Button onClick={onAnswerCopyClick}>copy Answer to clipboard</Button>
        </>
      )}

      {phase === "wait-connection" && <p>Waiting for connection...</p>}

      {phase === "connected" && (
        <>
          <p className="text-lg text-green-500">Connected !!!</p>

          <Button variant={"secondary"} onClick={onSendMessageClick}>
            send a test message
          </Button>
        </>
      )}
    </div>
  )
}
