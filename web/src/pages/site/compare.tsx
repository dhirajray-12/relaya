import type { ReactNode } from 'react'

import { C, PublicPage } from '@/pages/public/layout'
import { A, Block, Checks, CtaBand, Faq, Related, Strong } from './ui'
import { FAQ } from './faq'
import { PAGES } from './meta'

// Comparison pages. Rules: describe competitors only from their own public material,
// date it, and never claim they lack something we haven't verified.

interface Comparison {
  path: string
  name: string
  site: string
  intro: string
  theirFocus: ReactNode[]
  ourFocus: ReactNode[]
  chooseThem: ReactNode[]
  chooseUs: ReactNode[]
  together: ReactNode
}

const ourFocus: ReactNode[] = [
  <><Strong>Receiving webhooks and keeping integrations healthy:</Strong> signatures verified on arrival, duplicates dropped, every event recorded and searchable.</>,
  <><Strong>Indian payment providers built in:</Strong> Razorpay, Cashfree, PayU and PhonePe verified natively, alongside Stripe, Shopify, GitHub, Slack, HubSpot, Twilio and more.</>,
  <><Strong>Integration contracts:</Strong> Relaya learns the shape of each event type and opens an incident when a critical field is removed, renamed or changes type.</>,
  <><Strong>Incidents and safe recovery:</Strong> affected events grouped per broken field, replay with a preview first, repair rules you dry-run on real events, and the same <C>Idempotency-Key</C> on every resend.</>,
  <><Strong>Beyond webhooks:</Strong> outbound webhooks with a customer portal, OAuth connections to Zoho, HubSpot, Google, Jira and Shiprocket, and an API proxy that refreshes tokens for you.</>,
  <><Strong>Integrations built for you:</Strong> if a provider you need isn't supported, our team <A to="/custom-integrations">builds it</A>.</>,
]

const comparisons: Record<'hookdeck' | 'svix', Comparison> = {
  hookdeck: {
    path: '/vs/hookdeck',
    name: 'Hookdeck',
    site: 'https://hookdeck.com',
    intro:
      'Hookdeck and Relaya both sit between webhook providers and your code. They put the weight in different places: Hookdeck on a managed event gateway for routing and delivering events, Relaya on knowing when an integration breaks and recovering from it safely. Here is an honest look at both.',
    theirFocus: [
      <><Strong>Event Gateway:</Strong> managed infrastructure for receiving, routing, transforming and delivering inbound webhook events.</>,
      <><Strong>Outpost:</Strong> open-source outbound webhook delivery with multi-destination support, managed or self-hosted.</>,
      <><Strong>Developer tools:</Strong> a CLI for receiving webhooks on localhost, a Console for inspecting payloads, and Radar for third-party webhook latency alerts.</>,
      <><Strong>Reliability at scale:</Strong> spike protection, backpressure management and delivery guarantees.</>,
    ],
    ourFocus,
    chooseThem: [
      'Your main need is high-volume event routing and transformation between many sources and destinations.',
      'You want an open-source outbound delivery engine to self-host.',
      'You value a widely adopted product with a large developer community.',
    ],
    chooseUs: [
      'You receive payments or orders from Razorpay, Cashfree, PayU or PhonePe and want them verified natively.',
      'You want to know when a provider changes a payload, before your ledger or your customers do.',
      'You want incidents that list every affected event, and a replay you can preview before it runs.',
      'You need an integration that doesn’t exist yet, built and maintained for you.',
    ],
    together: (
      <>
        Some teams use a general event gateway for routing and point their payment and commerce webhooks at Relaya for verification,
        contracts and incidents. Relaya forwards each event to any HTTPS endpoint, signed, so it fits in front of or behind other tools.
      </>
    ),
  },
  svix: {
    path: '/vs/svix',
    name: 'Svix',
    site: 'https://www.svix.com',
    intro:
      'Svix is best known for sending webhooks: it gives your product a webhook system your customers subscribe to. Relaya is built for the other direction, the webhooks your product receives from Razorpay, Stripe, Shopify and others, and for keeping those integrations healthy. Here is how they compare.',
    theirFocus: [
      <><Strong>Svix Dispatch:</Strong> webhook sending as a service, with retries, signed payloads, secret rotation, per-customer isolation, event filtering, transformations and throttling.</>,
      <><Strong>App Portal:</Strong> an embeddable UI where your customers manage their endpoints and see delivery logs.</>,
      <><Strong>Open source:</Strong> a self-hostable Svix server.</>,
      <><Strong>Standard Webhooks:</Strong> Svix leads the Standard Webhooks specification. It also offers Svix Ingest for receiving and Svix Stream for data streaming.</>,
    ],
    ourFocus,
    chooseThem: [
      'Your main need is sending webhooks to thousands of customers, with advanced delivery controls.',
      'You need multi-region delivery or want to self-host an open-source sender.',
      'You want an embeddable portal with deep customisation for your customers.',
    ],
    chooseUs: [
      'Your main need is the webhooks you receive: payments, orders, shipments, CRM updates.',
      'You want breaking payload changes detected and grouped into incidents with every affected event.',
      'You want sending and receiving in one place at a smaller scale: Relaya includes outbound webhooks with a customer portal too.',
      'You need an integration that doesn’t exist yet, built for you.',
    ],
    together: (
      <>
        They work well together. Relaya verifies webhooks from senders that follow Standard Webhooks or use Svix (choose{' '}
        <Strong>Standard Webhooks</Strong> as the provider), so events from Svix-powered products are checked, recorded and watched like any
        other.
      </>
    ),
  },
}

function ComparePage({ which }: { which: keyof typeof comparisons }) {
  const c = comparisons[which]
  return (
    <PublicPage wide eyebrow="Compare" title={PAGES[c.path].title} intro={c.intro} crumbs={[[c.path, `Relaya vs ${c.name}`]]}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-l-border bg-l-surface p-6">
          <h2 className="text-lg font-semibold text-l-text">What {c.name} focuses on</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <Checks items={c.theirFocus} />
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-[#14b886]/40 bg-[#14b886]/[0.05] p-6">
          <h2 className="text-lg font-semibold text-l-text">What Relaya focuses on</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <Checks items={c.ourFocus} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-l-subtle">
        {c.name} details are from <A to={c.site}>{c.site.replace('https://', '')}</A> as of October 2026; products change, so check there for
        the latest. {c.name} is a trademark of its owner.
      </p>

      <div className="mt-14 max-w-3xl space-y-12">
        <Block title={`Choose ${c.name} if…`}>
          <Checks items={c.chooseThem} />
        </Block>
        <Block title="Choose Relaya if…">
          <Checks items={c.chooseUs} />
        </Block>
        <Block title="Can you use both?">
          <p>{c.together}</p>
        </Block>
        <Block title="Common questions">
          <Faq items={FAQ[c.path]} />
        </Block>
      </div>
      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">Keep reading</h2>
        <Related
          items={[
            [which === 'svix' ? '/vs/hookdeck' : '/vs/svix', `Relaya vs ${which === 'svix' ? 'Hookdeck' : 'Svix'}`, 'Another honest comparison.'],
            ['/integrations/razorpay-webhooks', 'Razorpay webhooks', 'Verify, monitor and replay Razorpay events.'],
            ['/pricing', 'Pricing', 'Plans for teams with integrations in production.'],
          ]}
        />
      </div>
      <CtaBand title="See Relaya with your own webhooks." />
    </PublicPage>
  )
}

export const VsHookdeckPage = () => <ComparePage which="hookdeck" />
export const VsSvixPage = () => <ComparePage which="svix" />
