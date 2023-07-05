import { ChangeEventHandler, useEffect, useState } from "react"
import { Button } from "../ui/button/button"
import { Card } from "../ui/button/card"
import { useConnection } from "../connection-context"
import { Textarea } from "../ui/button/textarea"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"

export const PlayerConnectScreen = () => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, connectionState } = useConnection()
  const [value, copy] = useCopyToClipboard()

  const [phase, setPhase] = useState<
    "create-offer" | "copy-offer" | "wait-answer" | "connected"
  >("create-offer")

  const onCreateClick = async () => {
    /* Create Offer */
    await peerConnectionRef.current?.setLocalDescription(
      await peerConnectionRef.current?.createOffer(),
    )

    peerConnectionRef.current!.onicecandidate = ({ candidate }) => {
      if (candidate) return

      setOffer(peerConnectionRef.current?.localDescription?.sdp)
      setPhase("copy-offer")
    }
  }

  const onAnswerChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setAnswer(e.target.value)
  }

  const onAnswerConfirm = () => {
    /* set answer */
    peerConnectionRef.current?.setRemoteDescription({
      type: "answer",
      sdp: answer,
    })
  }

  const onOfferCopyClick = () => {
    if (!offer) return
    copy(offer)
    setPhase("wait-answer")
  }

  useEffect(() => {
    if (connectionState === "connected") {
      setPhase("connected")
    }
  }, [connectionState])

  return (
    <div className="flex items-center justify-center [&>div]:w-full">
      <Card>
        <h2>Hello, Streamer!</h2>

        {phase === "create-offer" && (
          <div>
            <p>
              To share gameplay You need to invite Viewer sending him a
              Connection Offer
            </p>
            <Button onClick={onCreateClick}>create Connection Offer</Button>
          </div>
        )}

        {phase === "copy-offer" && (
          <div>
            <p>Send this offer using messenger or email</p>
            <Textarea disabled className="h-40 w-full" value={offer} />
            <Button onClick={onOfferCopyClick}>Copy Offer to Clipboard</Button>
            {value && <p className="text-orange-700">copied</p>}
          </div>
        )}

        {phase === "wait-answer" && (
          <div>
            <p>And paste Answer here</p>
            <Textarea
              value={answer}
              onChange={onAnswerChange}
              className="h-40 w-full"
            />
            <Button onClick={onAnswerConfirm}>confirm answer</Button>
          </div>
        )}

        {phase === "connected" && (
          <p className="text-lg text-green-500">Connected !!!</p>
        )}
      </Card>
    </div>
  )
}

// phases:
// - create offer
// - copy offer
// - wait-for-answer
// - conected
