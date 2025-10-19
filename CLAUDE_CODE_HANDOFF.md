# Sovereign Path LLC - Claude Code Development Handoff

## Project Overview

**Owner:** Dylan Heiney (Dylan Michael Heiney)  
**Business:** Sovereign Path LLC  
**Email:** dylan@sovereigntytracker.com  
**Repository:** `sovereignty-portfolio`  
**Live Site:** https://sovereigntytracker.com  
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Vercel  
**Current Status:** Consulting site live with lead magnet system operational

**CRITICAL: The owner's name is Dylan Heiney (NOT Hennessy). The business is Sovereign Path LLC (NOT Sovereign Systems).**

---

## What's Complete ✅

### Core Infrastructure
- ✅ Next.js 15 portfolio/consulting website deployed on Vercel
- ✅ GitHub repo connected with auto-deploy on push
- ✅ Custom domain configured (sovereigntytracker.com)
- ✅ Environment variables configured in Vercel
- ✅ Mailchimp integration for lead capture

### Pages & Features
- ✅ Home page with dual-path navigation (Consulting vs Sovereignty Path)
- ✅ `/consulting` - Complete consulting services page with case studies, pricing, FAQ
- ✅ `/resources/spreadsheets` - Lead magnet landing page for "10 Signs You've Outgrown Spreadsheets"
- ✅ `/resources/ai-guide` - Lead magnet landing page for "The CFO's Guide to AI"
- ✅ Lead capture forms with Mailchimp API integration
- ✅ Automatic PDF downloads on form submission
- ✅ Contact form with Mailgun email delivery

### Email Marketing
- ✅ Two 5-email autoresponder sequences in Mailchimp
- ✅ Tag-based automation (Day 0, +1, +3, +7, +14)
- ✅ Lead magnets delivered automatically via download

---

## Current Architecture

### File Structure
```
sovereignty-portfolio/
├── app/
│   ├── api/
│   │   ├── contact/route.ts           # Contact form handler (Mailgun)
│   │   └── lead-magnet/route.ts       # Lead capture handler (Mailchimp)
│   ├── components/
│   │   └── LeadMagnetCapture.tsx      # Email capture form component
│   ├── consulting/
│   │   └── page.tsx                   # Main consulting page
│   ├── resources/
│   │   └── [slug]/page.tsx            # Dynamic lead magnet pages
│   ├── layout.tsx
│   └── page.tsx                       # Home page (dual-path)
├── public/
│   └── downloads/
│       ├── 10-signs-outgrown-spreadsheets.pdf
│       └── cfo-guide-to-ai.pdf
├── .env.local                         # Local environment variables
└── package.json
```

### Environment Variables
```bash
# Email (Mailgun)
MAILGUN_API_KEY=***
MAILGUN_DOMAIN=***
CONTACT_EMAIL=dylan@sovereigntytracker.com

# Lead Magnets (Mailchimp)
MAILCHIMP_API_KEY=***
MAILCHIMP_SERVER_PREFIX=us17
MAILCHIMP_AUDIENCE_ID=***

# AI (for future features)
OPENAI_API_KEY=***
```

### Key Components

**LeadMagnetCapture.tsx**
- Handles form submission for both lead magnets
- Integrates with Mailchimp API
- Triggers PDF download on success
- Props: `type: 'spreadsheets' | 'ai-guide'`

**API Routes**
- `/api/contact` - Sends contact form emails via Mailgun
- `/api/lead-magnet` - Adds subscribers to Mailchimp with appropriate tags

---

## FIRST PRIORITY: Branding & Name Audit

### Task: Find and Replace All Incorrect Names/Branding

**CRITICAL TASK - DO THIS FIRST BEFORE ANY OTHER WORK**

The codebase may contain incorrect names from early development. We need to ensure consistency everywhere.

**Correct Information:**
- ✅ Owner: **Dylan Heiney** (Dylan Michael Heiney)
- ✅ Company: **Sovereign Path LLC**
- ✅ Email: **dylan@sovereigntytracker.com**
- ✅ Website: **sovereigntytracker.com**

**Incorrect Information to Find & Replace:**
- ❌ "Hennessy" → Replace with "Heiney"
- ❌ "Sovereign Systems" → Replace with "Sovereign Path"
- ❌ "Sovereignty Tracker" (as company name) → Replace with "Sovereign Path LLC"

**Files to Audit:**

1. **All Page Components:**
   - `app/page.tsx` (home page)
   - `app/consulting/page.tsx` (consulting page - check footer, about section, contact info)
   - `app/resources/[slug]/page.tsx` (lead magnet pages - check footers)
   - `app/layout.tsx` (global metadata, if any)

2. **All Components:**
   - `app/components/LeadMagnetCapture.tsx` (check success messages, any text)
   - Any other components in `app/components/`

