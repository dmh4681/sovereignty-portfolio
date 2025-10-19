export function BuildingSovereigntyPathContent() {
  return (
    <article className="prose prose-invert max-w-none">
      <p className="text-xl text-slate-300 mb-8">
        I built The Sovereignty Path—a full-featured SaaS application for managing business
        finances—in about 120 hours over 6 weeks. Ten years ago, this would have taken a team
        of developers 6-12 months. Here&apos;s how AI-accelerated development actually works,
        what decisions I made, what worked, and what I&apos;d do differently.
      </p>

      <h2>The Problem I Was Solving</h2>
      <p>
        Small business owners and solopreneurs need to understand their finances, but existing
        tools are either:
      </p>
      <ul>
        <li><strong>Too simple:</strong> Basic spreadsheets that don&apos;t scale</li>
        <li><strong>Too complex:</strong> QuickBooks/Xero overkill for simple businesses</li>
        <li><strong>Too expensive:</strong> $50-$100/month for features you don&apos;t need</li>
      </ul>
      <p>
        I wanted something in between: smart enough to give real insights, simple enough to use
        without an accounting degree, affordable enough for a side business.
      </p>
      <p>
        Also: I wanted to prove that AI-accelerated development can build production-grade
        applications, not just prototypes.
      </p>

      <h2>The Tech Stack Decisions</h2>
      <p>
        Choosing the right stack when you&apos;re building with AI assistance is different than
        traditional development. You want:
      </p>
      <ul>
        <li>Technologies the AI knows well (more training data = better code)</li>
        <li>Modern frameworks with good documentation (AI can reference it)</li>
        <li>Rapid iteration capability (you&apos;ll be testing a lot)</li>
        <li>Low operational overhead (one person managing this)</li>
      </ul>

      <h3>Frontend: Next.js 14 + TypeScript + Tailwind</h3>
      <p>
        <strong>Why Next.js:</strong>
      </p>
      <ul>
        <li>React is what AI models know best—massive training corpus</li>
        <li>Server components for fast performance without complexity</li>
        <li>File-based routing keeps things simple</li>
        <li>Vercel deployment is stupidly easy</li>
      </ul>
      <p>
        <strong>Why TypeScript:</strong>
      </p>
      <ul>
        <li>Type safety catches errors before runtime</li>
        <li>AI-generated code is more reliable with types</li>
        <li>Autocomplete makes iterations faster</li>
      </ul>
      <p>
        <strong>Why Tailwind:</strong>
      </p>
      <ul>
        <li>AI is excellent at generating Tailwind classes</li>
        <li>No context switching between files (styles inline)</li>
        <li>Consistent design without custom CSS hell</li>
      </ul>

      <div className="bg-slate-800 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Lesson: Use What AI Knows</p>
        <p className="mb-0">
          I initially considered Svelte because I like it. But AI models have way more React
          training data. When I asked Claude to build a complex form in React vs Svelte, the
          React version was perfect on first try. The Svelte version needed three iterations.
          Use technologies with large training corpora when building with AI.
        </p>
      </div>

      <h3>Backend: Python + FastAPI + SQLAlchemy</h3>
      <p>
        <strong>Why Python:</strong>
      </p>
      <ul>
        <li>Best language for financial calculations and data manipulation</li>
        <li>Rich ecosystem for finance (pandas, numpy)</li>
        <li>AI models are excellent at Python</li>
      </ul>
      <p>
        <strong>Why FastAPI:</strong>
      </p>
      <ul>
        <li>Modern, fast, great for APIs</li>
        <li>Automatic OpenAPI docs (helpful when iterating)</li>
        <li>Type hints = fewer bugs</li>
        <li>Async support for performance</li>
      </ul>
      <p>
        <strong>Why SQLAlchemy:</strong>
      </p>
      <ul>
        <li>Database-agnostic (started with SQLite, can move to Postgres)</li>
        <li>ORM makes complex queries readable</li>
        <li>AI-generated queries are safer with ORM</li>
      </ul>

      <h3>Database: PostgreSQL</h3>
      <p>
        Financial data needs ACID compliance. Postgres is the obvious choice:
      </p>
      <ul>
        <li>Rock-solid transactions</li>
        <li>JSON support for flexible schemas</li>
        <li>Free tier on Railway/Render</li>
        <li>Scales to millions of records without thinking about it</li>
      </ul>

      <h3>Hosting: Vercel + Railway</h3>
      <ul>
        <li><strong>Vercel for frontend:</strong> Git push = deployed, automatic previews,
        global CDN</li>
        <li><strong>Railway for backend + DB:</strong> Simple, cheap, just works</li>
      </ul>
      <p>
        Total hosting cost: ~$20/month for production-grade infrastructure.
      </p>

      <h2>Architecture Decisions</h2>

      <h3>Decision 1: Separate Frontend and Backend</h3>
      <p>
        I could have used Next.js API routes for everything. I chose separate FastAPI backend.
      </p>
      <p>
        <strong>Why:</strong>
      </p>
      <ul>
        <li>Python is better for financial calculations</li>
        <li>Can scale backend independently</li>
        <li>Clear separation of concerns</li>
        <li>Easier to add mobile app later (shared API)</li>
      </ul>
      <p>
        <strong>Tradeoff:</strong> More complexity, two deployment pipelines
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Would I Do It Again?</p>
        <p className="mb-0">
          Yes. The Python backend has already paid for itself in code quality for financial logic.
          Trying to do compound interest calculations, cash flow projections, and financial
          forecasting in TypeScript would have been painful. Use the right language for the domain.
        </p>
      </div>

      <h3>Decision 2: Server Components + Client Components Hybrid</h3>
      <p>
        Next.js 14 server components are powerful but require thinking differently.
      </p>
      <p>
        My pattern:
      </p>
      <ul>
        <li><strong>Server components:</strong> Data fetching, static content, layout</li>
        <li><strong>Client components:</strong> Interactivity, forms, real-time updates</li>
      </ul>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">Example: Transaction List Page</h4>
        <pre className="bg-slate-900 p-4 rounded overflow-x-auto">
          <code>{`// Server Component (page.tsx)
export default async function TransactionsPage() {
  // Fetch data on server
  const transactions = await fetchTransactions();

  return (
    <div>
      <PageHeader title="Transactions" />
      {/* Client component for interactivity */}
      <TransactionTable
        initialData={transactions}
      />
    </div>
  );
}

// Client Component (TransactionTable.tsx)
'use client';

export function TransactionTable({ initialData }) {
  const [data, setData] = useState(initialData);
  // Filtering, sorting, interactivity here
  return <Table data={data} />;
}`}</code>
        </pre>
      </div>

      <p>
        <strong>Benefit:</strong> Fast initial load, then interactive. Best of both worlds.
      </p>

      <h3>Decision 3: Optimistic UI Updates</h3>
      <p>
        Financial apps feel slow if every action requires a server round-trip. I implemented
        optimistic updates:
      </p>
      <ol>
        <li>User submits transaction</li>
        <li>UI updates immediately</li>
        <li>API call happens in background</li>
        <li>Rollback if API fails</li>
      </ol>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">Example: Adding a Transaction</h4>
        <pre className="bg-slate-900 p-4 rounded overflow-x-auto">
          <code>{`async function addTransaction(transaction: Transaction) {
  // Add to UI immediately
  setTransactions([transaction, ...transactions]);

  try {
    // Save to backend
    await api.post('/transactions', transaction);
  } catch (error) {
    // Rollback on error
    setTransactions(transactions.filter(t => t.id !== transaction.id));
    toast.error('Failed to save transaction');
  }
}`}</code>
        </pre>
      </div>

      <p>
        Users notice. The app feels instant even though data is being persisted.
      </p>

      <h3>Decision 4: API Design - RESTful with Pragmatism</h3>
      <p>
        I started with pure REST, then got pragmatic:
      </p>

      <table className="w-full my-8">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left p-3">Endpoint</th>
            <th className="text-left p-3">Why</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-800">
            <td className="p-3"><code>GET /transactions</code></td>
            <td className="p-3">Standard REST</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3"><code>POST /transactions</code></td>
            <td className="p-3">Standard REST</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3"><code>GET /dashboard/summary</code></td>
            <td className="p-3">Pragmatic: One call for dashboard instead of 5</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3"><code>POST /reports/cash-flow</code></td>
            <td className="p-3">Pragmatic: Complex calculation, POST to send params</td>
          </tr>
        </tbody>
      </table>

      <p>
        Pure REST purists hate this. Users love the performance. Choose pragmatism over dogma.
      </p>

      <h2>How AI-Accelerated Development Actually Works</h2>
      <p>
        People ask: &quot;Did AI write all the code?&quot; No. Here&apos;s the real workflow:
      </p>

      <h3>Phase 1: Architecture &amp; Scaffolding (Me: 80%, AI: 20%)</h3>
      <p>
        I designed the architecture, data models, and overall structure. AI helped with:
      </p>
      <ul>
        <li>Boilerplate generation (FastAPI route scaffolding, DB models)</li>
        <li>Config files (TypeScript config, Tailwind setup)</li>
        <li>Initial project structure</li>
      </ul>

      <h3>Phase 2: Core Features (Me: 40%, AI: 60%)</h3>
      <p>
        I specified what I wanted, AI generated code, I reviewed and refined:
      </p>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">Example Prompt</h4>
        <p className="text-slate-300 mb-2">Me:</p>
        <blockquote className="border-l-2 border-slate-600 pl-4 italic">
          &quot;Build a transaction categorization system. Users should be able to define custom
          categories, set up rules for auto-categorization based on description patterns, and
          manually override. Store in Postgres, expose FastAPI endpoints, and create React UI
          for managing categories.&quot;
        </blockquote>
        <p className="text-slate-300 mt-4 mb-2">AI generates:</p>
        <ul className="text-sm">
          <li>Database schema for categories and rules</li>
          <li>SQLAlchemy models</li>
          <li>FastAPI endpoints (CRUD + auto-categorization logic)</li>
          <li>React components for category management</li>
          <li>Form validation and error handling</li>
        </ul>
        <p className="text-slate-300 mt-4 mb-2">I review and refine:</p>
        <ul className="text-sm">
          <li>Improve pattern matching algorithm</li>
          <li>Add edge case handling</li>
          <li>Adjust UI/UX based on testing</li>
        </ul>
      </div>

      <p>
        This would have taken me 8-10 hours to build from scratch. With AI: 2 hours.
      </p>

      <h3>Phase 3: Polish &amp; Edge Cases (Me: 70%, AI: 30%)</h3>
      <p>
        AI is good at the happy path. Edge cases require human thinking:
      </p>
      <ul>
        <li>What happens when user deletes a category that has transactions?</li>
        <li>How do we handle timezone differences in financial reports?</li>
        <li>What if two auto-categorization rules conflict?</li>
      </ul>
      <p>
        I designed the logic, AI helped implement it.
      </p>

      <h2>Specific Features: What Worked Well</h2>

      <h3>Cash Flow Forecasting</h3>
      <p>
        The killer feature. Predicts future cash based on historical patterns.
      </p>
      <p>
        <strong>How it works:</strong>
      </p>
      <ol>
        <li>Analyze historical transaction patterns</li>
        <li>Identify recurring transactions (rent, subscriptions, etc.)</li>
        <li>Calculate variable expense trends</li>
        <li>Project forward 90 days</li>
        <li>Flag potential cash crunches</li>
      </ol>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">Core Algorithm (Simplified)</h4>
        <pre className="bg-slate-900 p-4 rounded overflow-x-auto">
          <code>{`def forecast_cash_flow(transactions: List[Transaction], days: int = 90):
    # Identify recurring transactions
    recurring = identify_recurring_patterns(transactions)

    # Calculate baseline variable spending
    variable_avg = calculate_variable_average(
        transactions,
        exclude=recurring
    )

    # Project forward
    forecast = []
    current_balance = get_current_balance()

    for day in range(days):
        daily_change = 0

        # Add recurring items if due
        for item in recurring:
            if is_due(item, day):
                daily_change += item.amount

        # Add variable spending estimate
        daily_change += variable_avg / 30

        current_balance += daily_change
        forecast.append({
            'date': today + timedelta(days=day),
            'balance': current_balance,
            'change': daily_change
        })

    return forecast`}</code>
        </pre>
      </div>

      <p>
        AI helped me build this in 3 hours. Would have taken a full day from scratch.
      </p>

      <h3>Intelligent Transaction Import</h3>
      <p>
        Users can upload CSV from any bank. System auto-detects format and maps columns.
      </p>
      <p>
        <strong>Challenge:</strong> Every bank&apos;s CSV is different.
      </p>
      <p>
        <strong>Solution:</strong> Pattern matching + user confirmation.
      </p>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">CSV Import Flow</h4>
        <ol className="text-sm">
          <li>User uploads CSV</li>
          <li>System analyzes first 10 rows</li>
          <li>Identifies likely columns: date (look for date formats), amount (look for currency),
          description (text), etc.</li>
          <li>Shows preview: &quot;Does this look right?&quot;</li>
          <li>User confirms or adjusts mapping</li>
          <li>Import processes all rows</li>
        </ol>
      </div>

      <p>
        The column detection logic was 90% AI-generated. I added the confirmation UI and edge
        case handling.
      </p>

      <h2>What I&apos;d Do Differently</h2>

      <h3>Mistake 1: Not Setting Up Testing Early</h3>
      <p>
        I built fast and skipped tests initially. Bad idea for financial software.
      </p>
      <p>
        <strong>What happened:</strong> Small bug in compound interest calculation wasn&apos;t
        caught until user testing. Required emergency fix.
      </p>
      <p>
        <strong>What I should have done:</strong> Set up pytest + Jest from day one, especially
        for financial calculations.
      </p>
      <p>
        <strong>Lesson:</strong> AI makes you fast. Tests keep you accurate. You need both.
      </p>

      <h3>Mistake 2: Over-Engineering the Data Model</h3>
      <p>
        I built a complex double-entry accounting system initially. Totally unnecessary for the
        target users.
      </p>
      <p>
        <strong>What happened:</strong> Spent 15 hours on something users didn&apos;t need or want.
      </p>
      <p>
        <strong>What I should have done:</strong> Start simple, add complexity only when needed.
      </p>
      <p>
        <strong>Lesson:</strong> Just because AI makes complex code easy doesn&apos;t mean you
        should build it.
      </p>

      <h3>Mistake 3: Not Dogfooding Enough</h3>
      <p>
        I built features based on what I thought users needed. Should have used it myself more
        intensively first.
      </p>
      <p>
        <strong>What happened:</strong> Built a reports section that was too complex. Users
        wanted simpler insights.
      </p>
      <p>
        <strong>What I should have done:</strong> Use it daily for my own business before adding
        features.
      </p>

      <h2>Performance Lessons</h2>

      <h3>Database Queries: Don&apos;t Trust AI Blindly</h3>
      <p>
        AI-generated database queries can be inefficient. The code works but doesn&apos;t scale.
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Real Example: The N+1 Query</p>
        <p className="mb-0">
          AI generated code to show transactions with category names. It worked fine in testing
          with 50 transactions. In production with 5,000 transactions, the page took 8 seconds
          to load. Why? N+1 query problem—fetching categories one by one instead of using a join.
          I added <code>.join(Category)</code> and load time dropped to 200ms. Always review
          AI-generated database code with a performance lens.
        </p>
      </div>

      <h3>Frontend Performance: Code Splitting Matters</h3>
      <p>
        AI doesn&apos;t automatically optimize bundle size. I had to manually add code splitting:
      </p>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <pre className="bg-slate-900 p-4 rounded overflow-x-auto">
          <code>{`// Before: Everything loads upfront
import ReportGenerator from './ReportGenerator';

// After: Lazy load heavy components
const ReportGenerator = dynamic(() => import('./ReportGenerator'), {
  loading: () => <LoadingSpinner />
});`}</code>
        </pre>
      </div>

      <p>
        Cut initial bundle size by 40%.
      </p>

      <h2>Security Considerations</h2>

      <h3>What I Implemented</h3>
      <ul>
        <li><strong>Authentication:</strong> JWT tokens with secure httpOnly cookies</li>
        <li><strong>Authorization:</strong> Row-level security—users only see their data</li>
        <li><strong>Input validation:</strong> Pydantic models on backend, Zod on frontend</li>
        <li><strong>SQL injection prevention:</strong> SQLAlchemy ORM (parameterized queries)</li>
        <li><strong>XSS prevention:</strong> React automatically escapes (but I double-checked
        AI code)</li>
      </ul>

      <h3>Security Review Process</h3>
      <p>
        I never trust AI-generated code for security-critical paths. My process:
      </p>
      <ol>
        <li>AI generates authentication/authorization code</li>
        <li>I review line-by-line</li>
        <li>I manually test with malicious inputs</li>
        <li>I run security scanning tools (Bandit for Python, ESLint security plugins)</li>
      </ol>

      <h2>The Economics: What Did This Cost?</h2>

      <h3>Time Investment</h3>
      <ul>
        <li><strong>Week 1-2:</strong> Architecture, scaffolding, core data models (30 hours)</li>
        <li><strong>Week 3-4:</strong> Main features (transactions, categories, dashboard) (40 hours)</li>
        <li><strong>Week 5:</strong> Advanced features (forecasting, reports, import) (25 hours)</li>
        <li><strong>Week 6:</strong> Polish, testing, deployment (25 hours)</li>
      </ul>
      <p>
        <strong>Total: ~120 hours</strong>
      </p>

      <h3>Cost Breakdown</h3>
      <ul>
        <li><strong>AI tools (Claude, Cursor):</strong> $60/month</li>
        <li><strong>Hosting (Vercel + Railway):</strong> $20/month</li>
        <li><strong>Domain:</strong> $12/year</li>
        <li><strong>My time:</strong> 120 hours</li>
      </ul>

      <h3>Traditional Development Comparison</h3>
      <p>
        Same application, traditional development:
      </p>
      <ul>
        <li><strong>Senior dev:</strong> 400-500 hours ($60K-$75K at consulting rates)</li>
        <li><strong>Junior dev:</strong> 800-1000 hours ($40K-$50K)</li>
        <li><strong>Timeline:</strong> 3-6 months</li>
      </ul>

      <p>
        AI-accelerated: 4x faster, 1/10th the cost if you value my time at market rates.
      </p>

      <h2>Key Takeaways for Builders</h2>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="text-orange-400 mt-0">1. AI Accelerates, Doesn&apos;t Replace</h4>
        <p>
          You still need to know what you&apos;re building and why. AI helps you build it faster,
          but you&apos;re the architect.
        </p>

        <h4 className="text-orange-400">2. Use Technologies AI Knows Well</h4>
        <p>
          React &gt; Svelte. Python &gt; Rust. Not because they&apos;re better, but because AI
          has more training data and produces better code.
        </p>

        <h4 className="text-orange-400">3. Review Everything, Especially Security &amp; Finance</h4>
        <p>
          AI makes mistakes. In security and financial calculations, those mistakes are expensive.
          Always review critical code paths manually.
        </p>

        <h4 className="text-orange-400">4. Start Simple, Add Complexity Only When Needed</h4>
        <p>
          Just because AI makes complex code easy doesn&apos;t mean you should build it. Ship
          simple, iterate based on real usage.
        </p>

        <h4 className="text-orange-400">5. Test Early, Test Often</h4>
        <p>
          AI makes you fast. Tests keep you accurate. Set up testing infrastructure from day one,
          especially for critical logic.
        </p>

        <h4 className="text-orange-400">6. Performance Review AI Code</h4>
        <p>
          AI optimizes for correctness, not performance. Review database queries, check bundle
          sizes, profile hot paths.
        </p>
      </div>

      <h2>The Future of AI-Accelerated Development</h2>
      <p>
        This is just the beginning. AI coding assistants are getting better monthly. What took
        me 120 hours in early 2024 would probably take 80 hours in late 2024.
      </p>
      <p>
        But the fundamental dynamics won&apos;t change:
      </p>
      <ul>
        <li>AI handles boilerplate and common patterns</li>
        <li>Humans handle architecture, edge cases, and domain expertise</li>
        <li>The combination is 5-10x faster than either alone</li>
      </ul>
      <p>
        The companies and consultants who figure this out early will have a massive advantage.
        Those who ignore it will get disrupted.
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <h3 className="text-orange-400 mt-0">Want to Build Something?</h3>
        <p>
          I help businesses build custom software using AI-accelerated development. What used to
          take 6 months and $200K now takes 6 weeks and $30K.
        </p>
        <p>
          Whether you need financial dashboards, workflow automation, customer portals, or
          internal tools—if it can be built, we can build it faster and cheaper than you think.
        </p>
        <p className="mb-0">
          Let&apos;s talk about what you&apos;re trying to build. I&apos;ll tell you honestly
          whether custom development makes sense, what it would cost, and how long it would take.
          No sales pitch—just real numbers from someone who&apos;s actually building this stuff.
        </p>
      </div>
    </article>
  );
}
