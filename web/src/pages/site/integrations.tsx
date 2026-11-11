import { BellIcon, FileSearchIcon, GitCompareArrowsIcon, RotateCcwIcon, SendIcon, ShieldCheckIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { C, Code, PublicPage, Table } from '@/pages/public/layout'
import { A, Block, Cards, Checks, CtaBand, Faq, Pill, Related, Steps, Strong } from './ui'
import { FAQ } from './faq'
import { PAGES } from './meta'

// One page per provider. Every technical claim here matches the provider's
// verification code in backend/internal/provider: keep them in sync.

interface Provider {
  slug: string
  name: string
  eyebrow: string
  intro: string
  /** How the provider signs, as shown in the "What Relaya checks" table. */
  header: ReactNode
  algorithm: ReactNode
  freshness: ReactNode
  dedup: ReactNode
  eventType: ReactNode
  secret: ReactNode
  setup: ReactNode[]
  events: [string, string][]
  sample: string
  why: ReactNode
}

const providers: Record<string, Provider> = {
  razorpay: {
    slug: 'razorpay-webhooks',
    name: 'Razorpay',
    eyebrow: 'Integrations · Razorpay',
    intro:
      'Razorpay tells your product about every captured payment, failed payment and refund through webhooks. Relaya receives them first: it verifies the signature, drops duplicates, records every event and forwards it to your code with retries, so a deploy or an outage never costs you a payment notification.',
    header: <C>X-Razorpay-Signature</C>,
    algorithm: 'Hex HMAC-SHA256 of the raw body, keyed with your webhook secret',
    freshness: 'Razorpay sends no timestamp, so replays are stopped by the event ID instead',
    dedup: <><C>X-Razorpay-Event-Id</C> header</>,
    eventType: <><C>event</C> field of the body, e.g. <C>payment.captured</C></>,
    secret: 'The secret you set when creating the webhook in Razorpay',
    setup: [
      <>In Relaya, create a webhook and pick <Strong>Razorpay</Strong>. Copy its URL.</>,
      <>In the <Strong>Razorpay Dashboard → Accounts &amp; Settings → Webhooks → Add New Webhook</Strong>, paste the URL as the Webhook URL.</>,
      <>Set a secret there and enter the same secret in Relaya, so every request can be verified.</>,
      <>Choose the events you need (for example <C>payment.captured</C>, <C>payment.failed</C>, <C>refund.processed</C>) and save.</>,
      <>Add your own endpoint as a <Strong>destination</Strong> in Relaya. Events are forwarded there, signed by Relaya, with retries.</>,
    ],
    events: [
      ['payment.captured', 'The money is yours: fulfil the order or activate the plan.'],
      ['payment.failed', 'Show the customer a retry option; useful for dunning.'],
      ['order.paid', 'An order is fully paid, even across several payment attempts.'],
      ['refund.processed', 'Update your ledger and tell the customer.'],
      ['subscription.charged', 'A recurring payment succeeded: extend access.'],
    ],
    sample: `POST https://api.relaya.sbs/v1/in/in_7Kq…
X-Razorpay-Signature: 3f1c…e9a2
X-Razorpay-Event-Id: Kq8xY2nZp4LmTe

{ "entity": "event", "event": "payment.captured",
  "payload": { "payment": { "entity": { "id": "pay_Kq8…", "amount": 49900, "currency": "INR", … } } } }`,
    why: (
      <>
        Razorpay retries a failed delivery for a while and then gives up, and its signature has no timestamp. If your endpoint is down
        during a deploy, or someone replays an old request, your books drift from what Razorpay knows. Relaya answers Razorpay in
        milliseconds from a separate ingest service, keeps every event for your retention window, and lets you replay any of them later.
      </>
    ),
  },
  stripe: {
    slug: 'stripe-webhooks',
    name: 'Stripe',
    eyebrow: 'Integrations · Stripe',
    intro:
      'Stripe reports payments, subscriptions, invoices and disputes through webhooks. Relaya sits in front of your endpoint: it checks every Stripe-Signature, drops duplicates, records each event, and forwards it to your code with retries and a replay button for the day something goes wrong.',
    header: <C>Stripe-Signature: t=…,v1=…</C>,
    algorithm: <>Hex HMAC-SHA256 of <C>{'<t>.<raw body>'}</C>, keyed with the endpoint's signing secret (<C>whsec_…</C>)</>,
    freshness: 'The timestamp must be within 5 minutes; older or future-dated requests are rejected',
    dedup: <>Event <C>id</C> in the body (<C>evt_…</C>)</>,
    eventType: <><C>type</C> field of the body, e.g. <C>invoice.paid</C></>,
    secret: <>The endpoint's signing secret, <C>whsec_…</C></>,
    setup: [
      <>In Relaya, create a webhook and pick <Strong>Stripe</Strong>. Copy its URL.</>,
      <>In the <Strong>Stripe Dashboard → Developers → Webhooks → Add endpoint</Strong>, paste the URL and choose the events to send.</>,
      <>After saving, reveal the endpoint's <Strong>signing secret</Strong> (<C>whsec_…</C>) and enter it in Relaya.</>,
      <>Add your own endpoint as a <Strong>destination</Strong>. Relaya forwards each event there, signed, with retries.</>,
    ],
    events: [
      ['payment_intent.succeeded', 'A payment went through.'],
      ['checkout.session.completed', 'A Checkout session finished: provision what was bought.'],
      ['invoice.paid', 'A subscription invoice was paid: extend access.'],
      ['invoice.payment_failed', 'Start dunning before access lapses.'],
      ['customer.subscription.updated', 'Plan, quantity or status changed.'],
      ['charge.dispute.created', 'A chargeback opened: respond before the deadline.'],
    ],
    sample: `POST https://api.relaya.sbs/v1/in/in_7Kq…
Stripe-Signature: t=1792000000,v1=5257a8…c1f0

{ "id": "evt_1Q…", "object": "event", "type": "invoice.paid",
  "data": { "object": { "id": "in_1Q…", "amount_paid": 4900, "currency": "usd", … } } }`,
    why: (
      <>
        Stripe's own dashboard shows deliveries to your endpoint, but not what your code did with them, whether a payload changed shape,
        or which customers were affected when something failed. Relaya keeps every event, groups failures into incidents, and replays
        exactly the affected events once you have fixed the bug, each with the same <C>Idempotency-Key</C>.
      </>
    ),
  },
  shopify: {
    slug: 'shopify-webhooks',
    name: 'Shopify',
    eyebrow: 'Integrations · Shopify',
    intro:
      'Shopify webhooks drive orders, fulfilment, inventory and the mandatory privacy topics for apps. Relaya receives them, verifies the HMAC, drops the duplicate deliveries Shopify can send, records every event and forwards it to your services with retries and replay.',
    header: <C>X-Shopify-Hmac-Sha256</C>,
    algorithm: 'Base64 HMAC-SHA256 of the raw body, keyed with your app’s API secret key (or the webhook signing key Shopify shows)',
    freshness: 'Shopify sends no signed timestamp; duplicates are caught by event ID',
    dedup: <><C>X-Shopify-Event-Id</C>, else <C>X-Shopify-Webhook-Id</C></>,
    eventType: <><C>X-Shopify-Topic</C> header, e.g. <C>orders/paid</C></>,
    secret: 'Your app’s API secret key, or the signing key shown in Settings → Notifications',
    setup: [
      <>In Relaya, create a webhook and pick <Strong>Shopify</Strong>. Copy its URL.</>,
      <>In <Strong>Shopify admin → Settings → Notifications → Webhooks → Create webhook</Strong> (or register it through the Admin API), paste the URL and choose JSON.</>,
      <>Enter your app's API secret key, or the webhook signing key Shopify shows, in Relaya.</>,
      <>Add your order service, warehouse or ERP as <Strong>destinations</Strong>. Each one gets every event, signed by Relaya, with its own retries.</>,
    ],
    events: [
      ['orders/create', 'A new order: reserve stock, start fulfilment.'],
      ['orders/paid', 'Payment confirmed: hand the order to the warehouse.'],
      ['orders/fulfilled', 'Shipped: notify the customer.'],
      ['refunds/create', 'Update accounting and inventory.'],
      ['products/update', 'Sync catalogue changes to other channels.'],
      ['app/uninstalled', 'Clean up the shop’s data in your app.'],
    ],
    sample: `POST https://api.relaya.sbs/v1/in/in_7Kq…
X-Shopify-Topic: orders/paid
X-Shopify-Hmac-Sha256: 8m3V…Zk=
X-Shopify-Event-Id: 98880550-7158-44d4-b7cd-2c97c8a091b5

{ "id": 5100000012345, "order_number": 18427, "total_price": "2499.00", "currency": "INR", … }`,
    why: (
      <>
        A missed <C>orders/paid</C> means an order that never ships. Shopify can deliver the same event more than once, and app
        updates can rename fields like <C>total_price</C>. Relaya catches both: duplicates are dropped by event ID, and a missing
        critical field opens an incident listing every affected order, so you can fix and replay just those.
      </>
    ),
  },
  cashfree: {
    slug: 'cashfree-webhooks',
    name: 'Cashfree',
    eyebrow: 'Integrations · Cashfree',
    intro:
      'Cashfree Payment Gateway reports successful, failed and dropped payments and refunds through webhooks. Relaya verifies each one with your secret key and timestamp, records it, and forwards it to your code with retries, so your order status never depends on one HTTP request getting through.',
    header: <><C>x-webhook-signature</C> and <C>x-webhook-timestamp</C></>,
    algorithm: <>Base64 HMAC-SHA256 of <C>{'<timestamp><raw body>'}</C>, keyed with your Payment Gateway secret key</>,
    freshness: 'The timestamp (milliseconds) must be within 5 minutes',
    dedup: <><C>x-idempotency-key</C> (webhook version 2025-01-01 and later), else a hash of the body</>,
    eventType: <><C>type</C> field of the body, e.g. <C>PAYMENT_SUCCESS_WEBHOOK</C></>,
    secret: 'Your Payment Gateway secret key (the API client secret)',
    setup: [
      <>In Relaya, create a webhook and pick <Strong>Cashfree</Strong>. Copy its URL.</>,
      <>In the <Strong>Cashfree Merchant Dashboard → Payment Gateway → Developers → Webhooks → Add Webhook Endpoint</Strong>, paste the URL and pick the events.</>,
      <>Enter your Payment Gateway secret key in Relaya: Cashfree signs webhooks with it.</>,
      <>Add your endpoint as a <Strong>destination</Strong>; events are forwarded there, signed by Relaya, with retries.</>,
    ],
    events: [
      ['PAYMENT_SUCCESS_WEBHOOK', 'The customer paid: confirm the order.'],
      ['PAYMENT_FAILED_WEBHOOK', 'The payment failed: offer another method.'],
      ['PAYMENT_USER_DROPPED_WEBHOOK', 'The customer left the payment page.'],
      ['REFUND_STATUS_WEBHOOK', 'A refund changed status.'],
    ],
    sample: `POST https://api.relaya.sbs/v1/in/in_7Kq…
x-webhook-timestamp: 1792000000123
x-webhook-signature: q0Zs…4w=

{ "type": "PAYMENT_SUCCESS_WEBHOOK", "event_time": "2026-10-17T10:15:00+05:30",
  "data": { "order": { "order_id": "KC_18427", "order_amount": 2499 }, "payment": { "payment_status": "SUCCESS", … } } }`,
    why: (
      <>
        For many Indian businesses the webhook is the only reliable signal that money arrived. Relaya answers Cashfree immediately from
        a separate ingest path, checks the signature and the timestamp so old requests can't be replayed, and keeps the event so you can
        resend it to your system after an outage instead of reconciling by hand.
      </>
    ),
  },
}

const common = [
  { icon: <ShieldCheckIcon className="size-4" />, title: 'Verified on arrival', body: 'Forged or stale requests are rejected and kept as evidence, never forwarded.' },
  { icon: <FileSearchIcon className="size-4" />, title: 'Every event on record', body: 'Headers, payload and signature result, searchable by type or provider event ID, with secrets masked.' },
  { icon: <SendIcon className="size-4" />, title: 'Forwarded with retries', body: 'Signed with Relaya-Signature, retried with backoff, with an Idempotency-Key that never changes.' },
  { icon: <GitCompareArrowsIcon className="size-4" />, title: 'Contract checks', body: 'A renamed, removed or retyped critical field opens an incident with every affected event.' },
  { icon: <RotateCcwIcon className="size-4" />, title: 'Safe replay', body: 'Preview exactly what will be resent, then replay only the affected events.' },
  { icon: <BellIcon className="size-4" />, title: 'Alerts', body: 'Slack, email, Jira or your own webhook when signatures fail or a destination goes down.' },
]

export function IntegrationPage({ provider }: { provider: keyof typeof providers }) {
  const p = providers[provider]
  const meta = PAGES[`/integrations/${p.slug}`]
  return (
    <PublicPage wide eyebrow={p.eyebrow} title={meta.title} intro={p.intro} crumbs={[['/integrations/' + p.slug, `${p.name} webhooks`]]}>
      <div className="max-w-3xl space-y-12">
        <Block title={`Why route ${p.name} webhooks through Relaya`}>
          <p>{p.why}</p>
        </Block>
        <Block title="What Relaya checks on every request">
          <Table
            head={['', p.name]}
            rows={[
              ['Signature header', p.header],
              ['Algorithm', p.algorithm],
              ['Freshness', p.freshness],
              ['Duplicates', p.dedup],
              ['Event type', p.eventType],
              ['Secret to enter', p.secret],
            ]}
          />
          <Code title={`A ${p.name} webhook arriving at Relaya`}>{p.sample}</Code>
        </Block>
        <Block title={`Set up ${p.name} webhooks in about 15 minutes`}>
          <Steps items={p.setup} />
          <p>
            Then verify Relaya's signature in your endpoint and answer <C>2xx</C>. The <A to="/docs#receive">docs</A> show how, with SDKs for
            Node, Python, PHP, Go and Java.
          </p>
        </Block>
        <Block title={`${p.name} events teams route through Relaya`}>
          <Table head={['Event', 'What you usually do with it']} rows={p.events.map(([e, d]) => [<C key={e}>{e}</C>, d])} />
        </Block>
      </div>
      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">Included for every {p.name} webhook</h2>
        <Cards items={common} />
      </div>
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">{p.name} webhooks: common questions</h2>
        <Faq items={FAQ['/integrations/' + p.slug]} />
      </div>
      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">Keep reading</h2>
        <Related
          items={[
            ['/blog/webhook-signature-verification', 'Webhook signature verification, explained', 'How providers sign requests and the mistakes that make verification fail.'],
            ['/blog/debug-webhooks', 'How to debug webhooks', 'A checklist for webhooks that fail or never arrive.'],
            ...Object.values(providers)
              .filter((o) => o.slug !== p.slug)
              .slice(0, 1)
              .map((o): [string, string, string] => [`/integrations/${o.slug}`, `${o.name} webhooks`, `Verify, monitor and replay ${o.name} events.`]),
          ]}
        />
      </div>
      <CtaBand title={`Never miss a ${p.name} event again.`} />
    </PublicPage>
  )
}

export const RazorpayPage = () => <IntegrationPage provider="razorpay" />
export const StripePage = () => <IntegrationPage provider="stripe" />
export const ShopifyPage = () => <IntegrationPage provider="shopify" />
export const CashfreePage = () => <IntegrationPage provider="cashfree" />

// ---- WhatsApp: not a built-in provider yet ---------------------------------------------

export function WhatsAppPage() {
  return (
    <PublicPage
      wide
      eyebrow="Integrations · WhatsApp"
      title={PAGES['/integrations/whatsapp-webhooks'].title}
      intro="WhatsApp Business (Cloud API) webhooks tell your product about incoming messages and delivery statuses. Here is how they work, what makes them easy to get wrong, and how Relaya can receive and watch them for your team."
      crumbs={[['/integrations/whatsapp-webhooks', 'WhatsApp webhooks']]}
      after={
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Pill tone="muted">Built-in provider: coming soon</Pill>
          <Pill>Available now as a custom integration</Pill>
        </div>
      }
    >
      <div className="max-w-3xl space-y-12">
        <Block title="How WhatsApp webhooks work">
          <p>
            You subscribe your Meta app to the <C>whatsapp_business_account</C> object and give Meta a callback URL. Before sending
            anything, Meta checks that you own the URL with a <Strong>verification handshake</Strong>, then posts events as JSON:
          </p>
          <Steps
            items={[
              <>
                <Strong>Verify:</Strong> Meta sends <C>GET ?hub.mode=subscribe&amp;hub.verify_token=…&amp;hub.challenge=…</C>. Your endpoint
                compares the verify token with the one you chose and answers with the <C>hub.challenge</C> value.
              </>,
              <>
                <Strong>Receive:</Strong> each event is a <C>POST</C> with an <C>X-Hub-Signature-256: sha256=…</C> header, the hex
                HMAC-SHA256 of the raw body keyed with your app secret.
              </>,
              <>
                <Strong>Handle:</Strong> messages arrive under <C>entry[].changes[].value.messages</C> and delivery updates (sent, delivered,
                read, failed) under <C>value.statuses</C>. Answer <C>200</C> quickly; Meta retries failed deliveries.
              </>,
            ]}
          />
          <Code title="A WhatsApp status update (shortened)">{`POST /your/callback
X-Hub-Signature-256: sha256=a1b2…

{ "object": "whatsapp_business_account",
  "entry": [{ "changes": [{ "field": "messages",
    "value": { "statuses": [{ "id": "wamid.HBgM…", "status": "delivered", "recipient_id": "9198…" }] } }] }] }`}</Code>
        </Block>
        <Block title="Where WhatsApp webhooks go wrong">
          <Checks
            items={[
              <><Strong>Parsing before verifying.</Strong> The signature covers the exact bytes Meta sent. Re-serialised JSON won't match.</>,
              <><Strong>Slow handlers.</Strong> Doing the work before answering leads to timeouts and retries, so the same message is processed twice.</>,
              <><Strong>No record.</Strong> When a customer says "I replied and nothing happened", there is nothing to look at without a stored copy of each event.</>,
              <><Strong>Silent drops.</Strong> If the subscription breaks, nothing errors: messages simply stop arriving.</>,
            ]}
          />
        </Block>
        <Block title="Relaya and WhatsApp today">
          <p>
            Relaya's ingest receives <C>POST</C> webhooks; the GET verification handshake Meta requires isn't answered yet, so WhatsApp
            isn't a built-in provider. For teams that need WhatsApp now, we build it as a{' '}
            <A to="/custom-integrations">custom integration</A>: the handshake, signature checks with your app secret, duplicate detection on
            message IDs, and the same recording, forwarding, retries, alerts and replay as every other integration.
          </p>
          <p>
            Want it? <A to="/contact">Tell us about your setup</A> and we'll reply with a delivery date.
          </p>
        </Block>
      </div>
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">WhatsApp webhooks: common questions</h2>
        <Faq items={FAQ['/integrations/whatsapp-webhooks']} />
      </div>
      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">Keep reading</h2>
        <Related
          items={[
            ['/custom-integrations', 'Custom integrations', 'We build the integration you need, protected from day one.'],
            ['/blog/webhook-signature-verification', 'Webhook signature verification, explained', 'HMAC signatures and the mistakes that break them.'],
            ['/integrations/razorpay-webhooks', 'Razorpay webhooks', 'Verify, monitor and replay Razorpay events.'],
          ]}
        />
      </div>
      <CtaBand title="Need WhatsApp webhooks you can trust?" body="Tell us what you need. We build it on the Relaya connector standard, usually in 1 to 3 weeks." />
    </PublicPage>
  )
}