3. **API Routes:**
   - `app/api/contact/route.ts` (check email content/headers)
   - `app/api/lead-magnet/route.ts` (check any logging or error messages)

4. **Configuration Files:**
   - `package.json` (check name, author)
   - `next.config.js` (if it has any metadata)
   - `README.md` (if it exists)

5. **Public Assets:**
   - `public/downloads/` PDFs (file names and content)
   - Any images with text overlays

**Search Commands:**

```bash
# Find all instances of "Hennessy"
grep -r "Hennessy" app/
grep -r "Hennessy" public/

# Find all instances of "Sovereign Systems"
grep -r "Sovereign Systems" app/

# Find instances of "Sovereignty Tracker" used as company name
grep -r "Sovereignty Tracker" app/
```

**Specific Replacements Needed:**

1. **Footer (appears on multiple pages):**
```tsx
// WRONG:
© 2025 Sovereignty Tracker

// CORRECT:
© 2025 Sovereign Path LLC
```

2. **About/Bio Sections:**
```tsx
// WRONG:
Dylan Hennessy specializes in...
// or
Founder of Sovereign Systems

// CORRECT:
Dylan Heiney specializes in...
Founder, Sovereign Path LLC
```

3. **Email Signatures/Sign-offs:**
```tsx
// WRONG:
Dylan Hennessy
Sovereign Systems LLC

// CORRECT:
Dylan Heiney
Sovereign Path LLC
dylan@sovereigntytracker.com
```

4. **Contact Information:**
```tsx
// Ensure all contact forms and info show:
Dylan Heiney
dylan@sovereigntytracker.com
Sovereign Path LLC
```

5. **Meta Tags/SEO:**
```tsx
// Check for author names in metadata
export const metadata = {
  title: '...',
  description: '...',
  authors: [{ name: 'Dylan Heiney' }], // NOT Hennessy
}
```

**Verification Checklist:**
```
[ ] Search entire codebase for "Hennessy" - should return 0 results
[ ] Search entire codebase for "Sovereign Systems" - should return 0 results  
[ ] Footer on home page shows "© 2025 Sovereign Path LLC"
[ ] Footer on consulting page shows "© 2025 Sovereign Path LLC"
[ ] Footer on lead magnet pages shows "© 2025 Sovereign Path LLC"
[ ] About section shows "Dylan Heiney"
[ ] Contact form confirmation shows "Dylan Heiney"
[ ] All email-related content shows "dylan@sovereigntytracker.com"
[ ] Package.json author field shows "Dylan Heiney"
[ ] Any bio/about sections mention "Sovereign Path LLC"
```

**After Completing Audit:**
```bash
# Test build
npm run build

# Commit changes
git add .
git commit -m "Fix branding: Update all instances to Dylan Heiney and Sovereign Path LLC"
git push

# Verify on live site after deployment
```

---

## What's Next - Priority Roadmap

### Phase 1: Immediate (Next 1-2 weeks)

#### 1. Create Actual PDF Content
**Status:** PDFs exist but need polishing  
**Location:** `public/downloads/`

**Tasks:**
- [ ] Convert "10 Signs You've Outgrown Spreadsheets" markdown to professional PDF (Canva/Google Docs)
- [ ] Convert "The CFO's Guide to AI" markdown to professional PDF
- [ ] Include branding, contact info, CTAs in PDFs
- [ ] Add page numbers and professional formatting
- [ ] Replace placeholder PDFs with final versions

**Content Sources:**
- Markdown content is in project knowledge artifacts
- Use brand colors: Orange #f97316, Slate backgrounds
- Include CTA on final page to book discovery call

---

#### 2. Record Introduction Video
**Status:** Placeholder on consulting page  
**Location:** `/consulting` - "Meet Dylan" section

**Requirements:**
- 30-60 second personal introduction
- Who I help (CFOs, finance leaders, organizations)
- How I work differently (AI-accelerated, transparent, fast)
- Philosophy (sovereignty through systematic clarity)
- Upload to Loom or YouTube
- Embed in consulting page

**Implementation:**
```tsx
// Replace placeholder in app/consulting/page.tsx
<div className="bg-slate-900 p-8 rounded-lg border border-slate-700 my-8 text-center">
  <h3 className="text-2xl font-bold mb-4 text-orange-500">Meet Dylan</h3>
  <div className="aspect-video">
    <iframe 
      src="YOUR_VIDEO_EMBED_URL"
      className="w-full h-full rounded-lg"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
</div>
```

---

#### 3. Add Calendar Booking Integration
**Status:** Not implemented  
**Tool:** Calendly or Cal.com

