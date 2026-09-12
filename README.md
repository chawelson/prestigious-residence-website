# Prestigious Residence — Website & Marketing Guide

## Sales-system readiness

The website now captures the details needed to qualify a property enquiry: unit interest, buying purpose, purchase timeline, preferred next step, contact details, landing URL and UTM campaign attribution. Form submissions currently go to Formspree; WhatsApp clicks and successful form submissions emit analytics events when GA4 or Meta Pixel is configured.

To complete the website → CRM → follow-up loop, connect the existing Formspree form to an n8n webhook and map each submission into Odoo CRM. Recommended stages are `New enquiry`, `Contacted`, `Qualified`, `Viewing booked`, `Offer/booking`, `Won` and `Lost`. Treat `purchase_timeline=0-30-days` or `preferred_next_step=site-visit` as hot-lead signals and notify the assigned salesperson immediately.

Campaign links should use UTMs, for example:

`https://www.prestigiousresidence.co.ke/?utm_source=facebook&utm_medium=paid-social&utm_campaign=studio-investors&utm_content=video-a`

Before paid campaigns, configure the real GA4 measurement ID and Meta Pixel ID in `index.html`, verify the Formspree recipient, connect the Formspree → n8n → Odoo workflow, and submit `https://www.prestigiousresidence.co.ke/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## 🚀 Deploy to Vercel (3 steps)

1. **Create a GitHub repo** and push this folder
   ```bash
   git init
   git add .
   git commit -m "Initial website"
   git remote add origin https://github.com/YOUR_USERNAME/prestigious-residence.git
   git push -u origin main
   ```

2. **Go to vercel.com** → New Project → Import from GitHub → Select repo → Deploy

3. **Custom domain** (optional): In Vercel dashboard → Settings → Domains → Add `prestigiousresidence.co.ke`

---

## ✅ Pre-Launch Checklist

- [ ] Replace phone number `+254 700 000 000` in index.html (2 places)
- [ ] Replace email `info@prestigiousresidence.co.ke`
- [ ] Update WhatsApp link with real number
- [ ] Confirm Google Maps embed shows correct pin
- [ ] Test contact form (connect to Formspree or Netlify Forms if needed)

---

## 📱 Marketing Strategy

### WhatsApp (Highest ROI for Kenyan market)
- Create a **WhatsApp Business** account for Prestigious Residence
- Set up automated greeting message with pricing summary
- Broadcast list: send unit updates to warm leads
- Share individual unit images with caption + price (ready-made from your brochure)

### Facebook & Instagram
- **Post daily** during sales push:
  - Day 1: Hero exterior render + "Now Selling" announcement
  - Day 2: Studio floorplan + "Own from KES 1.75M"
  - Day 3: Location video (Garden City visible) + "5 minutes from everywhere"
  - Day 4: Payment plan breakdown graphic
  - Day 5: Construction update photo (15th floor)
  - Repeat with different units
- **Run Facebook Lead Ads** targeting:
  - Nairobi, age 28–55
  - Interests: Real estate, investment, home ownership, KCB, Equity Bank
  - Budget: KES 500–1,000/day
  - Lead form collects: Name, Phone, Unit of interest

### Google
- Register on **Google Business Profile** (free): "Prestigious Residence" with the Safari Park address
- This shows your project when people search "apartments Safari Park" or "apartments near Garden City"

### LinkedIn
- Post for diaspora investors and corporate buyers
- "Prime Nairobi apartments — investment with 20% projected capital gains"

---

## 📊 Lead Management
Connect your contact form to a free service:
- **Formspree** (formspree.io) — replace form action with your Formspree endpoint
- **Google Sheets** via Make.com or Zapier — auto-log every enquiry
- Follow up every lead within 2 hours via WhatsApp

---

## 🔧 Form Setup (Formspree)
Replace the form tag in index.html:
```html
<form class="contact-form" action="https://formspree.io/f/YOUR_ID" method="POST">
```
Remove the `onsubmit="handleSubmit(event)"` attribute and the JS function.
