import * as React from "react"
import { Link, Outlet, useLocation } from "@remix-run/react"
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary"
import { fetchRepoFile } from "~/utils/documents.server"
import { repo, getBranch, latestVersion } from "~/routes/query"

export const loader = async (context: LoaderArgs) => {
  const branch = getBranch(context.params.version)
  const config = await fetchRepoFile(repo, branch, `docs/config.json`)

  if (!config) {
    throw new Error("Repo docs/config.json not found!")
  }

  return json(JSON.parse(config))
}

export const ErrorBoundary = DefaultErrorBoundary
export const CatchBoundary = DefaultCatchBoundary

export default function RouteReactQuery() {
  const [showModal, setShowModal] = React.useState(true)
  const location = useLocation()

  const version = location.pathname.match(/\/query\/v(\d)/)?.[1] || "999"
  const showRedirectModal = Number(version) < Number(latestVersion[1])
  const redirectTarget = location.pathname.replace(`v${version}`, "latest")

  return (
    <>
      {showRedirectModal && showModal ? (
        <div className="p-4 bg-blue-500 text-white flex items-center justify-center gap-4">
          <div>
            You are currently reading <strong>v{version}</strong> docs. Redirect
            to{" "}
            <a href={redirectTarget} className="font-bold underline">
              latest
            </a>{" "}
            version?
          </div>
          <Link
            to={redirectTarget}
            replace
            className="bg-white text-black py-1 px-2 rounded-md uppercase font-black text-xs"
          >
            Latest
          </Link>
          <button
            onClick={() => setShowModal(false)}
            className="bg-white text-black py-1 px-2 rounded-md uppercase font-black text-xs"
          >
            Hide
          </button>
        </div>
      ) : null}
      <Outlet />
    </>
  )
}