**Tasks:**
- [ ] Set up Calendly account
- [ ] Create "30-Minute Discovery Call" event type
- [ ] Get embed code or link
- [ ] Replace placeholder calendar links in:
  - Consulting page CTAs
  - Email autoresponder sequences (all 10 emails)
  - Lead magnet success messages

**Implementation:**
```tsx
// Option 1: Inline embed
<div className="calendly-inline-widget" 
     data-url="https://calendly.com/your-link"
     style={{ minWidth: '320px', height: '630px' }}
/>
<script src="https://assets.calendly.com/assets/external/widget.js" async />

// Option 2: Popup link
<a href="https://calendly.com/your-link" 
   target="_blank" 
   className="calendly-button">
  Schedule Discovery Call
</a>
```

---

### Phase 2: Content & SEO (Weeks 2-4)

#### 4. Blog/Content Section
**Status:** Not started  
**Purpose:** SEO, thought leadership, lead generation

**Recommended Structure:**
```
app/
└── blog/
    ├── page.tsx                 # Blog index/list
    ├── [slug]/
    │   └── page.tsx            # Individual blog post
    └── posts/
        ├── metadata.json        # Post metadata
        └── *.mdx               # Blog posts as MDX files
```

**First 5-10 Posts:**
1. "10 Signs You've Outgrown Spreadsheets" (expand on lead magnet)
2. "The CFO's Guide to AI" (expand on lead magnet)
3. "How We Built Summit's Financial Reporting System in 6 Weeks"
4. "AI-Accelerated Consulting: 10x Faster, 90% Lower Cost"
5. "The Sovereignty Manifesto: Why Personal Freedom Starts With Data"
6. "Power BI vs Custom Development: Decision Framework"
7. "The Hidden Cost of Manual Financial Reporting"
8. "How to Evaluate AI Vendors (Without Getting Burned)"
9. "Building The Sovereignty Path: A Technical Deep Dive"
10. "What Happens When Your Spreadsheets Break? (Real Stories)"

**SEO Keywords to Target:**
- "Power BI consulting"
- "Financial reporting automation"
- "AI consultant for finance"
- "CFO AI guide"
- "Spreadsheet automation"
- "Custom financial dashboards"

---

#### 5. Get Summit Testimonial
**Status:** No client testimonials on site yet  
**Contact:** Jennifer Allen (VP Finance) or Jim Housley (CFO)

**Request:**
"Would you be comfortable providing a 2-3 sentence testimonial about our work together? Specifically around:
- Time saved
- Quality of deliverables
- Value delivered
- Working relationship"

**Placement:**
- Consulting page (Case Studies section)
- Home page (social proof)
- Lead magnet landing pages (trust building)

---

### Phase 3: Advanced Features (Weeks 4-8)

#### 6. Sovereignty Score Calculator Widget
**Status:** Concept only  
**Purpose:** Interactive lead magnet on home page

**User Flow:**
1. User answers 5-10 quick questions about their habits
2. JavaScript calculates preliminary sovereignty score
3. Shows result with breakdown
4. CTA: "Get your full sovereignty analysis" → Capture email
5. Redirect to Sovereignty Path product (future)

**Implementation:**
```tsx
// app/components/SovereigntyScoreCalculator.tsx
export default function SovereigntyScoreCalculator() {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  
  // 5-10 questions about daily habits
  // Calculate score based on answers
  // Show result + CTA to full product
}
```

---

#### 7. ROI Calculator Tool
**Status:** Not started  
**Purpose:** Interactive sales tool for consulting page

**User Input:**
- Hours/month spent on manual reporting
- Number of team members involved
- Average hourly rate
- Frequency of errors/rework

**Output:**
- Annual cost of current process
- Projected savings with automation
- Payback period for typical project
- CTA to book discovery call

**Placement:** Consulting page, below case studies

---

#### 8. Migrate Sovereignty Path App to Next.js
**Status:** Separate Streamlit app, not integrated  
**Long-term Goal:** Unified codebase and user experience

**Current Sovereignty Path Stack:**
- Python backend (DuckDB database)
- Streamlit frontend
- Single-user deployment
- 6 specialized paths with scoring engine
- Bitcoin API integration
- Meal planning system

**Migration Strategy:**
1. **Keep Python backend** - Convert to FastAPI
2. **Rebuild UI in Next.js** - Reuse business logic
3. **Add Supabase** for multi-user support
4. **Stripe integration** for monetization
5. **Unified domain** - sovereigntytracker.com/app

**Why Migrate:**
- Better UX/mobile experience
- Unified authentication
- Easier monetization
- Professional appearance
- Shared components with consulting site

---

## Technical Guidelines for Claude Code

### Code Style & Conventions

**TypeScript:**
- Use strict mode
- Explicit types for all props and state
- No `any` types unless absolutely necessary
- React functional components only

