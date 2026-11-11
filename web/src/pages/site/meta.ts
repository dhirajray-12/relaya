import { useEffect } from 'react'

// Search metadata for every public marketing page, in one place: the pages set
// it at runtime, and scripts/prerender.mjs writes it into each page's static HTML
// (with the rendered content) and builds sitemap.xml from it.

export const SITE = 'https://relaya.sbs'

export interface PageMeta {
  title: string // without the " · Relaya" suffix
  description: string
  /** Article pages get Article structured data. */
  article?: { published: string; modified: string }
  /** Question/answer pairs, rendered on the page and as FAQPage structured data. */
  faq?: [string, string][]
  /** Prerender into static HTML (every page here except ones that need live data). */
  prerender?: boolean
}

export const PAGES: Record<string, PageMeta> = {
  '/pricing': {
    title: 'Pricing',
    description: 'Relaya plans for teams running integrations in production: Team, Business and Enterprise. Try the Team plan free for 7 days.',
    prerender: true,
  },
  '/contact': {
    title: 'Contact',
    description: 'Talk to the Relaya team about pricing, a custom integration, the design partner programme, a security review or support.',
    prerender: true,
  },
  '/docs': {
    title: 'Relaya docs',
    description: 'Route a provider’s webhooks through Relaya, forward them to your code, test them, verify signatures, and recover when something breaks.',
    prerender: true,
  },
  '/custom-integrations': {
    title: 'Custom integrations, built for you',
    description: 'Need Tally, a regional logistics API or a niche HRMS? Relaya builds the integration for you, with verification, retries and monitoring built in.',
    prerender: true,
  },
  '/integrations/stripe-webhooks': {
    title: 'Stripe webhooks: verify, monitor and replay',
    description: 'Receive Stripe webhooks through Relaya: Stripe-Signature verified with a 5-minute tolerance, every event stored, forwarded with retries and replayable.',
    prerender: true,
  },
  '/integrations/razorpay-webhooks': {
    title: 'Razorpay webhooks: verify, monitor and replay',
    description: 'Receive Razorpay webhooks through Relaya: X-Razorpay-Signature verified, duplicates dropped by event ID, payments forwarded with retries and replayable.',
    prerender: true,
  },
  '/integrations/shopify-webhooks': {
    title: 'Shopify webhooks: verify, monitor and replay',
    description: 'Receive Shopify webhooks through Relaya: X-Shopify-Hmac-Sha256 verified, duplicate deliveries dropped, orders forwarded with retries and replayable.',
    prerender: true,
  },
  '/integrations/cashfree-webhooks': {
    title: 'Cashfree webhooks: verify, monitor and replay',
    description: 'Receive Cashfree Payment Gateway webhooks through Relaya: x-webhook-signature and timestamp verified, events stored, forwarded with retries and replayable.',
    prerender: true,
  },
  '/integrations/whatsapp-webhooks': {
    title: 'WhatsApp Business webhooks',
    description: 'How WhatsApp Cloud API webhooks work (verification handshake and X-Hub-Signature-256), and how Relaya can receive and monitor them for your team.',
    prerender: true,
  },
  '/vs/hookdeck': {
    title: 'Relaya vs Hookdeck',
    description: 'An honest comparison of Relaya and Hookdeck for receiving webhooks: what each one does, where they overlap, and which fits your team.',
    prerender: true,
  },
  '/vs/svix': {
    title: 'Relaya vs Svix',
    description: 'An honest comparison of Relaya and Svix: Svix is built for sending webhooks; Relaya for receiving them and keeping integrations healthy. Where each fits.',
    prerender: true,
  },
  '/blog': {
    title: 'Blog',
    description: 'Practical guides on webhooks and integrations: debugging failed deliveries, verifying signatures, replaying safely and keeping integrations healthy.',
    prerender: true,
  },
  '/blog/debug-webhooks': {
    title: 'How to debug webhooks that fail or never arrive',
    description: 'A step-by-step checklist for debugging webhooks: did it arrive, did the signature pass, what did your endpoint answer, and how to recover the events you missed.',
    article: { published: '2026-10-17', modified: '2026-10-17' },
    prerender: true,
  },
  '/blog/webhook-signature-verification': {
    title: 'Webhook signature verification, explained',
    description: 'How webhook signatures work, how Stripe, Razorpay, Shopify and Cashfree sign their requests, and the five mistakes that make verification fail.',
    article: { published: '2026-10-17', modified: '2026-10-17' },
    prerender: true,
  },
}

/** The full <title> for a page. */
export const fullTitle = (m: PageMeta) => (m.title.includes('Relaya') ? m.title : `${m.title} · Relaya`)

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta')
  el.setAttribute(key, name)
  return el
}

/** Sets the title, description, canonical URL and Open Graph tags for a public page. */
export function usePageMeta(path: string, fallback: { title: string }) {
  const known = PAGES[path]
  const title = fullTitle(known ?? { title: fallback.title, description: '' })
  const description = known?.description
  useEffect(() => {
    const prev = document.title
    const url = SITE + path
    document.title = title
    if (description) {
      setTag('meta[name="description"]', meta('name', 'description'), 'content', description)
      setTag('meta[property="og:description"]', meta('property', 'og:description'), 'content', description)
    }
    setTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', title)
    setTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', url)
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
    return () => {
      document.title = prev
      document.head.querySelector('link[rel="canonical"]')?.remove()
    }
  }, [path, title, description])
}
