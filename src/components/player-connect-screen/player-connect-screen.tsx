import { ChangeEventHandler, FunctionComponent, useState } from "react"
import { Button } from "../ui/button/button"
import { Card } from "../ui/button/card"
import { useConnection } from "../connection-context"

type Props = {}

export const PlayerConnectScreen: FunctionComponent<Props> = ({}) => {
  const [offer, setOffer] = useState<string>()
  const [answer, setAnswer] = useState<string>()
  const { peerConnectionRef } = useConnection()

  const onCreateClick = async () => {
    /* Create Offer */
    await peerConnectionRef.current?.setLocalDescription(
      await peerConnectionRef.current?.createOffer(),
    )

    peerConnectionRef.current!.onicecandidate = ({ candidate }) => {
      if (candidate) return

      setOffer(peerConnectionRef.current?.localDescription?.sdp)
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
