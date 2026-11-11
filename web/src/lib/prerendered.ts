import { createElement, lazy, type ComponentType } from 'react'

// Pages that scripts/prerender.mjs also writes as static HTML for search engines.
// When the browser opens one, main.tsx loads its chunk before the first render, so
// React replaces the static HTML with the same page instead of a blank loading state.

const load = {
  site: () => import('@/pages/site'),
  public: () => import('@/pages/public'),
}
type Modules = { [C in keyof typeof load]: Awaited<ReturnType<(typeof load)[C]>> }

const ready: Partial<Modules> = {}

export function preloadPrerendered() {
  return Promise.all([load.site().then((m) => void (ready.site = m)), load.public().then((m) => void (ready.public = m))])
}

/** A route component: rendered directly once its chunk is loaded, lazily otherwise. */
export function prerenderable<C extends keyof Modules>(chunk: C, name: keyof Modules[C] & string) {
  const pick = (m: unknown) => (m as Record<string, ComponentType> | undefined)?.[name]
  const Lazy = lazy<ComponentType>(() => load[chunk]().then((m) => ({ default: pick(m)! })))
  return function Page() {
    const Loaded = pick(ready[chunk])
    return createElement(Loaded ?? Lazy)
  }
}
