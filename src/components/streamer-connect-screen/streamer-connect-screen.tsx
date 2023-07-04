import { ChangeEventHandler, FunctionComponent, useState } from "react"
import { Button } from "../ui/button/button"
import { Card } from "../ui/button/card"
import { logStatus } from "../../lib/logStatus"

type Props = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannerRef: React.MutableRefObject<RTCDataChannel | null>
}

export const StreamerConnectScreen: FunctionComponent<Props> = ({
  peerConnectionRef,
  dataChannerRef,
}) => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false)

  const onCreateClick = async () => {
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

    /* Create Offer */
    // setIsOfferCreatingInProgress(true)
    const a = await pc.createOffer()
    await pc.setLocalDescription(a)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) return
      //   offerArea.value = pc.localDescription.sdp
      //   offerArea.select()
      //   answer.placeholder = "Paste answer here. And Press Enter"

      console.log({ offer: pc.localDescription?.sdp })

      setOffer(pc.localDescription?.sdp)
    }

    // setIsOfferCreatingInProgress(false)
  }

  const onAnswerChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setAnswer(e.target.value)
  }

  const onAnswerConfirm = () => {
    peerConnectionRef.current?.setRemoteDescription({
      type: "answer",
      sdp: answer,
    })
  }

  return (
    <div className="flex items-center justify-center [&>div]:w-full">
      <Card>
        <h2>Hello, Streamer!</h2>

        {!offer && (
          <div>
            <p>
              To share gameplay You need to invite Viewer sending him a
              Connection Offer
            </p>
            <Button onClick={onCreateClick}>create Connection Offer</Button>
          </div>
        )}

        {offer && (
          <div>
            <p>Send this offer using messenger or email</p>
            <textarea disabled className="h-40 w-full" value={offer} />

            <p>And paste Answer here</p>
            <textarea
              value={answer}
              onChange={onAnswerChange}
              className="h-40 w-full"
            />
            <Button onClick={onAnswerConfirm}>confirm answer</Button>
          </div>
        )}
      </Card>
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
