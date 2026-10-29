import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-[7rem] font-extrabold text-stage sm:text-[10rem]">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          The page you’re looking for doesn’t exist. It may have moved, or the link is wrong.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="stage">
            <Link to="/events">Browse events</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