**Tailwind CSS:**
- Use utility classes (no custom CSS unless necessary)
- Consistent color scheme: Orange (#f97316), Slate backgrounds
- Mobile-first responsive design
- Dark mode default (slate-900 background)

**Component Structure:**
```tsx
"use client"  // Only when needed (forms, state)

import React, { useState } from 'react';
import { Icon } from 'lucide-react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<string>('');
  
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
}
```

**File Naming:**
- Components: PascalCase (`LeadMagnetCapture.tsx`)
- Pages: lowercase (`page.tsx`, `route.ts`)
- Utilities: camelCase (`utils.ts`)

---

### Testing Before Push

**Pre-Deploy Checklist:**
```bash
# 1. Build locally
npm run build

# 2. Check for TypeScript errors
npm run type-check

# 3. Test forms
# - Contact form
# - Lead magnet forms (both)
# - Verify emails send
# - Check downloads work

# 4. Test on mobile
# - Responsive design
# - Touch targets
# - Form usability

# 5. Commit and push
git add .
git commit -m "Descriptive message"
git push

# 6. Monitor Vercel deployment
# Check build logs for errors
```

---

### Common Patterns

**API Route Error Handling:**
```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await externalAPI(data);
    
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Form Submission:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Success handling
    } else {
      setError('Something went wrong');
    }
  } catch (error) {
    console.error('Error:', error);
    setError('Failed to submit');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Key Philosophy & Brand Guidelines

### Core Principles
1. **Sovereignty First** - Everything connects back to personal/organizational autonomy
2. **Transparency** - No hidden costs, clear processes, honest timelines
3. **AI as Leverage** - Position AI as force multiplier, not replacement
4. **Complexity is the Enemy** - Simplify, clarify, systematize
5. **Results Over Hype** - Show real case studies, specific numbers

### Voice & Tone
- **Direct but not cold** - Professional yet personable
- **Confident but honest** - "I don't know" is acceptable
- **Technical but accessible** - Explain complex topics clearly
- **Philosophical but practical** - Connect big ideas to daily action

### Design Principles
- **Dark mode default** - Slate backgrounds, high contrast
- **Orange accents** - Primary CTA color #f97316
- **Clean typography** - Sans-serif, readable sizes
- **Generous spacing** - Don't cram content
- **Mobile-first** - Test on small screens

---

## Resources & References

### Project Documentation
- Lead Magnet Implementation Guide (in project knowledge)
- Email Auto-Responder Sequences (10 emails written)
- Consulting Page Content (case studies, pricing, FAQ)
- Sovereignty Path Overview (6 paths, scoring system)

### External Tools
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/YOUR_USERNAME/sovereignty-portfolio
- **Mailchimp:** Audience management and automations
- **Mailgun:** Transactional emails

### Design References
- Current live site: https://sovereigntytracker.com
- Color palette: Orange #f97316, Slate 900-100
- Icons: Lucide React

---

## Quick Start for Claude Code

1. **Clone and setup:**
```bash
git clone https://github.com/YOUR_USERNAME/sovereignty-portfolio.git
cd sovereignty-portfolio
npm install
```

2. **Environment variables:**
Copy `.env.local.example` (if exists) or create `.env.local` with the variables listed above.

3. **Run development server:**
```bash
npm run dev
# Open http://localhost:3000
```

4. **Make changes, test, deploy:**
```bash
git add .
git commit -m "Description"
git push
# Vercel auto-deploys
```

---

## Current Priorities (In Order)

1. ⭐ **Record intro video** (30-60 sec) and add to consulting page
2. ⭐ **Polish PDFs** for lead magnets (professional design)
3. ⭐ **Set up Calendly** and replace all placeholder links
4. **Get Summit testimonial** and add to site
5. **Create blog section** with first 3-5 posts
6. **Build sovereignty score calculator** widget
7. **Add ROI calculator** to consulting page
8. **Plan Sovereignty Path migration** to Next.js

---

## Notes for Development

- **No breaking changes to existing pages** - Consulting site is live and working
- **Test email integrations carefully** - Don't spam real subscribers
- **Mobile responsiveness is critical** - Most users on mobile
- **Keep load times fast** - Optimize images, minimize JS
- **Accessibility matters** - Use semantic HTML, proper contrast
- **SEO optimization** - Meta tags, headings, alt text

---

## Support & Questions

**If you need clarification:**
- Check project knowledge in Claude chat history
- Review live site for current implementation
- Ask Dylan (dylan@sovereigntytracker.com)

**Common gotchas:**
- Mailchimp server prefix must match API key suffix
- Environment variables need to be set in Vercel AND locally
- Next.js Link component required for internal navigation
- Apostrophes must be escaped in JSX (`&apos;`)

---

*"Sovereignty is measured not by what you own, but by how long you can say no."*

**Let's build systems that give people that freedom.** 🚀