import { ChangeEventHandler, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button/button"
import { useConnection } from "../connection-context"
import { Textarea } from "../ui/button/textarea"
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard"
import { Emulator } from "./Emulator"
import { type Retroarch as RetroarchCore } from "retroarch-core"

type Core = "fceumm_libretro" | "genesis_plus_gx_libretro" | "snes9x"

export const PlayerConnectScreen = () => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, connectionState } = useConnection()
  const [value, copy] = useCopyToClipboard()
  // const isCreateOfferInProgressRef = useRef(false)
  const [phase, setPhase] = useState<
    | "emulator:setup"
    | "emulator:started"
    | "create-offer"
    | "copy-offer"
    | "wait-answer"
    | "connected"
  >("emulator:setup")
  const [rom, setRom] = useState<Uint8Array>()
  const [core, setCore] = useState<Core>("genesis_plus_gx_libretro")

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

  console.log({ offer })

  const onEmulatorStart = async (core: RetroarchCore) => {
    const canvasEl = core.module.canvas
    const videoStream = canvasEl.captureStream(60)
    const stream = new MediaStream()
    videoStream.getTracks().forEach((track) => stream.addTrack(track))

    console.log(1)

    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })

    console.log(2)

    createOffer(stream)
  }

  return (
    <>
      <h2 className="my-4 text-center text-lg font-bold">Hello, Streamer!</h2>

      {phase === "emulator:setup" && <></>}

      <>
        <p>select rom</p>
        <input type="file" onChange={onRomUpload} />

        <p>select platform</p>
        <select onChange={onCoreChange} value={core}>
          <option value="genesis_plus_gx_libretro">sega</option>
          <option value="fceumm_libretro">nes</option>
        </select>

        {rom && (
          <Emulator
            romBinary={rom}
            coreUrl={`${process.env.PUBLIC_URL}/cores/${core}.js`}
            onStart={onEmulatorStart}
          />
        )}
      </>

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
    </>
  )
}

// phases:
// - create offer
// - copy offer
// - wait-for-answer
// - conected

/*
DATA CHANNEL ONLY

v=0
o=- 602524030614795352 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=candidate:4042898560 1 udp 2113937151 11ff9e04-2276-484b-a379-8b482096609c.local 33933 typ host generation 0 network-cost 999
a=ice-ufrag:jGCo
a=ice-pwd:NLCduJFlwd8BHt8qx2hJ7AO5
a=ice-options:trickle
a=fingerprint:sha-256 CE:AF:6F:5D:41:78:D8:81:DF:2B:40:6E:2E:18:F9:93:D4:B2:60:46:51:88:07:3A:D2:5F:FC:31:69:EE:F8:71
a=setup:actpass
a=mid:0
a=sctp-port:5000
a=max-message-size:262144


*/
