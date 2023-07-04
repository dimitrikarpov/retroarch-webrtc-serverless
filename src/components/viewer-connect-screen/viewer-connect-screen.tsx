import { ChangeEventHandler, useState } from "react"
import { Button } from "../ui/button/button"
import { useConnection } from "../connection-context"

type Props = {}

export const ViewerConnectScreen: React.FunctionComponent<Props> = ({}) => {
  const [offer, setOffer] = useState<string>()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef, dataChannelRef } = useConnection()

  const onOfferChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setOffer(e.target.value)
  }

  const onOfferConfirm = async () => {
    setIsConfirmed(true)

    /* create answer */

    console.log({ offer })

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
