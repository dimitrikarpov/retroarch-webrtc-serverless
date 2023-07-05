import { ChangeEventHandler, useEffect, useState } from "react"
import { Button } from "../ui/button/button"
import { useConnection } from "../connection-context"
import { Textarea } from "../ui/button/textarea"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"

export const ViewerConnectScreen = () => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, dataChannelRef, connectionState } = useConnection()
  const [value, copy] = useCopyToClipboard()
  const [phase, setPhase] = useState<
    "wait-offer" | "copy-answer" | "connected" | "wait-connection"
  >("wait-offer")

  const onOfferChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setOffer(e.target.value)
  }

  const onOfferSet = async () => {
    setPhase("copy-answer")

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
  }

  const onSendMessageClick = () => {
    dataChannelRef.current?.send("YYHUHUHUHUHUHUHUHU")
  }

  useEffect(() => {
    if (connectionState === "connected") {
      setPhase("connected")
    }
  }, [connectionState])

  const onAnswerCopyClick = () => {
    if (!answer) return

    copy(answer)
    setPhase("wait-connection")
  }

  return (
    <div>
      <h2>Hello, Viewer!</h2>

      {phase === "wait-offer" && (
        <>
          <p>Paste here Streamer's Connection Offer</p>

          <form>
            <Textarea value={offer} onChange={onOfferChange} />
            <Button onClick={onOfferSet}>set offer</Button>
          </form>
        </>
      )}

      {phase === "copy-answer" && (
        <>
          <p>Send these Answer to the Streamer</p>

          <Textarea disabled value={answer} className="h-40 w-full" />
          <Button onClick={onAnswerCopyClick}>copy Answer to clipboard</Button>
          {value && <p className="text-orange-700">copied</p>}
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

// phases:
// - wait-offer
// - copy answer
// - connected

//
