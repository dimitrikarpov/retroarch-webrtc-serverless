import { ChangeEventHandler, useState } from "react"
import { Button } from "../ui/button/button"
import { logStatus } from "../../lib/logStatus"

type Props = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannerRef: React.MutableRefObject<RTCDataChannel | null>
}

export const WatcherConnectScreen: React.FunctionComponent<Props> = ({
  peerConnectionRef,
  dataChannerRef,
}) => {
  const [offer, setOffer] = useState<string>()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [answer, setAnswer] = useState<string>()

  const onOfferChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setOffer(e.target.value)
  }

  const onOfferConfirm = async () => {
    const pc = new RTCPeerConnection(config)

    pc.oniceconnectionstatechange = (e) => console.log(pc.iceConnectionState)
    pc.onconnectionstatechange = (ev) => logStatus(pc)
    pc.oniceconnectionstatechange = (ev) => logStatus(pc)

    const dc = pc.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    })
    // dc.onopen = () => chat.select()
    dc.onmessage = (e) => console.log(`> ${e.data}`)

    peerConnectionRef.current = pc
    dataChannerRef.current = dc

    setIsConfirmed(true)

    /* create answer */

    console.log({ offer })

    await pc.setRemoteDescription({
      type: "offer",
      sdp: offer,
    })

    await pc.setLocalDescription(await pc.createAnswer())
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) return

      setAnswer(pc.localDescription?.sdp)
    }
  }

  const onSendMessageClick = () => {
    dataChannerRef.current?.send("YYHUHUHUHUHUHUHUHU")
  }

  return (
    <div>
      <h2>Hello, Viewer!</h2>

      {!isConfirmed && (
        <>
          <p>Paste here Streamer's Connection Offer</p>

          <form>
            <textarea value={offer} onChange={onOfferChange} />
            <Button onClick={onOfferConfirm}>set offer</Button>
          </form>
        </>
      )}

      {answer && (
        <>
          <p>Send these Answer to the Streamer</p>

          <textarea disabled value={answer} className="h-40 w-full" />

          <Button variant={"secondary"} onClick={onSendMessageClick}>
            send a test message
          </Button>
        </>
      )}
    </div>
  )
}

const config = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:19302",
    },
  ],
}
