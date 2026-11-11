import { CONTACT_EMAIL, TRIAL_DAYS } from '@/pages/landing/landing'

// Question/answer pairs per page: shown on the page and, at build time, written as
// FAQPage structured data by scripts/prerender.mjs. Plain strings only.

export const FAQ: Record<string, [string, string][]> = {
  '/integrations/razorpay-webhooks': [
    ['Which secret does Relaya need for Razorpay?', 'The webhook secret you type when you create the webhook in the Razorpay Dashboard. It is not your API key secret. Relaya encrypts it with a key unique to your organization.'],
    ['Does Relaya stop duplicate Razorpay events?', 'Yes. Razorpay sends the same event ID on every retry (X-Razorpay-Event-Id). Relaya stores the first one and marks later copies as duplicates, so your endpoint handles each event once.'],
    ['What if Razorpay changes a payload field?', 'Relaya learns the shape of each event type. If a field you marked critical goes missing or changes type (say amount arrives as a string), it opens an incident with every affected payment and alerts you.'],
    ['Can I test without a real payment?', 'Yes. Every webhook in Relaya has a "Send a test event" button that sends a sample Razorpay event signed with your own secret, through the same checks as a real one.'],
  ],
  '/integrations/stripe-webhooks': [
    ['Does Relaya check the Stripe-Signature timestamp?', 'Yes. The timestamp in the t= part must be within 5 minutes of the time Relaya receives the request; anything older or future-dated is rejected and kept as evidence. All v1 signatures in the header are tried, so a secret roll works.'],
    ['Which Stripe secret do I enter?', 'The signing secret of the webhook endpoint (whsec_…), shown after you add the endpoint in the Stripe Dashboard. Not your API key.'],
    ['Will my code receive Stripe events twice?', 'Relaya drops repeats of the same event ID before forwarding. Each forwarded request also carries an Idempotency-Key that stays the same across Relaya’s own retries, so your handler can ignore anything it has already processed.'],
    ['Can I keep using Stripe’s official libraries?', 'Your endpoint receives the original body and a Relaya-Signature header to verify instead of Stripe’s. Verification is a few lines of HMAC code in any language, or use the Relaya SDKs for Node, Python, PHP, Go and Java.'],
  ],
  '/integrations/shopify-webhooks': [
    ['Does Shopify send webhooks more than once?', 'It can, for example after a timeout. Relaya keeps the first delivery of each X-Shopify-Event-Id (or webhook ID) and marks the rest as duplicates, so your services process each order once.'],
    ['Can one Shopify webhook feed several systems?', 'Yes. Add several destinations, say your order service and your warehouse system; each receives every event, signed by Relaya, with its own retries and health.'],
    ['What happens to forged Shopify requests?', 'A request whose HMAC doesn’t match is rejected and stored as evidence, never forwarded. The overview shows signature failures per webhook, and you can be alerted when they start.'],
    ['Does it work for public and custom apps?', 'Yes. Use the API secret key of the app that registered the webhook, or for webhooks created in the admin, the signing key Shopify shows there.'],
  ],
  '/integrations/cashfree-webhooks': [
    ['Which Cashfree key signs webhooks?', 'Your Payment Gateway secret key (the client secret you use with the API). Enter it in Relaya; it is encrypted at rest with a key unique to your organization.'],
    ['Does Relaya support Cashfree’s idempotency header?', 'Yes. With webhook version 2025-01-01 and later Cashfree sends x-idempotency-key, and Relaya uses it to drop repeats. For older versions it falls back to a hash of the payload, since retries resend the same body.'],
    ['Are timestamps in seconds or milliseconds?', 'Cashfree sends milliseconds. Relaya accepts both and rejects requests more than 5 minutes old or in the future.'],
    ['Does Relaya also support Razorpay, PayU and PhonePe?', 'Yes, all three, plus Stripe, Shopify and more than ten other providers, so all your payment webhooks are checked and recorded in one place.'],
  ],
  '/integrations/whatsapp-webhooks': [
    ['Does Relaya support WhatsApp webhooks today?', 'Not as a built-in provider yet. WhatsApp needs a GET verification handshake before Meta will send events, which Relaya’s ingest doesn’t answer yet. We build it as a custom integration for teams that need it now; tell us and we’ll give you a date.'],
    ['How does WhatsApp sign its webhooks?', 'Meta sends an X-Hub-Signature-256 header: "sha256=" followed by the hex HMAC-SHA256 of the raw body, keyed with your Meta app secret.'],
    ['What is the hub.challenge?', 'When you register a callback URL, Meta sends a GET request with hub.mode=subscribe, hub.verify_token and hub.challenge. Your endpoint must check the verify token and answer with the challenge value; only then are events delivered.'],
  ],
  '/vs/hookdeck': [
    ['Is Relaya a Hookdeck alternative?', 'For receiving webhooks, yes: both verify, record and forward events with retries. Relaya adds payload contracts, incidents with affected events, previewed replay and native Indian payment providers; Hookdeck focuses on a managed event gateway and developer tooling.'],
    ['Can I move from Hookdeck to Relaya without downtime?', 'Yes. Create the webhook in Relaya, add your endpoint as a destination, then switch the provider’s webhook URL. Most providers let you run two endpoints side by side while you check that events arrive.'],
    ['Does Relaya have a CLI for local development?', 'Yes. The Relaya CLI receives your webhook’s events on your own computer, and every webhook has a “Send a test event” button that signs a sample with your own secret.'],
  ],
  '/vs/svix': [
    ['Is Relaya a Svix alternative?', 'Partly. If you send webhooks to your customers at modest scale, Relaya’s outbound webhooks and customer portal cover that. If sending webhooks at large scale is your core need, Svix is purpose-built for it. For webhooks you receive, Relaya is the better fit.'],
    ['Can Relaya receive webhooks sent through Svix?', 'Yes. Pick the Standard Webhooks provider and paste the sender’s whsec_ secret. Relaya checks the webhook-id, webhook-timestamp and webhook-signature headers (or their svix- equivalents).'],
    ['Does Relaya follow Standard Webhooks?', 'For webhooks you send to your customers through Relaya, yes: they are signed the Standard Webhooks way (webhook-id, webhook-timestamp, webhook-signature), so your customers can verify them with any Standard Webhooks or Svix library. Events Relaya forwards to your own endpoints carry a Relaya-Signature header and an Idempotency-Key.'],
  ],
  '/pricing': [
    ['Is there a free plan?', `There is a ${TRIAL_DAYS}-day free trial of the Team plan instead. A card is required; you're charged when the trial ends, and if you cancel before then you pay nothing.`],
    ['How do I get a price?', `Email ${CONTACT_EMAIL} with roughly how many webhooks and events a month you expect. We'll send a quote for the plan that fits.`],
    ['What is the design partner programme?', 'Early teams that give us regular product feedback get 50% off any plan for 12 months. Ask about it when you write to us.'],
    ['How long are events kept?', 'The Team plan keeps 30 days of event history. If you need longer retention, tell us when you ask for a quote.'],
    ['Can you build an integration we need?', 'Yes. Custom integrations are built by our team on the Relaya connector standard, usually in 1 to 3 weeks, and they are free if they become part of the public catalog. Enterprise includes one custom connector every quarter.'],
    ['Can we change plans later?', 'Yes. Plans include new features as they launch, and you can move up or down as your integrations grow.'],
  ],
  '/custom-integrations': [
    ['How long does a custom integration take?', 'Usually 1 to 3 weeks, depending on the system and how good its API is. We give you a date before we start.'],
    ['What does it cost?', `It's free if the integration becomes part of the public catalog, so other customers can use it too. Enterprise includes one custom connector every quarter. Otherwise we quote it; email ${CONTACT_EMAIL}.`],
    ['Who maintains it?', 'We do. When the other system changes its API, we update the connector, and Relaya’s contract checks catch payload changes in the meantime.'],
    ['What if the system has no webhooks or API?', 'Tell us anyway. Some systems, like Tally, need a small agent on your side; we’ll say up front what that involves.'],
  ],
}
