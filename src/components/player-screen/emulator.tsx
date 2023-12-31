import { Retroarch } from "retroarch-react"
import { cn } from "../../lib/cn"
import { type Retroarch as RetroarchCore } from "retroarch-core"

type Props = {
  coreUrl: string
  romBinary: Uint8Array
  retroarchRef: React.MutableRefObject<RetroarchCore | null>
}

export const Emulator: React.FunctionComponent<Props> = ({
  coreUrl,
  romBinary,
  retroarchRef,
}) => {
  const onEmulatorStart = (retroarch: RetroarchCore) => {
    retroarchRef.current = retroarch
  }

  return (
    <Retroarch
      containerClassName={cn(
        "relative flex aspect-[calc(800/600)] justify-center",
        "h-[600px]",
      )}
      canvasBoxClassName="relative aspect-[calc(800/600)] max-h-full max-w-full"
      onStart={onEmulatorStart}
    >
      <Retroarch.StartScreen className="absolute inset-0 flex h-full items-center justify-center">
        <Retroarch.StartScreen.Button className="ease focus:shadow-outline m-2 select-none rounded-md border border-indigo-500 bg-indigo-500 px-4 py-2 text-white transition duration-500 hover:bg-indigo-600 focus:outline-none" />
      </Retroarch.StartScreen>

      <Retroarch.LoaderScreen
        className="absolute inset-0 flex h-full items-center justify-center"
        coreUrl={coreUrl}
        romBinary={romBinary}
        loadOnMount
      >
        <Retroarch.LoaderScreen.Progress />
      </Retroarch.LoaderScreen>
    </Retroarch>
  )
}
