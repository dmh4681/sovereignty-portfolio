"use client"

import React, { useState } from 'react';
import { MessageCircle, X, Send, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BusinessAdvisorWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi, I'm your Business Intelligence Advisor. I've reviewed Dylan's consulting work - including his Power BI expertise with Summit Education Group and custom application development.\n\nI can help you understand:\n• If his skillset matches your challenge\n• Expected ROI and timeline\n• Project approach and engagement structure\n\nWhat brings you here today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    { icon: TrendingUp, text: "Do I need Power BI or something custom?", category: "technical" },
    { icon: DollarSign, text: "What's the typical ROI on these projects?", category: "business" },
    { icon: Clock, text: "How long does a project take?", category: "timeline" },
    { icon: Zap, text: "Tell me about the Summit case study", category: "case-study" }
  ];

  const getResponse = (userMessage: string, conversationHistory: Message[]): string => {
    const lower = userMessage.toLowerCase();
    
    // Get the full conversation context (last 4 exchanges)
    const recentUserMessages = conversationHistory
      .filter(m => m.role === 'user')
      .slice(-4)
      .map(m => m.content.toLowerCase())
      .join(' ');

    const recentAssistantMessages = conversationHistory
      .filter(m => m.role === 'assistant')
      .slice(-2)
      .map(m => m.content.toLowerCase())
      .join(' ');

    // Detect if user is answering questions we just asked
    const isAnsweringOurQuestion = (
      (recentAssistantMessages.includes('tech stack') && lower.length < 100 && (lower.includes('netsuite') || lower.includes('salesforce') || lower.includes('quickbooks') || lower.includes('google'))) ||
      (recentAssistantMessages.includes('who would be using') && (lower.includes('finance') || lower.includes('accounting') || lower.includes('team') || lower.includes('department'))) ||
      (recentAssistantMessages.includes('challenge') && (lower.includes('manual') || lower.includes('silo') || lower.includes('acquisition') || lower.includes('consolidation')))
    );

    // Build up context from their answers
    const mentionedTech: string[] = [];
    const techTerms = ['netsuite', 'salesforce', 'quickbooks', 'google analytics', 'tableau', 'excel', 'power bi', 'recurly', 'stripe'];
    techTerms.forEach(term => {
      if (recentUserMessages.includes(term)) mentionedTech.push(term);
    });

    const mentionedChallenges: string[] = [];
    if (recentUserMessages.includes('manual')) mentionedChallenges.push('manual reporting');
    if (recentUserMessages.includes('silo') || recentUserMessages.includes('scattered')) mentionedChallenges.push('data silos');
    if (recentUserMessages.includes('slow') || recentUserMessages.includes('lag')) mentionedChallenges.push('slow decisions');
    if (recentUserMessages.includes('acquisition') || recentUserMessages.includes('multi-entity')) mentionedChallenges.push('acquisition complexity');
    if (recentUserMessages.includes('consolidat')) mentionedChallenges.push('consolidation pain');

    const users = recentUserMessages.includes('finance') || recentUserMessages.includes('accounting') ? 'Finance & Accounting team' : null;

    // If they just answered our questions and we have good context, synthesize it
    if (isAnsweringOurQuestion && mentionedTech.length > 0 && mentionedChallenges.length > 0) {
      return `**Perfect - I have a clear picture now.**\n\n**Your Situation:**\n• **Systems:** ${mentionedTech.join(', ')}\n• **Challenges:** ${mentionedChallenges.join(', ')}\n${users ? `• **Users:** ${users}\n` : ''}\n**This is exactly what Dylan specializes in.** Your situation is very similar to Summit Education Group:\n\n**Summit's Challenge:**\n• Multi-acquisition org with QuickBooks, Salesforce, Recurly, Teachable\n• 40+ hours/month on manual consolidation\n• Finance team drowning in spreadsheets\n• No real-time visibility for decision-making\n\n**Dylan's Solution:**\n• Unified dimensional data model (star schema)\n• Power BI dashboards with automated refresh\n• Real-time executive + operational views\n• Scalable for future acquisitions\n\n**Results:** <2 month ROI payback, 40 hrs/month saved\n\n**For Your Situation:**\n\n**Recommended Approach:**\n1️⃣ **Discovery Week** - Audit your ${mentionedTech.slice(0,2).join(' & ')} data\n2️⃣ **Design Week** - Unified data model + dashboard sketches  \n3️⃣ **Build (2-3 weeks)** - Core dashboards with weekly check-ins\n4️⃣ **Handoff** - Train your ${users || 'team'}, full documentation\n\n**Timeline:** 4-6 weeks\n**Investment:** $10,000-15,000 range\n**ROI:** If you're spending 20+ hours/month on manual work, payback in 3-4 months\n\n**Next Step:** Free 30-min discovery call with Dylan to:\n• Review your specific data sources\n• See dashboard examples\n• Get exact timeline and cost\n\nWant to schedule that call, or have more questions first?`;
    }

    // Discovery phase / access / security questions
    if (lower.includes('discovery') || lower.includes('access') || lower.includes('security') || lower.includes('credentials') || (lower.includes('how does') && lower.includes('work'))) {
      return "**Great question about data access and security:**\n\n**How Dylan Handles System Access:**\n\n**Option 1: Read-Only API Access (Preferred)**\n• Most systems have read-only API keys or service accounts\n• Dylan gets credentials that can ONLY read data, never write/modify\n• You maintain full control, can revoke access anytime\n• Example: Salesforce read-only API user, QuickBooks OAuth token\n\n**Option 2: Data Exports (If APIs Limited)**\n• Your team exports CSV/Excel from systems\n• Dylan works with exported data during development\n• Once built, you set up automated exports or API connections\n• Less ideal but works for security-sensitive orgs\n\n**Option 3: Work On-Site (For Highly Sensitive Data)**\n• Dylan can work at your office if needed\n• Access systems from your network directly\n• Never takes data off-premise\n• Rare but available for regulated industries\n\n**Security Practices:**\n✅ Signs NDA before any data access\n✅ Uses encrypted connections only\n✅ Credentials stored in secure password manager\n✅ Deletes local data copies after project\n✅ Can work within your security policies\n\n**What Dylan Needs to See:**\n• Data structure and relationships (not full datasets)\n• Sample records to understand format\n• Metadata about what fields mean\n• Examples of current reports you want to replicate\n\n**What He Doesn't Need:**\n• Production access (read-only sandbox is fine)\n• Full historical data during discovery\n• Personally identifiable customer info can be masked\n\n**Typical Discovery Process:**\n1. You provide read-only access or sample exports\n2. Dylan maps your data (1-2 days)\n3. He documents findings and proposes architecture\n4. You approve approach before build phase starts\n\nDoes your org have specific security requirements or concerns?";
    }

    // Technical capabilities question
    if (lower.includes('technical') || lower.includes('capabilit') || lower.includes('expertise') || lower.includes('experience with')) {
      return "**Dylan's Technical Capabilities:**\n\n**Business Intelligence & Analytics:**\n• Power BI (Advanced DAX, dimensional modeling, performance tuning)\n• Financial reporting automation\n• Executive dashboard design\n• Predictive analytics and forecasting\n• Data warehouse architecture\n\n**Development Stack:**\n• **Backend:** Python (Pandas, FastAPI, Streamlit), SQL, APIs\n• **Frontend:** React, Next.js, TypeScript, Tailwind CSS\n• **Databases:** PostgreSQL, SQL Server, DuckDB\n• **Integration:** REST APIs, QuickBooks, Salesforce, Recurly, crypto APIs\n\n**Data Strategy & Architecture:**\n• Process automation and workflow design\n• System architecture for scalability\n• Data governance frameworks\n• KPI development and measurement\n• Multi-source data integration\n\n**AI & Automation:**\n• Custom AI integration (not just chatbots)\n• Workflow automation\n• Process optimization\n• GPT-4 integration for intelligent systems\n\n**What Makes Dylan Different:**\n\nMost consultants are either:\n- Business people who understand problems but can't build solutions\n- Technical people who can code but don't understand business context\n\nDylan bridges both. He:\n• Understands finance/operations deeply\n• Can build production-grade systems\n• Speaks both business and technical languages\n• Knows when to use off-the-shelf vs custom\n\n**Real Examples:**\n• Summit: Power BI with complex DAX and data modeling\n• Sovereignty Tracker: Full-stack Python app with Bitcoin API integration\n• Various clients: Financial consolidation, predictive analytics, automation\n\nWhat specific technical challenge are you trying to solve?";
    }

    // Walk me through / approach / process / general approach
    if (lower.includes('walk me through') || lower.includes('general approach') || lower.includes('dylan approach') || 
        lower.includes('explain dylan') || lower.includes('how do you') || lower.includes('typical approach') ||
        (lower.includes('approach') && lower.includes('decide'))) {
      return "**Dylan's Typical Approach for Data/BI Projects:**\n\n**Discovery Phase (Week 1)**\n• 30-min initial call to understand your challenge\n• Data source audit - what systems you use and how they connect\n• Identify the 3-5 most critical reports/dashboards you need\n• Assess current manual processes and time waste\n\n**Design Phase (Week 1-2)**\n• Design dimensional data model (star schema)\n• Plan automated data pipelines\n• Sketch dashboard layouts with you\n• Get approval on architecture before building\n\n**Build Phase (Week 2-4)**\n• Set up data connections and refresh schedules\n• Build core dashboards iteratively\n• Weekly check-ins to show progress and get feedback\n• Adjust based on your input\n\n**Handoff Phase (Week 4-5)**\n• Train your team on how to use and maintain\n• Document everything clearly\n• Optional: ongoing support retainer\n\n**Key Principles:**\n• Working system fast (don't wait months for perfection)\n• Your team can maintain it (no vendor lock-in)\n• Built to scale (won't break when you grow)\n• Discovery before development (understand the problem first)\n\n**Typical Timeline:** 4-6 weeks from kickoff to launch\n**Typical Investment:** $7,500-15,000 depending on complexity\n\nWhat aspect would you like me to dive deeper on?";
    }

    // Schedule call / contact / next steps
    if (lower.includes('schedule') || lower.includes('book') || lower.includes('contact') || 
        lower.includes('reach out') || lower.includes('talk to dylan') || lower.includes('next step')) {
      return "**Great! Here's how to schedule a discovery call with Dylan:**\n\n**Option 1: Direct Email (Fastest)**\nEmail: dylan@sovereigntytracker.com\n\nJust mention:\n• Your name and company\n• Quick summary of your challenge (e.g., \"Multi-entity org with NetSuite/Salesforce data silos\")\n• Your preferred time windows\n\nDylan typically responds within 24 hours and will send a calendar link.\n\n**Option 2: Contact Form**\nScroll down to the contact section on this page and fill out the form. Dylan gets notified immediately.\n\n**What to Expect on the Call:**\n• 30 minutes, no pressure\n• Dylan asks about your specific data sources and challenges\n• He'll show relevant examples from similar projects\n• You'll get rough timeline and investment estimate\n• If it's a fit, he'll send a detailed proposal\n• If not, he'll point you in the right direction\n\n**Before the Call (Optional but Helpful):**\n📋 List your current data sources\n📋 Note how much time your team spends on manual reporting\n📋 Think about your 3 most critical reports/dashboards\n📋 Have rough budget range in mind\n\n**No Obligation:**\nThe discovery call is free and there's no pressure to move forward. Many people just want to understand what's possible and get an expert opinion.\n\nWant me to provide any other info before you reach out?";
    }

    // Power BI vs Custom Decision
    if (lower.includes('power bi or') || lower.includes('custom or') || (lower.includes('need') && (lower.includes('power bi') || lower.includes('custom')))) {
      return "**Power BI vs Custom Development - How to Choose:**\n\n**Choose Power BI when you have:**\n✅ Microsoft ecosystem already (Azure, Office 365)\n✅ Enterprise security/governance requirements\n✅ Finance team that needs to maintain it\n✅ Budget for licensing ($10-20/user/month)\n✅ Standard reporting and analytics needs\n✅ Internal-facing dashboards only\n\n**Choose Custom Development when you need:**\n✅ Full control over user experience and design\n✅ Consumer-facing product or public dashboards\n✅ Complex workflows beyond reporting\n✅ To own 100% of the codebase\n✅ Mobile-first or highly custom UI\n✅ No ongoing licensing costs\n\n**Dylan's Recommendation Process:**\nHe doesn't push one or the other - he asks about your:\n• Current tech stack and team capabilities\n• Who will use it (internal finance team vs customers)\n• Long-term maintenance plan\n• Budget for both build AND ongoing costs\n\n**Example:** Summit Education Group chose Power BI because they already had Salesforce/QuickBooks, needed enterprise security, and wanted their finance team to own it long-term.\n\nWhat's your current tech stack and who would be using this system?";
    }
    
    // ROI and Business Value
    if (lower.includes('roi') || lower.includes('return on investment') || lower.includes('worth it') || lower.includes('justify')) {
      return "**Real ROI from Dylan's Projects:**\n\n**Summit Education Group Case:**\n• **Investment:** $7,500 (60 hours)\n• **Monthly Savings:** 40 hours of manual work eliminated\n• **Dollar Value:** $4,800/month (assuming $30/hr finance staff)\n• **Payback Period:** 1.6 months\n• **Ongoing Value:** Real-time insights, predictive analytics, scalable for acquisitions\n\n**Typical ROI Drivers:**\n\n1️⃣ **Time Savings** (Primary)\n• Eliminate 20-50 hours/month of manual consolidation\n• Reduce report generation from days to minutes\n• Free up finance team for strategic work\n\n2️⃣ **Decision Speed** (Strategic)\n• Real-time dashboards vs weekly/monthly lag\n• Catch problems early instead of weeks later\n• Faster response to market changes\n\n3️⃣ **Error Reduction** (Risk)\n• Automated validation catches bad data\n• Single source of truth eliminates discrepancies\n• Audit trail for compliance\n\n4️⃣ **Scalability** (Future)\n• Add new data sources without starting over\n• Ready for acquisitions/growth\n• No rebuild needed as you scale\n\n**Quick ROI Calculator:**\nHow many hours per month does your team spend on:\n• Manual data consolidation\n• Updating reports in Excel\n• Answering \"what's our current status\" questions\n\nMultiply that by your team's hourly cost. That's your monthly savings potential.\n\nWant to calculate ROI for your specific situation?";
    }
    
    // Timeline Questions
    if (lower.includes('how long') || lower.includes('timeline') || lower.includes('how quickly') || (lower.includes('time') && lower.includes('take'))) {
      return "**Typical Project Timeline:**\n\n**Fast Track (3-4 weeks):**\n• Single data source (like just Salesforce)\n• Standard dashboards (revenue, pipeline, KPIs)\n• Small team, fast decision-making\n• Example: Basic sales dashboard\n\n**Standard (4-6 weeks):**\n• 2-3 data sources to integrate\n• Executive + operational dashboards\n• Some custom calculations/logic\n• Example: Summit Education Group\n\n**Complex (6-10 weeks):**\n• 4+ data sources to unify\n• Multi-entity or acquisition complexity\n• Heavy data modeling requirements\n• Advanced predictive analytics\n\n**What Affects Timeline:**\n⚡ **Faster:** Clean data, clear requirements, quick decisions\n🐌 **Slower:** Data quality issues, changing requirements, slow feedback\n\n**Dylan's Approach:**\n• Week 1: Discovery and design\n• Week 2-3: Build core dashboards (you see progress weekly)\n• Week 4: Refinement and training\n• Week 5+: Polish and handoff\n\n**Why He's Fast:**\n• Uses proven patterns from past projects\n• Iterative delivery (working system early, then improve)\n• Leverages AI for acceleration\n• No corporate bureaucracy\n\n**Real Examples:**\n• Summit's Power BI system: 4 weeks\n• Sovereignty Tracker app: Built in days\n• Typical dashboard project: 3-5 weeks\n\nWhat's your timeline pressure? Need it faster or is there flexibility?";
    }
    
    // Summit Case Study
    if (lower.includes('summit') || lower.includes('case study') || lower.includes('example of') || lower.includes('show me')) {
      return "**Summit Education Group - Deep Dive:**\n\n**Who They Are:**\nEducation company with 5+ acquisitions (SPE, PTFE, TKT, NFPT, Herman & Wallace). Each acquisition brought its own systems and chaos.\n\n**The Problem:**\n❌ QuickBooks, Salesforce, Recurly, Teachable all separate\n❌ 40+ hours/month spent on manual Excel consolidation\n❌ Weekly reports took days to produce\n❌ No real-time visibility into business health\n❌ Every new acquisition meant rebuilding everything\n❌ CFO making decisions on week-old data\n\n**Dylan's Solution:**\n\n**Technical Architecture:**\n• Dimensional data model (proper star schema)\n• 100+ custom DAX measures\n• Automated daily refresh from all sources\n• Predictive health scoring algorithm\n\n**Dashboards Built:**\n📊 Executive Summary - KPIs, variance analysis, health score\n📊 Business Health Monitor - Leading indicators and predictions\n📊 Revenue Analytics - By product, entity, time period\n📊 Subscription Metrics - Churn, retention, lifetime value\n\n**Results:**\n✅ 40 hours/month saved in manual work\n✅ Real-time dashboards instead of weekly lag\n✅ Predictive alerts for problems before they happen\n✅ Architecture ready for next acquisition (no rebuild)\n✅ Finance team can maintain it themselves\n\n**What Made It Work:**\nProper data modeling from day one. Most consultants just connect data sources and make charts. Dylan redesigned their entire data infrastructure so it could scale.\n\n**Technologies Used:**\nPower BI, DAX, Dimensional Modeling, QuickBooks API, Salesforce, Recurly\n\nDoes your situation sound similar? Multi-entity complexity, manual consolidation, need for real-time visibility?";
    }
    
    // Process and Engagement
    if (lower.includes('process') || lower.includes('how does it work') || lower.includes('engagement') || lower.includes('get started')) {
      return "**How to Work with Dylan:**\n\n**Step 1: Free Discovery Call (30 minutes)**\n• You explain your challenge and goals\n• Dylan asks about your data sources and current process\n• He assesses if he's the right fit\n• You get rough timeline and investment estimate\n• No pressure, no sales pitch\n\n**Step 2: Proposal & Agreement**\n• Detailed scope of work (what's included)\n• Timeline with weekly milestones\n• Investment breakdown (hourly rate, estimated hours)\n• Payment terms (biweekly billing)\n• You approve and we kick off\n\n**Step 3: Discovery & Design (Week 1)**\n• Data source audit and access setup\n• Requirements workshop with your team\n• Design data model and dashboard sketches\n• Get your approval before building anything\n\n**Step 4: Iterative Development (Weeks 2-4)**\n• Build core dashboards first\n• Weekly check-ins to show progress\n• You give feedback, he adjusts\n• Working system fast, then refine\n\n**Step 5: Training & Handoff**\n• Train your team on how to use and maintain\n• Complete documentation\n• Smooth transition to your ownership\n• Optional ongoing support available\n\n**Dylan's Philosophy:**\n\"I don't build what you think you need - I build what actually solves the problem.\"\n\nThis means:\n✅ Discovery before development\n✅ Working systems before perfect systems  \n✅ Your team can maintain it (no vendor lock-in)\n✅ Transparent pricing (no surprise bills)\n\n**Investment:**\n• $125/hour, billed biweekly\n• Typical projects: 40-120 hours\n• Most fall in $5,000-15,000 range\n\nReady to schedule that free discovery call?";
    }
    
    // Pricing Questions
    if (lower.includes('cost') || lower.includes('price') || lower.includes('expensive') || lower.includes('budget') || lower.includes('how much')) {
      return "**Investment Breakdown:**\n\n**Hourly Rate: $125/hr**\n(Billed biweekly, time & materials)\n\n**Typical Project Ranges:**\n\n💰 **Basic Dashboard ($5,000-8,000)**\n• Single data source integration\n• 3-5 dashboard pages\n• Standard KPIs and metrics\n• 40-60 hours total\n• Timeline: 3-4 weeks\n\n💰 **Advanced BI System ($8,000-15,000)**\n• Multiple data sources unified\n• Dimensional data modeling\n• Advanced analytics and predictions\n• Executive + operational dashboards\n• 60-120 hours total\n• Timeline: 4-6 weeks\n\n💰 **Custom Application ($10,000-25,000)**\n• Full-stack development\n• Database design\n• API integrations\n• User authentication\n• 80-200 hours total\n• Timeline: 6-12 weeks\n\n**Why It's Worth It:**\n\nYou're not paying for hours, you're paying for:\n• 10+ years of expertise compressed into weeks\n• Systems that scale as you grow\n• No vendor lock-in (your team can maintain)\n• Fast delivery (weeks not months)\n• Proven patterns that work\n\n**ROI Reality Check:**\nIf your team spends 30 hours/month on manual data work, and you pay them $40/hr fully loaded, that's $1,200/month wasted.\n\nAn $8,000 investment pays for itself in 6-7 months, then saves you $1,200/month forever.\n\n**Payment Structure:**\n• No upfront retainer (just start working)\n• Billed biweekly for actual hours\n• Transparent time tracking\n• You can pause or stop anytime\n\nWhat's your budget range? I can help you understand what's possible at different investment levels.";
    }

    // Technical Capabilities
    if (lower.includes('can he') || lower.includes('capable') || lower.includes('experience with') || lower.includes('know how')) {
      return "**Dylan's Technical Capabilities:**\n\n**Business Intelligence & Analytics:**\n• Power BI (Advanced DAX, dimensional modeling, performance tuning)\n• Financial reporting automation\n• Executive dashboard design\n• Predictive analytics and forecasting\n• Data warehouse architecture\n\n**Development Stack:**\n• **Backend:** Python (Pandas, FastAPI, Streamlit), SQL, APIs\n• **Frontend:** React, Next.js, TypeScript, Tailwind CSS\n• **Databases:** PostgreSQL, SQL Server, DuckDB\n• **Integration:** REST APIs, QuickBooks, Salesforce, Recurly, crypto APIs\n\n**Data Strategy & Architecture:**\n• Process automation and workflow design\n• System architecture for scalability\n• Data governance frameworks\n• KPI development and measurement\n• Multi-source data integration\n\n**AI & Automation:**\n• Custom AI integration (not just chatbots)\n• Workflow automation\n• Process optimization\n• GPT-4 integration for intelligent systems\n\n**What Makes Dylan Different:**\n\nMost consultants are either:\n- Business people who understand problems but can't build solutions\n- Technical people who can code but don't understand business context\n\nDylan bridges both. He:\n• Understands finance/operations deeply\n• Can build production-grade systems\n• Speaks both business and technical languages\n• Knows when to use off-the-shelf vs custom\n\n**Real Examples:**\n• Summit: Power BI with complex DAX and data modeling\n• Sovereignty Tracker: Full-stack Python app with Bitcoin API integration\n• Various clients: Financial consolidation, predictive analytics, automation\n\nWhat specific technical challenge are you trying to solve?";
    }

    // Check if user is providing information (contains multiple commas, lists, or detailed explanation)
    const isProvidingInfo = (lower.match(/,/g) || []).length >= 2 || lower.length > 100 || 
      lower.includes('we have') || lower.includes('we use') || lower.includes('our') ||
      lower.includes('currently') || lower.includes('right now');

    // Don't loop back to default - acknowledge what they said
    if (mentionedTech.length > 0 || mentionedChallenges.length > 0 || users) {
      // We have some context but not enough for full synthesis
      const missing: string[] = [];
      if (mentionedTech.length === 0) missing.push('tech stack');
      if (mentionedChallenges.length === 0) missing.push('main challenges');
      if (!users) missing.push('who will use it');

      if (missing.length > 0) {
        let response = `Thanks for sharing! So far I understand:\n${mentionedTech.length > 0 ? `• **Systems:** ${mentionedTech.join(', ')}\n` : ''}${mentionedChallenges.length > 0 ? `• **Challenges:** ${mentionedChallenges.join(', ')}\n` : ''}${users ? `• **Users:** ${users}\n` : ''}\n`;
        
        // Only ask for missing info if we don't have much context yet
        if (mentionedTech.length === 0 || mentionedChallenges.length === 0) {
          response += `To give you a specific recommendation and timeline, could you also tell me:\n${missing.map(m => `• ${m.charAt(0).toUpperCase() + m.slice(1)}`).join('\n')}\n\n`;
        }
        
        response += `Or if you'd prefer, I can:\n• Explain Dylan's general approach and timeline\n• Walk you through the Summit case study\n• Show you typical pricing and ROI\n• Help you schedule a discovery call\n\nWhat would be most helpful?`;
        
        return response;
      }
    }

    if (isProvidingInfo && recentUserMessages.includes('tech stack')) {
      // User just told us about their tech stack
      const techStackMentions: string[] = [];
      const stackTerms = ['netsuite', 'salesforce', 'quickbooks', 'google analytics', 'tableau', 'excel', 'power bi', 'recurly', 'stripe'];
      stackTerms.forEach(term => {
        if (lower.includes(term)) techStackMentions.push(term);
      });

      const hasAcquisitions = lower.includes('acquisition') || lower.includes('buying') || lower.includes('multi-entity');
      const hasDataSilos = lower.includes('silo') || lower.includes('scattered') || lower.includes('everywhere');
      const needsUnified = lower.includes('unified') || lower.includes('source of truth') || lower.includes('consolidat');

      if (techStackMentions.length > 0 && (hasAcquisitions || hasDataSilos || needsUnified)) {
        return `**Perfect - this is exactly Dylan's wheelhouse.**\n\nYour situation sounds very similar to Summit Education Group:\n\n**What You're Dealing With:**\n• Tech Stack: ${techStackMentions.join(', ')}\n${hasAcquisitions ? '• Multi-entity complexity from acquisitions\n' : ''}${hasDataSilos ? '• Data scattered across systems (silos)\n' : ''}${needsUnified ? '• Need for unified source of truth\n' : ''}\n**Why Dylan's a Strong Fit:**\n\nSummit had the exact same problem:\n• Multi-acquisition organization (5+ entities)\n• QuickBooks + Salesforce + Recurly + Teachable\n• 40+ hours/month on manual consolidation\n• No real-time visibility\n\n**His Solution:**\n• Built dimensional data model (star schema)\n• Unified all sources into Power BI\n• Real-time dashboards with predictive analytics\n• **Critical:** Scalable for future acquisitions\n\n**For Your Situation:**\n\n**Phase 1: Foundation (4-5 weeks)**\n• Audit your ${techStackMentions.join(', ')} data\n• Design unified dimensional model\n• Build executive dashboard\n• Automate refresh pipelines\n\n**Phase 2: Scale (2-3 weeks)**\n• Add operational dashboards\n• Build acquisition integration playbook\n• Train your team\n\n**Estimated Investment:** $10,000-15,000 for Phase 1\n**Expected ROI:** If you're spending even 20 hours/month on manual work, you'd see payback in 3-4 months\n\n**Next Step:**\nDylan offers a free 30-minute discovery call to:\n• Review your specific data sources\n• Assess complexity\n• Provide detailed timeline and cost\n\nWant me to explain more about his technical approach, or ready to schedule that discovery call?`;
      }

      return `Thanks for sharing that context. Based on your setup with ${techStackMentions.length > 0 ? techStackMentions.join(', ') : 'your current systems'}, here's what Dylan would typically recommend:\n\n**Discovery Questions First:**\n• How much time does your team spend on manual data work each month?\n• What decisions are you making without real-time data?\n• How urgent is this? Need it solved now or planning for Q2/Q3?\n\n**Likely Approach:**\nBased on similar clients, Dylan would probably suggest:\n\n1️⃣ **Data Audit** - Map all your current data sources and flows\n2️⃣ **Dimensional Model** - Design proper star schema for scalability\n3️⃣ **Unified Dashboard** - Build executive view first, then operational details\n4️⃣ **Automation** - Set up daily automated refresh\n\n**Timeline:** 4-6 weeks\n**Investment:** Probably $8,000-15,000 range\n\nWant me to dive deeper into any of these areas, or would you like to schedule a discovery call with Dylan to get specific recommendations?`;
    }

    // Default intelligent response
    return "I want to make sure I point you in the right direction. Could you tell me more about:\n\n• **What's the specific challenge?** (manual reporting, data silos, slow decisions?)\n• **What systems are you using?** (NetSuite, Salesforce, QuickBooks, etc.)\n• **What's driving this?** (new CFO mandate, acquisition, growth pain?)\n\nOr I can explain:\n• Dylan's typical approach and timeline\n• Real project examples and ROI\n• Technical capabilities and expertise\n• How to get started with a discovery call\n\nWhat would be most helpful?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: getResponse(input, [...messages, userMessage])
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2 group"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
            Talk to Business Advisor
          </span>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-800 rounded-lg shadow-2xl z-50 flex flex-col border border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-500" />
              </div>
              <div>
                <div className="font-bold text-white">Business Intelligence Advisor</div>
                <div className="text-xs text-orange-100">Powered by Dylan&apos;s expertise</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-orange-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Quick questions:</div>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className="flex items-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors text-left"
                    >
                      <Icon size={14} className="text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-2">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about projects, pricing, timeline..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 text-sm focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessAdvisorWidget;