# Prestigious Residence — website

A static HTML/CSS/JavaScript website deployed through the existing GitHub → Vercel integration.

## Current enquiry flow

- Step 1: home of interest, name and phone (required).
- Step 2: purpose, timeline, preferred next step, email and message (optional).
- Unit-card links preselect the matching home; back navigation preserves entries.
- Nothing is sent until the final submit. Formspree remains the delivery service.
- Validation, pending, accepted, failure and timeout states are implemented. Repeated clicks are blocked while a request is pending and after it is accepted. A timeout is an unknown delivery outcome, not a guaranteed failure; the UI advises checking with sales before retrying.
- UTM source/medium/campaign/content are included with the submission. The source URL excludes query strings and fragments. Attribution is restored for a new enquiry.
- Optional analytics hooks never receive contact details and cannot turn an accepted enquiry into a reported failure. Actual analytics IDs remain unconfigured.
- JavaScript-off fallback shows both form sections and all unit layouts; a valid submission navigates to Formspree.

## Design and accessibility

The existing navy/gold/cream identity and static architecture are preserved. Refinements live in `assets/refinements.css` and `assets/site.js`.

Category controls wrap without scrollbars and support Arrow keys, Home and End. The mobile menu is a native modal dialog with focus containment and Escape dismissal; closed links are not exposed. FAQ answers use real hidden states. Content is visible without waiting for scroll animations, and reduced-motion preferences are respected. All form controls have explicit labels and error associations.

## Content integrity / owner actions

- Prices, sizes and payment terms originate from the existing listing; they are **not independently verified current availability**.
- The advertised October 2026 date is clearly labelled a target requiring confirmation.
- Exterior imagery and floor plans are labelled architectural illustrations, not dated site progress.
- Studio variants are identified by size and price because the embedded brochure labels conflict with the prior Type B/Type C web labels.
- Unsupported capital-gain projections were replaced with a payment comparison: (listed price − 20% deposit) ÷ 24, rounded. Booking fees and other charges are explicitly excluded from these illustrations.
- No developer identity, approvals, completed-project evidence, testimonials, occupancy figures or dated construction photos have been invented.
- Obtain the developer's legal identity, approved project documents, current dated photos, current unit availability and written full payment terms to add real proof next.
- No identity-document uploads or payments are collected through this form.

## Local verification (no dependencies)

```bash
node --test tests/source.test.mjs
node scripts/preview-server.mjs 4174
```

Open `http://localhost:4174/__qa` to inspect the actual page at 320, 390, 768, 1024 and 1440px iframe viewports. The display can scale to fit the browser; the page's internal CSS viewport remains the selected size.

The local preview **replaces the form action with a local simulated endpoint**, with success/error/timeout modes. It never forwards submissions or saves contact data. Test files are excluded from Vercel uploads via `.vercelignore`. Never use the public contact form for automated fixture sends.

## Deployment

Keep the existing Vercel project and custom domain. A feature branch gets a preview; merge reviewed changes to `main` for production. Do not migrate hosting or introduce a framework for these refinements.

Production: https://www.prestigiousresidence.co.ke/

## Integrations still to configure

Formspree inbox delivery, GA4/Meta IDs, consent handling for any future advertising trackers, and Formspree → n8n → Odoo remain separate integration work. The website does not claim CRM acceptance, sales-team notification, an automatic brochure delivery or a confirmed appointment merely because Formspree accepted a submission.

Suggested Odoo stages: New enquiry → Contacted → Qualified → Viewing booked → Offer/booking → Won/Lost. Use stated buyer timing and viewing interest as signals to review, not proof of purchase readiness.
