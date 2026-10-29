import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'

/** Shown when a route throws while rendering or loading. */
export default function RouteError() {
  const error = useRouteError()
  if (import.meta.env.DEV) console.error(error)
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : null

  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 font-display text-4xl font-bold">This page hit a problem</h1>
        <p className="mt-3 text-muted-foreground">
          Reloading usually fixes it. If it keeps happening, head back to the events list.
          {detail && <span className="mt-2 block text-sm">({detail})</span>}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="stage" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button asChild variant="outline">
            <Link to="/events">Browse events</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
