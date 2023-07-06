import { Core } from "../../App"
import { Button } from "../ui/button/button"
import { Emulator } from "./Emulator"
import { CastIcon } from "lucide-react"

type Props = {
  core: Core
  rom: Uint8Array
}

export const PlayerScreen: React.FunctionComponent<Props> = ({ rom, core }) => {
  return (
    <div className="flex h-[100dvh] flex-col">
      <Emulator
        romBinary={rom}
        coreUrl={`${process.env.PUBLIC_URL}/cores/${core}.js`}
      />

      <div className="h-10">
        <Button variant={"outline"}>
          <CastIcon />
        </Button>
      </div>
    </div>
  )
}
