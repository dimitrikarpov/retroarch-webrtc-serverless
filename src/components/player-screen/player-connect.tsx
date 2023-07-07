import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { useConnection } from "../connection-context"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"
import { type Retroarch as RetroarchCore } from "retroarch-core"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

type Props = {
  retroarchRef: React.MutableRefObject<RetroarchCore | null>
}

export const PlayerConnect: React.FunctionComponent<Props> = ({
  retroarchRef,
}) => {
  const { peerConnectionRef, connectionState, init } = useConnection()
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const [value, copy] = useCopyToClipboard()
  const [phase, setPhase] = useState<
    "create-offer" | "copy-offer" | "wait-answer" | "connected"
  >("create-offer")

  const isIniting = useRef(false)

  const createOffer = async (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, stream)
    })

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

  useEffect(() => {
    const initConnection = async () => {
      if (
        !!isIniting.current ||
        !!peerConnectionRef.current ||
        !retroarchRef.current
      )
        return

      isIniting.current = true

      const canvasEl = retroarchRef.current.module.canvas
      const videoStream = canvasEl.captureStream(60)
      const stream = new MediaStream()
      videoStream.getTracks().forEach((track) => stream.addTrack(track))

      console.log(1)

      init()

      await new Promise((resolve) => {
        setTimeout(resolve, 1000)
      })

      console.log(2)

      createOffer(stream)

      isIniting.current = false
    }

    initConnection()
  }, [])

  const onOfferCopyClick = () => {
    if (!offer) return
    copy(offer)
    setPhase("wait-answer")
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

  useEffect(() => {
    if (connectionState === "connected") {
      setPhase("connected")
    }
  }, [connectionState])

  return (
    <div>
      <p>
        The idea of connection is You send your connection info via messenger or
        email, Viewer send back his connection info as answer
      </p>
      <p>Simple, Secure, No Servers - No sensitive data to leak</p>

      {phase === "create-offer" && (
        <div>
          <p>Getting network info...</p>
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
        <>
          <p className="text-lg text-green-500">Connected !!!</p>
        </>
      )}
    </div>
  )
}
