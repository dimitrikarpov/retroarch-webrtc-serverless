import { Role } from "../../App"

type Props = {
  setRole: React.Dispatch<React.SetStateAction<Role | undefined>>
}

export const SelectRoleScreen: React.FunctionComponent<Props> = ({
  setRole,
}) => {
  return (
    <div className="mx-auto my-0 mt-6 w-[600px] text-center">
      <h2>Choose Your Role</h2>

      <div className="mt-6 flex h-[200px] gap-4">
        <div
          onClick={() => setRole("player")}
          className="flex flex-grow cursor-pointer items-center justify-center rounded-md border border-gray-400 transition hover:bg-slate-200 hover:shadow-md"
        >
          play the game and stream gameplay
        </div>

        <div
          onClick={() => setRole("viewer")}
          className="flex flex-grow cursor-pointer items-center justify-center rounded-md border border-gray-400 transition hover:bg-slate-200 hover:shadow-md"
        >
          connect to player to watch gameplay
        </div>

        <div
          onClick={() => setRole("offline")}
          className="flex flex-grow cursor-pointer items-center justify-center rounded-md border border-gray-400 transition hover:bg-slate-200 hover:shadow-md"
        >
          just play offline
        </div>
      </div>
    </div>
  )
}
