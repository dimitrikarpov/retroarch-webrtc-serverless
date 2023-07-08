import { useRef } from "react"
import { Core } from "../../App"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Emulator } from "./emulator"
import { CastIcon } from "lucide-react"
import { Retroarch } from "retroarch-core"
import { PlayerConnect } from "./player-connect"
import { useConnection } from "../connection"

type Props = {
  core: Core
  rom: Uint8Array
}

export const PlayerScreen: React.FunctionComponent<Props> = ({ rom, core }) => {
  const retroarchRef = useRef<Retroarch | null>(null)

  const { peerConnectionRef } = useConnection()

  const onAfasdfClick = () => {
    // dataChannelRef.current?.send("KKKKKKKKKKKKK")

    if (!retroarchRef.current || !peerConnectionRef.current) return

    const canvasEl = retroarchRef.current.module.canvas
    const videoStream = canvasEl.captureStream(60)
    // @ts-ignore
    const audioStream = retroarchRef.current.module.RA.xdest
      .stream as MediaStream
    const stream = new MediaStream()
    videoStream.getTracks().forEach((track) => stream.addTrack(track))
    audioStream.getTracks().forEach((track) => stream.addTrack(track))

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, stream)
    })
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <Emulator
        retroarchRef={retroarchRef}
        romBinary={rom}
        coreUrl={`${process.env.PUBLIC_URL}/cores/${core}.js`}
      />

      <Button onClick={onAfasdfClick}>afasdf</Button>

      <div className="h-10">
        <Dialog>
          <DialogTrigger>
            <Button variant={"outline"}>
              <CastIcon />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share you screen</DialogTitle>
              <DialogDescription>
                <PlayerConnect retroarchRef={retroarchRef} />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
