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
          onClick={() => setRole("streamer")}
          className="flex flex-grow cursor-pointer items-center justify-center rounded-md border border-gray-400 transition hover:bg-slate-200 hover:shadow-md"
        >
          streamer
        </div>

        <div
          onClick={() => setRole("watcher")}
          className="flex flex-grow cursor-pointer items-center justify-center rounded-md border border-gray-400 transition hover:bg-slate-200 hover:shadow-md"
        >
          watcher
        </div>
      </div>
    </div>
  )
}
