import { BuildingIcon, HammerIcon, LifeBuoyIcon, MailIcon, ShieldCheckIcon, SparklesIcon } from 'lucide-react'

import { PublicPage, Table } from '@/pages/public/layout'
import { CONTACT_EMAIL, PlanCards, PricingNote, TRIAL_DAYS } from '@/pages/landing/landing'
import { FAQ } from './faq'
import { A, Block, Cards, Checks, CtaBand, Faq, Related, Steps, Strong } from './ui'

const mail = (subject: string) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`

// ---- Pricing ---------------------------------------------------------------------------

export function PricingPage() {
  return (
    <PublicPage
      wide
      eyebrow="Pricing"
      title="Simple plans that grow with your integrations"
      intro={`Try the Team plan free for ${TRIAL_DAYS} days. For pricing, contact us at ${CONTACT_EMAIL}. Design partners get 50% off any plan for 12 months.`}
      crumbs={[['/pricing', 'Pricing']]}
    >
      <PlanCards />
      <PricingNote />

      <div className="mt-16 max-w-3xl space-y-12">
        <Block title="In every plan">
          <Checks
            items={[
              <>Signature verification for Razorpay, Cashfree, PayU, PhonePe, Stripe, Shopify, GitHub, Slack, HubSpot, Twilio and more</>,
              <>Every event recorded and searchable, with sensitive fields masked</>,
              <>Forwarding to your endpoints, signed by Relaya, with automatic retries</>,
              <>Integration contracts, incidents and safe replay</>,
              <>Alerts to Slack, email, Jira or your own webhook</>,
              <>Owner, admin and member roles, scoped API keys and an audit log</>,
            ]}
          />
        </Block>
        <Block title="Pricing questions">
          <Faq items={FAQ['/pricing']} />
        </Block>
      </div>
      <CtaBand title="Try it with your own webhooks." />
    </PublicPage>
  )
}

// ---- Contact ---------------------------------------------------------------------------

export function ContactPage() {
  const topics = [
    { icon: <BuildingIcon className="size-4" />, title: 'Sales and pricing', body: <>Plans, quotes and volume. <A to={mail('Relaya pricing')}>Ask for a quote</A></> },
    { icon: <HammerIcon className="size-4" />, title: 'Custom integration', body: <>Tell us the system you need connected. <A to={mail('Custom integration request')}>Request an integration</A></> },
    { icon: <SparklesIcon className="size-4" />, title: 'Design partner programme', body: <>50% off any plan for 12 months in exchange for feedback. <A to={mail('Design partner programme')}>Apply</A></> },
    { icon: <ShieldCheckIcon className="size-4" />, title: 'Security review', body: <>Questionnaires, data handling and our <A to="/security">security page</A>. <A to={mail('Security review')}>Start a review</A></> },
    { icon: <LifeBuoyIcon className="size-4" />, title: 'Support', body: <>Already a customer? Include your organization name and an event ID if you have one. <A to={mail('Relaya support')}>Get help</A></> },
    { icon: <MailIcon className="size-4" />, title: 'Anything else', body: <>Partnerships, press or just saying hello. <A to={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A></> },
  ]
  return (
    <PublicPage
      wide
      eyebrow="Contact"
      title="Talk to the Relaya team"
      intro={<>Write to us at <A to={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. Pick a topic below and your email starts with the right subject.</>}
      crumbs={[['/contact', 'Contact']]}
    >
      <Cards items={topics} />
      <div className="mt-12 max-w-3xl">
        <Block title="Helpful to include">
          <Checks
            items={[
              'Which providers you receive webhooks from (Razorpay, Stripe, Shopify…) and roughly how many events a month',
              'For a custom integration: the system, a link to its API docs, and what should happen when data changes',
              'For support: your organization name, the webhook, and an event ID or the time it happened',
            ]}
          />
        </Block>
      </div>
      <CtaBand title="Prefer to try it first?" />
    </PublicPage>
  )
}

// ---- Custom integrations ---------------------------------------------------------------

export function CustomIntegrationsPage() {
  return (
    <PublicPage
      wide
      eyebrow="Custom integrations"
      title="The integration you need doesn't exist? We build it."
      intro="Tally, a regional logistics API, a niche HRMS: tell us what you need and we build it on the Relaya connector standard. It is protected from day one, with verification, retries and monitoring built in."
      crumbs={[['/custom-integrations', 'Custom integrations']]}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Built and maintained by our team', 'You don’t write or own connector code.'],
          ['Protected like every integration', 'Verification, duplicates, retries, contracts and alerts.'],
          ['Delivered in 1 to 3 weeks', 'With a date agreed before we start.'],
          ['Free if it joins the catalog', 'When other customers can use it too.'],
        ].map(([t, b]) => (
          <div key={t} className="min-w-0 rounded-2xl border border-[#14b886]/30 bg-[#14b886]/[0.05] p-5">
            <h2 className="font-semibold text-l-text">{t}</h2>
            <p className="mt-1.5 text-sm">{b}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        <Block title="What teams ask us for">
          <Table
            head={['Kind of system', 'Examples']}
            rows={[
              ['Accounting and ERP', 'Tally, Zoho Books, regional ERPs'],
              ['Logistics', 'Courier and aggregator APIs, warehouse systems'],
              ['HR and payroll', 'HRMS and attendance systems'],
              ['Messaging', <A key="w" to="/integrations/whatsapp-webhooks">WhatsApp Business</A>],
              ['Payments and banking', 'Payment gateways, payout and bank APIs not yet in the catalog'],
            ]}
          />
          <p>
            Already built in: webhooks from Razorpay, Cashfree, PayU, PhonePe, Stripe, Shopify, GitHub, Slack, Twilio, HubSpot, Square,
            Segment, SendGrid, Notion, Jira and any Standard Webhooks or HMAC sender, plus OAuth connections to Zoho, HubSpot, Google, Jira and
            Shiprocket.
          </p>
        </Block>
        <Block title="How it works">
          <Steps
            items={[
              <><Strong>Tell us what you need:</Strong> the system, its API docs, and what should happen when data changes. <A to={mail('Custom integration request')}>Email us</A>.</>,
              <><Strong>We scope it</Strong> and agree a delivery date and price with you (free if it joins the public catalog).</>,
              <><Strong>We build it</Strong> on the Relaya connector standard and test it against the real system with you.</>,
              <><Strong>It runs like every other integration:</Strong> events verified and recorded, forwarded with retries, payloads watched by contract checks, alerts when something breaks.</>,
            ]}
          />
        </Block>
        <Block title="Custom integration questions">
          <Faq items={FAQ['/custom-integrations']} />
        </Block>
      </div>
      <div className="mt-12">
        <Related
          items={[
            ['/integrations/razorpay-webhooks', 'Razorpay webhooks', 'Built in: verify, monitor and replay.'],
            ['/integrations/shopify-webhooks', 'Shopify webhooks', 'Built in: verify, monitor and replay.'],
            ['/contact', 'Contact', 'Tell us what you need.'],
          ]}
        />
      </div>
      <CtaBand title="Tell us what to build." body="Most custom integrations are ready in 1 to 3 weeks, protected from day one." />
    </PublicPage>
  )
}
