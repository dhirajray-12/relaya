import { ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { LogoMark } from '@/components/logo'
import { cn } from '@/lib/utils'
import { Arrow, PrimaryCta, SecondaryCta, TRIAL_DAYS } from '@/pages/landing/landing'

// Building blocks for the marketing pages (integrations, comparisons, blog).
// No scroll animations here: these pages are prerendered for search engines and
// must read fine before JavaScript runs.

/** A titled section of an article-style page. */
export function Block({ id, title, children, className }: { id?: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-24 border-t border-l-border pt-10 first:border-t-0 first:pt-0', className)}>
      <h2 className="mb-4 text-balance text-2xl font-semibold tracking-tight text-l-text">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed">{children}</div>
    </section>
  )
}

export const Strong = ({ children }: { children: ReactNode }) => <b className="font-semibold text-l-text">{children}</b>

export function A({ to, children }: { to: string; children: ReactNode }) {
  const cls = 'text-l-accent underline-offset-4 hover:underline'
  return to.startsWith('/') ? (
    <Link to={to} className={cls}>{children}</Link>
  ) : (
    <a href={to} className={cls} rel="noopener noreferrer" target="_blank">{children}</a>
  )
}

/** A checklist with green ticks. */
export function Checks({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#14b886]/15">
            <CheckIcon className="size-3 text-l-accent" />
          </span>
          <span className="min-w-0">{it}</span>
        </li>
      ))}
    </ul>
  )
}

/** Numbered steps. */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-4">
      {items.map((it, i) => (
        <li key={i} className="flex gap-4">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#14b886]/40 font-mono text-xs font-medium text-l-accent">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0 pt-0.5">{it}</div>
        </li>
      ))}
    </ol>
  )
}

/** Cards in a responsive grid. */
export function Cards({ items, cols = 3 }: { items: { title: string; body: ReactNode; icon?: ReactNode }[]; cols?: 2 | 3 }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', cols === 3 && 'lg:grid-cols-3')}>
      {items.map((c) => (
        <div key={c.title} className="min-w-0 rounded-2xl border border-l-border bg-l-surface p-5">
          {c.icon && <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-[#14b886]/10 text-l-accent">{c.icon}</div>}
          <h3 className="font-semibold text-l-text">{c.title}</h3>
          <div className="mt-1.5 text-sm leading-relaxed">{c.body}</div>
        </div>
      ))}
    </div>
  )
}

/** Yes / no / text cell for comparison tables. */
export function Mark({ v }: { v: boolean | string }) {
  if (v === true) return <CheckIcon className="size-4 text-l-accent" aria-label="Yes" />
  if (v === false) return <XIcon className="size-4 text-l-subtle" aria-label="No" />
  return <span>{v}</span>
}

/** Questions and answers; the same pairs go into FAQPage structured data (see meta.ts). */
export function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-l-border rounded-2xl border border-l-border">
      {items.map(([q, a]) => (
        <details key={q} className="group p-5 [&_summary::-webkit-details-marker]:hidden" open>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-l-text">
            {q}
            <span className="mt-1 text-l-subtle transition group-open:rotate-90">
              <ArrowRightIcon className="size-4" />
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  )
}

/** Links to related pages, as cards. */
export function Related({ items }: { items: [string, string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([to, title, body]) => (
        <Link key={to} to={to} className="group min-w-0 rounded-2xl border border-l-border bg-l-surface p-5 transition hover:-translate-y-0.5 hover:border-[#14b886]/50">
          <div className="flex items-center justify-between gap-3 font-semibold text-l-text">
            <span className="min-w-0">{title}</span>
            <ArrowRightIcon className="size-4 shrink-0 text-l-accent transition group-hover:translate-x-1" />
          </div>
          <p className="mt-1.5 text-sm">{body}</p>
        </Link>
      ))}
    </div>
  )
}

/** The closing call to action. */
export function CtaBand({ title = 'Stop finding out from your customers.', body }: { title?: string; body?: ReactNode }) {
  return (
    <div className="relative mt-16 overflow-hidden rounded-3xl border border-l-border bg-l-surface px-6 py-12 text-center md:py-14">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 max-w-xl rounded-full bg-[#14b886]/20 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <LogoMark className="mx-auto mb-5 size-10" />
        <h2 className="text-balance text-2xl font-semibold tracking-tight text-l-text md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty">
          {body ?? <>Point your first webhook at Relaya today. Try the Team plan free for {TRIAL_DAYS} days.</>}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta>
            Start free trial <Arrow />
          </PrimaryCta>
          <SecondaryCta to="/contact">Talk to us</SecondaryCta>
        </div>
      </div>
    </div>
  )
}

/** "Coming soon" / status pill. */
export function Pill({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone === 'accent' ? 'bg-[#14b886]/15 text-l-accent' : 'border border-l-border text-l-subtle',
      )}
    >
      {children}
    </span>
  )
}
