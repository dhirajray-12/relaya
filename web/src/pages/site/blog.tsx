import { ArrowRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { C, Code, PublicPage, Table } from '@/pages/public/layout'
import { A, Block, Checks, CtaBand, Related, Steps, Strong } from './ui'
import { PAGES } from './meta'

const posts = ['/blog/debug-webhooks', '/blog/webhook-signature-verification'] as const

const readTime: Record<(typeof posts)[number], string> = {
  '/blog/debug-webhooks': '9 min read',
  '/blog/webhook-signature-verification': '8 min read',
}

const date = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function BlogIndexPage() {
  return (
    <PublicPage eyebrow="Blog" title="Webhooks and integrations, in practice" intro={PAGES['/blog'].description} crumbs={[['/blog', 'Blog']]}>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((path) => {
          const m = PAGES[path]
          return (
            <Link key={path} to={path} className="group min-w-0 rounded-2xl border border-l-border bg-l-surface p-6 transition hover:-translate-y-0.5 hover:border-[#14b886]/50 md:p-8">
              <div className="text-xs text-l-subtle">
                <time dateTime={m.article!.published}>{date(m.article!.published)}</time> · {readTime[path]}
              </div>
              <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight text-l-text md:text-2xl">{m.title}</h2>
              <p className="mt-2 text-pretty">{m.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-l-accent">
                Read the guide <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          )
        })}
      </div>
      <CtaBand />
    </PublicPage>
  )
}

function Post({ path, eyebrow, children, related }: { path: (typeof posts)[number]; eyebrow: string; children: ReactNode; related: [string, string, string][] }) {
  const m = PAGES[path]
  return (
    <PublicPage
      eyebrow={eyebrow}
      title={m.title}
      intro={m.description}
      crumbs={[['/blog', 'Blog'], [path, eyebrow]]}
      after={
        <div className="mt-5 text-sm text-l-subtle">
          By the Relaya team · <time dateTime={m.article!.published}>{date(m.article!.published)}</time> · {readTime[path]}
        </div>
      }
    >
      <article className="max-w-3xl space-y-12">{children}</article>
      <div className="mt-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-l-text">Keep reading</h2>
        <Related items={related} />
      </div>
      <CtaBand />
    </PublicPage>
  )
}

// ---- How to debug webhooks ------------------------------------------------------------

export function DebugWebhooksPage() {
  return (
    <Post
      path="/blog/debug-webhooks"
      eyebrow="Debugging"
      related={[
        ['/blog/webhook-signature-verification', 'Webhook signature verification, explained', 'How providers sign requests and why verification fails.'],
        ['/integrations/razorpay-webhooks', 'Razorpay webhooks', 'Verify, monitor and replay Razorpay events.'],
        ['/integrations/stripe-webhooks', 'Stripe webhooks', 'Verify, monitor and replay Stripe events.'],
      ]}
    >
      <Block title="Ask four questions, in order">
        <p>
          A webhook "not working" is almost always one of four failures. Debugging goes fastest when you check them in the order the
          request travels, and stop at the first one that fails:
        </p>
        <Steps
          items={[
            <><Strong>Did the provider send it?</Strong> Is the event subscribed, and does the provider's log show a delivery attempt?</>,
            <><Strong>Did it reach your server?</Strong> DNS, TLS, firewalls and redirects can all stop it on the way.</>,
            <><Strong>Did it pass verification?</Strong> A signature mismatch looks like a broken integration from the outside.</>,
            <><Strong>What did your endpoint answer, and what happened next?</Strong> A timeout or a <C>500</C> means retries, duplicates, or a gap.</>,
          ]}
        />
      </Block>

      <Block title="1. Did the provider send it?">
        <p>Start at the source. Every major provider shows recent deliveries for each endpoint, with the response it got back.</p>
        <Checks
          items={[
            <>Is the endpoint subscribed to this <Strong>event type</Strong>? <C>payment.captured</C> and <C>order.paid</C> are separate subscriptions in Razorpay; Stripe and Shopify work the same way.</>,
            <>Is it the right <Strong>mode</Strong>? Test-mode events only go to endpoints registered in test mode, and live to live.</>,
            <>Did the provider <Strong>disable</Strong> the endpoint? After enough consecutive failures, many providers stop sending until you re-enable it.</>,
          ]}
        />
      </Block>

      <Block title="2. Did it reach your server?">
        <p>If the provider shows an attempt but your logs show nothing, the request died in between. Usual causes:</p>
        <Checks
          items={[
            <><Strong>Redirects.</Strong> An <C>http://</C> URL redirected to <C>https://</C>, or a missing trailing slash, turns into a <C>301</C>. Most senders don't follow redirects for a POST, and the ones that do may drop the body. Register the final URL.</>,
            <><Strong>TLS problems.</Strong> An expired certificate or a missing intermediate certificate fails the handshake before your code runs.</>,
            <><Strong>Firewalls and WAFs.</Strong> Bot protection, country blocks and rate limits often catch webhook traffic. Check what your CDN or WAF blocked.</>,
            <><Strong>Body size limits.</Strong> A proxy that rejects bodies over 1 MB will drop large order or invoice payloads with a <C>413</C>.</>,
          ]}
        />
        <p>Send yourself a request to separate "my server is unreachable" from "my code rejects it":</p>
        <Code title="Does the endpoint answer at all?">{`curl -i -X POST https://example.com/webhooks/razorpay \\
  -H "Content-Type: application/json" \\
  -d '{"event":"ping"}'
# Expect a 4xx for the bad signature, NOT a timeout, redirect or HTML error page.`}</Code>
      </Block>

      <Block title="3. Did it pass verification?">
        <p>
          Signature failures are the most common "it worked yesterday" bug. The provider signs the exact bytes it sent; anything that changes
          those bytes, or a different secret, breaks the match.
        </p>
        <Checks
          items={[
            <><Strong>Verify the raw body.</Strong> Frameworks that parse JSON first (Express's <C>express.json()</C>, for example) re-serialise it and the HMAC no longer matches. Read the raw bytes for webhook routes.</>,
            <><Strong>Use the right secret.</Strong> Stripe's is per endpoint (<C>whsec_…</C>) and differs between test and live; Razorpay's is the secret you typed when creating the webhook, not your API key secret.</>,
            <><Strong>Check your clock.</Strong> Stripe and Cashfree sign a timestamp, and receivers reject requests older than a few minutes. A server clock that drifted makes every request look stale.</>,
          ]}
        />
        <p>
          Our <A to="/blog/webhook-signature-verification">guide to signature verification</A> covers each provider's scheme and the
          mistakes in detail.
        </p>
      </Block>

      <Block title="4. What did your endpoint answer?">
        <p>
          Senders treat any non-<C>2xx</C> answer, or no answer within their timeout, as a failure and retry later. That causes two
          different bugs:
        </p>
        <Checks
          items={[
            <><Strong>Timeouts that "succeed".</Strong> Your code finished the work but answered after the sender gave up. The sender retries and you process the event twice. Answer <C>200</C> as soon as the event is stored, and do the slow work in a background job.</>,
            <><Strong>Errors that become gaps.</Strong> A bug that throws a <C>500</C> for one event type fails every retry. When the provider gives up, the event is gone unless you kept a copy.</>,
          ]}
        />
        <p>Make the handler idempotent: record each event ID you have processed, and skip ones you've seen.</p>
        <Code title="An idempotent handler (Node.js)">{`app.post('/webhooks/payments', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verify(req.body, req.headers)) return res.status(400).end()
  const event = JSON.parse(req.body)
  const fresh = await db.insertIgnoreDuplicate('processed_events', { id: event.id })
  if (fresh) await jobs.enqueue('handle-payment', event)   // slow work happens later
  res.status(200).end()                                     // answer fast, every time
})`}</Code>
      </Block>

      <Block title="When the payload itself changed">
        <p>
          Sometimes everything above is fine: the request arrived, verified, and your code answered <C>200</C>, but did the wrong thing. A
          provider renamed a field, made one optional, or sent <C>"amount": "499.00"</C> where it used to send <C>49900</C>. These bugs don't
          throw errors; they quietly write wrong data. The fix is to compare each payload with the shape you depend on, and alert when a
          critical field changes.
        </p>
      </Block>

      <Block title="Recovering the events you missed">
        <Steps
          items={[
            <>Fix the cause first, or the replay fails the same way.</>,
            <>List exactly which events were affected: by type, by time window, by the field that broke.</>,
            <>Resend them with the <Strong>same idempotency key</Strong> they had originally, so anything your endpoint already processed is skipped.</>,
            <>Check that every resend got a <C>2xx</C> before you call it fixed.</>,
          ]}
        />
        <p>
          Providers help to a point: some let you resend single events from their dashboard or list past events through their API. Without a
          record of your own, though, step 2 is guesswork.
        </p>
      </Block>

      <Block title="How Relaya makes this a two-minute job">
        <p>
          Relaya receives your webhooks before your code does, so each of the four questions has an answer on one screen. Every event is
          stored with its headers, payload and signature result. Every forward to your endpoint shows each attempt and the response. Breaking
          payload changes open an incident listing the affected events, and a replay shows exactly what it will resend before it runs.
        </p>
        <Table
          head={['Question', 'Where Relaya answers it']}
          rows={[
            ['Did it arrive?', 'Events: every request, including rejected ones'],
            ['Did it verify?', <>The signature result on each event: <C>valid</C>, <C>invalid</C> or <C>missing</C></>],
            ['What did my endpoint answer?', 'Forwarding: each attempt, status code and response time'],
            ['Did the payload change?', 'Incidents: one per broken field, with every affected event'],
            ['How do I recover?', 'Replay: preview first, same Idempotency-Key on every resend'],
          ]}
        />
      </Block>
    </Post>
  )
}

// ---- Webhook signature verification ----------------------------------------------------

export function SignatureVerificationPage() {
  return (
    <Post
      path="/blog/webhook-signature-verification"
      eyebrow="Security"
      related={[
        ['/blog/debug-webhooks', 'How to debug webhooks', 'A checklist for webhooks that fail or never arrive.'],
        ['/integrations/cashfree-webhooks', 'Cashfree webhooks', 'Verify, monitor and replay Cashfree events.'],
        ['/integrations/shopify-webhooks', 'Shopify webhooks', 'Verify, monitor and replay Shopify events.'],
      ]}
    >
      <Block title="What a signature proves">
        <p>
          Your webhook URL is public. Anyone who finds it can post a fake <C>payment.captured</C> and, if your code believes it, get an order
          for free. A signature proves two things about a request: it came from someone who knows the shared secret, and the body wasn't
          changed on the way.
        </p>
        <p>
          Almost every provider uses <Strong>HMAC-SHA256</Strong>: the sender computes a keyed hash of the body with a secret only you and it
          know, and sends it in a header. You compute the same hash over the bytes you received and compare.
        </p>
      </Block>

      <Block title="How popular providers sign their webhooks">
        <Table
          head={['Provider', 'Header', 'What is signed', 'Encoding']}
          rows={[
            ['Stripe', <C key="s">Stripe-Signature</C>, <><C>{'<timestamp>.<body>'}</C>, timestamp in the header</>, 'hex'],
            ['Razorpay', <C key="r">X-Razorpay-Signature</C>, 'the body', 'hex'],
            ['Shopify', <C key="sh">X-Shopify-Hmac-Sha256</C>, 'the body', 'base64'],
            ['Cashfree', <C key="c">x-webhook-signature</C>, <><C>{'<timestamp><body>'}</C>, timestamp in milliseconds</>, 'base64'],
            ['GitHub', <C key="g">X-Hub-Signature-256</C>, <>the body, prefixed <C>sha256=</C></>, 'hex'],
            ['Standard Webhooks / Svix', <C key="w">webhook-signature</C>, <><C>{'<id>.<timestamp>.<body>'}</C></>, 'base64'],
          ]}
        />
        <p>
          The details differ in exactly the places that cause bugs: which bytes are signed, hex or base64, and whether a timestamp is included.
        </p>
      </Block>

      <Block title="Verifying a signature correctly">
        <p>The same four steps work for every HMAC scheme:</p>
        <Steps
          items={[
            <>Read the <Strong>raw request body</Strong> as bytes, before any JSON parsing.</>,
            <>Build the signed string exactly as the provider documents it (body alone, or timestamp plus body).</>,
            <>Compute HMAC-SHA256 with your secret and encode it the same way (hex or base64).</>,
            <>Compare with a <Strong>constant-time</Strong> function, and check the timestamp if there is one.</>,
          ]}
        />
        <Code title="Verify a Stripe-style signature (Node.js)">{`import crypto from 'node:crypto'

export function verifyStripeStyle(rawBody, header, secret, toleranceSec = 300) {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')))
  const t = Number(parts.t)
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false   // stale or future
  const expected = crypto.createHmac('sha256', secret).update(\`\${t}.\`).update(rawBody).digest('hex')
  const given = Buffer.from(parts.v1 ?? '', 'hex')
  return given.length === 32 && crypto.timingSafeEqual(given, Buffer.from(expected, 'hex'))
}`}</Code>
      </Block>

      <Block title="Five mistakes that break verification">
        <Steps
          items={[
            <><Strong>Hashing parsed JSON.</Strong> <C>JSON.stringify(JSON.parse(body))</C> changes spacing, key order and number formats. Always hash the raw bytes.</>,
            <><Strong>The wrong secret.</Strong> Test and live secrets differ, Stripe has one per endpoint, and Razorpay's webhook secret is not your API key secret.</>,
            <><Strong>Comparing with <C>==</C>.</Strong> An ordinary string comparison stops at the first different character, which leaks timing. Use <C>crypto.timingSafeEqual</C>, <C>hmac.compare_digest</C> or <C>hash_equals</C>.</>,
            <><Strong>Mixing up encodings.</Strong> Comparing a hex digest with a base64 header never matches. Decode both to bytes first.</>,
            <><Strong>Ignoring the timestamp.</Strong> A valid signature on an old request is still an old request. Reject timestamps more than about five minutes away, and drop repeats by event ID.</>,
          ]}
        />
      </Block>

      <Block title="Replays, duplicates and rotating secrets">
        <p>
          A signature stops forgery, not repetition. An attacker who captures one valid request can send it again, and providers themselves
          resend events after timeouts. Keep the IDs of events you've processed and ignore repeats. Providers without a signed timestamp,
          like Razorpay and Shopify, send an event ID header for exactly this.
        </p>
        <p>
          When you rotate a secret, accept both the old and the new one for a short overlap. Stripe makes this easy by sending several{' '}
          <C>v1</C> signatures during a roll; check each one.
        </p>
      </Block>

      <Block title="Or let Relaya verify at the edge">
        <p>
          Relaya implements each provider's scheme (Razorpay, Cashfree, PayU, PhonePe, Stripe, Shopify, GitHub, Slack, HubSpot, Twilio,
          Square, Segment, SendGrid, Notion, Jira, Standard Webhooks and generic HMAC), checks timestamps and drops duplicates. Forged
          requests are rejected and stored as evidence. Your code then verifies one scheme for every provider:
        </p>
        <Code title="Relaya-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of '<t>.<body>'>">{`// The same function as above works: Relaya signs forwarded events the Stripe way,
// with your destination's secret (rsec_…), and adds an Idempotency-Key header
// that stays the same across retries.
verifyStripeStyle(rawBody, req.headers['relaya-signature'], process.env.RELAYA_SECRET)`}</Code>
        <p>
          See the <A to="/docs#receive">docs</A> for SDKs in Node, Python, PHP, Go and Java.
        </p>
      </Block>
    </Post>
  )
}
