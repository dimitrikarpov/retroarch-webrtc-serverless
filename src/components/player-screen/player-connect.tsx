import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { useConnection } from "../connection"
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
  const { peerConnectionRef, connectionState, init, createOffer, setAnswer } =
    useConnection()
  const [offer, setOffer] = useState<string>()
  const [answer, setViewerAnswer] = useState<string>()
  const [value, copy] = useCopyToClipboard()
  const [phase, setPhase] = useState<
    "create-offer" | "copy-offer" | "wait-answer" | "connected"
  >("create-offer")

  const isIniting = useRef(false)

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
      // @ts-ignore
      const audioStream = retroarchRef.current.module.RA.xdest
        .stream as MediaStream
      const stream = new MediaStream()
      videoStream.getTracks().forEach((track) => stream.addTrack(track))
      audioStream.getTracks().forEach((track) => stream.addTrack(track))

      console.log(1)

      init()

      await new Promise((resolve) => {
        setTimeout(resolve, 1000)
      })

      console.log(2)

      createOffer(stream, (offer) => {
        setOffer(offer)
        setPhase("copy-offer")
      })

      isIniting.current = false
    }

    initConnection()
    // eslint-disable-next-line
  }, [])

  const onOfferCopyClick = () => {
    if (!offer) return
    copy(btoa(offer))
    setPhase("wait-answer")
  }

  const onAnswerChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setViewerAnswer(e.target.value)
  }

  const onAnswerConfirm = () => {
    setAnswer(atob(answer!))
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
          <p>Send offer using messenger or email</p>
          <Button onClick={onOfferCopyClick}>Copy Offer to Clipboard</Button>
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
          <Button onClick={onAnswerConfirm}>OK</Button>
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
