// Server-side entry for scripts/prerender.mjs: renders the public marketing pages to
// HTML at build time, so search engines (and visitors before JavaScript loads) get
// the full content. Built with `vite build --ssr`; never shipped to browsers.
import { createElement, type ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import { DocsPage } from '@/pages/public/docs'
import * as site from '@/pages/site'
import { FAQ } from '@/pages/site/faq'
import { PAGES, SITE, fullTitle } from '@/pages/site/meta'

const routes: Record<string, ComponentType> = {
  '/pricing': site.PricingPage,
  '/contact': site.ContactPage,
  '/docs': DocsPage,
  '/custom-integrations': site.CustomIntegrationsPage,
  '/integrations/stripe-webhooks': site.StripePage,
  '/integrations/razorpay-webhooks': site.RazorpayPage,
  '/integrations/shopify-webhooks': site.ShopifyPage,
  '/integrations/cashfree-webhooks': site.CashfreePage,
  '/integrations/whatsapp-webhooks': site.WhatsAppPage,
  '/vs/hookdeck': site.VsHookdeckPage,
  '/vs/svix': site.VsSvixPage,
  '/blog': site.BlogIndexPage,
  '/blog/debug-webhooks': site.DebugWebhooksPage,
  '/blog/webhook-signature-verification': site.SignatureVerificationPage,
}

export { FAQ as faqs, PAGES, SITE, fullTitle }

export const paths = Object.keys(routes)

export function render(path: string) {
  const Page = routes[path]
  return renderToString(createElement(StaticRouter, { location: path }, createElement(Page)))
}
