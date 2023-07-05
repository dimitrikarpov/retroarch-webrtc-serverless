import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button/button"
import { useConnection } from "../connection-context"
import { Textarea } from "../ui/button/textarea"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"

type Core = "fceumm_libretro" | "genesis_plus_gx_libretro" | "snes9x"

export const PlayerConnectScreen = () => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, connectionState } = useConnection()
  const [value, copy] = useCopyToClipboard()
  const isCreateOfferInProgressRef = useRef(false)
  const [phase, setPhase] = useState<
    "create-offer" | "copy-offer" | "wait-answer" | "connected"
  >("create-offer")
  const [rom, setRom] = useState<Uint8Array>()
  const [core, setCore] = useState<Core>("genesis_plus_gx_libretro")

  useEffect(() => {
    const makeOffer = async () => {
      if (isCreateOfferInProgressRef.current || !!offer) return

      isCreateOfferInProgressRef.current = true
      await createOffer()
      isCreateOfferInProgressRef.current = false
    }

    makeOffer()
  }, [])

  const createOffer = async () => {
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

  const onRomUpload: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files?.[0]
    const buffer = await file?.arrayBuffer()

    setRom(new Uint8Array(buffer))
  }

  const onCoreChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setCore(e.target.value as Core)
  }

  return (
    <>
      <h2 className="my-4 text-center text-lg font-bold">Hello, Streamer!</h2>

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

          <p>select rom</p>
          <input type="file" onChange={onRomUpload} />

          <p>select platform</p>
          <select onChange={onCoreChange} value={core}>
            <option value="genesis_plus_gx_libretro">sega</option>
            <option value="fceumm_libretro">nes</option>
          </select>
        </>
      )}
    </>
  )
}

// phases:
// - create offer
// - copy offer
// - wait-for-answer
// - conected
