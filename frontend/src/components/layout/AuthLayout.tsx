import { Outlet, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { TicketStack } from '@/components/events/TicketStack'

const COPY = {
  login: {
    title: 'Your tickets are right where you left them.',
    body: 'Log in to see the events you’re going to, or check how your own events are filling up.',
  },
  signup: {
    title: 'Save your seat, or sell out your own room.',
    body: 'Join as an attendee to reserve seats at events near you, or as an organizer to publish events and manage your guest list.',
  },
}

export function AuthLayout() {
  const { pathname } = useLocation()
  const copy = pathname.startsWith('/signup') ? COPY.signup : COPY.login

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Showcase panel: brand, live ticket stack and a line about the product. */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(40rem 30rem at 15% 20%, rgb(255 181 71 / 0.16), transparent 60%), radial-gradient(36rem 30rem at 85% 75%, rgb(124 92 255 / 0.24), transparent 60%), radial-gradient(30rem 24rem at 60% 35%, rgb(240 69 155 / 0.18), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgb(238 234 248) 1px, transparent 1px), linear-gradient(90deg, rgb(238 234 248) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
          }}
        />

        <div className="relative z-10 p-10">
          <Logo />
        </div>
        <div className="relative z-10 flex flex-1 items-center px-10 xl:px-16">
          <TicketStack />
        </div>
        <div className="relative z-10 max-w-lg p-10 xl:px-16 xl:pb-14">
          <h2 className="font-display text-4xl font-bold xl:text-5xl">{copy.title}</h2>
          <p className="mt-4 text-muted-foreground">{copy.body}</p>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
