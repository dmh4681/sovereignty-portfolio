export function EvaluateAIVendorsContent() {
  return (
    <article className="prose prose-invert max-w-none">
      <p className="text-xl text-slate-300 mb-8">
        Every AI vendor sounds amazing in the demo. The demo data is perfect, the models are
        magical, and your problems will vanish in 30 days. Then you sign, and reality hits.
        Here are the 20 questions I ask AI vendors before my clients sign anything—questions
        that separate real solutions from expensive science projects.
      </p>

      <h2>Why This Matters Now</h2>
      <p>
        AI vendors are multiplying like rabbits. Every software company is now an &quot;AI
        company.&quot; Every consultant offers &quot;AI transformation.&quot; Some are legitimate.
        Most are rebranded existing tools with a ChatGPT wrapper.
      </p>
      <p>
        The cost of getting this wrong is high:
      </p>
      <ul>
        <li><strong>Direct costs:</strong> $50K-$500K+ in implementation fees</li>
        <li><strong>Opportunity cost:</strong> 6-18 months lost on a failed implementation</li>
        <li><strong>Team morale:</strong> Another &quot;strategic initiative&quot; that goes nowhere</li>
        <li><strong>Political cost:</strong> Your reputation when you championed the vendor</li>
      </ul>
      <p>
        These questions help you avoid expensive mistakes.
      </p>

      <h2>Category 1: The Reality Check Questions</h2>
      <p>
        Start here. These questions quickly separate real solutions from vaporware.
      </p>

      <h3>Question 1: &quot;Show me production data from a similar client&quot;</h3>
      <p>
        Not demo data. Not synthetic data. Real production results from a client in your industry,
        with your data complexity, at your scale.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Specific accuracy numbers (not &quot;highly accurate&quot;)</li>
        <li>Edge cases and how the system handles them</li>
        <li>Performance on messy data, not clean demo data</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;We can&apos;t share that due to confidentiality&quot; (they should have
        anonymized examples ready)</li>
        <li>Only showing perfect results, no discussion of failures or limitations</li>
        <li>&quot;Your data is unique, we&apos;ll need to train specifically for you&quot;
        (translation: we haven&apos;t solved this before)</li>
      </ul>

      <div className="bg-slate-800 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Example Scenario: The Invoice Processing Disaster</p>
        <p className="text-xs text-slate-500 mb-3 italic">(Hypothetical scenario based on common patterns)</p>
        <p className="mb-0">
          A client almost bought an AI invoice processing tool. The demo was perfect—extracted
          every field flawlessly. When asked to see production accuracy on invoices from construction
          subcontractors (the client&apos;s use case), the vendor hemmed and hawed. Turned out their
          system worked great on standardized invoices from big companies, but accuracy dropped
          to 60% on the handwritten, inconsistent formats construction subs send. Would have been
          a $120K waste.
        </p>
      </div>

      <h3>Question 2: &quot;What&apos;s your model&apos;s failure mode?&quot;</h3>
      <p>
        Every AI system fails sometimes. The question is how it fails, and whether that&apos;s
        acceptable for your use case.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Honest discussion of limitations</li>
        <li>Specific failure rates and scenarios</li>
        <li>How the system flags low-confidence predictions</li>
        <li>What happens when it&apos;s wrong</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;Our AI is 99.9% accurate&quot; (nothing is 99.9% accurate on real-world data)</li>
        <li>No discussion of edge cases or failure modes</li>
        <li>Can&apos;t explain what happens when the model is uncertain</li>
      </ul>

      <h3>Question 3: &quot;Can I test this on my actual data before signing?&quot;</h3>
      <p>
        Not a demo. Not a trial. A real proof-of-concept on <em>your</em> data.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Willingness to do a paid POC with clear success criteria</li>
        <li>Realistic timeline (2-4 weeks for most use cases)</li>
        <li>Defined deliverables and metrics</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;Just sign the contract, we&apos;ll figure it out in implementation&quot;</li>
        <li>Requiring 12-month commitment before testing on your data</li>
        <li>POC costs more than $10K-$25K (should be cheap to prove value)</li>
      </ul>

      <h2>Category 2: The Technical Due Diligence Questions</h2>
      <p>
        Even if the demo looks good, you need to understand what&apos;s under the hood.
      </p>

      <h3>Question 4: &quot;Is this actually AI or just business rules?&quot;</h3>
      <p>
        A shocking number of &quot;AI&quot; vendors are just using if-then logic with fancy UIs.
      </p>
      <p>
        <strong>How to probe:</strong>
      </p>
      <ul>
        <li>Ask them to explain the model architecture</li>
        <li>Ask how it handles scenarios not in the training data</li>
        <li>Ask if it improves over time and how</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Vague answers about &quot;proprietary algorithms&quot;</li>
        <li>Can&apos;t explain how the system learns or adapts</li>
        <li>The &quot;AI&quot; requires you to configure extensive business rules</li>
      </ul>

      <h3>Question 5: &quot;What happens to my data?&quot;</h3>
      <p>
        Critical question. Some vendors use your data to train models they sell to your competitors.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Clear data privacy policy in the contract</li>
        <li>Confirmation your data isn&apos;t used to train shared models</li>
        <li>Where data is stored (US vs international)</li>
        <li>How data is encrypted at rest and in transit</li>
        <li>Retention policies and deletion guarantees</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;We use your data to improve our models&quot; (means they&apos;re training
        on your data)</li>
        <li>Can&apos;t specify where data is stored</li>
        <li>No clear data deletion policy when you churn</li>
      </ul>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Example Scenario: The Competitive Intelligence Leak</p>
        <p className="text-xs text-slate-500 mb-3 italic">(Hypothetical scenario based on common patterns)</p>
        <p className="mb-0">
          A company in a competitive industry almost used an AI vendor whose TOS allowed them to
          train on customer data. The vendor had three of the company&apos;s direct competitors as
          customers. That means the company&apos;s data (pricing, customer patterns, strategic
          initiatives) would have effectively been shared with competitors through the model.
          Always read the data usage terms.
        </p>
      </div>

      <h3>Question 6: &quot;What&apos;s your model latency and throughput?&quot;</h3>
      <p>
        Speed matters. An AI that takes 30 seconds per prediction might be fine for monthly reports,
        terrible for customer-facing applications.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Actual response times at your expected volume</li>
        <li>Whether they batch process or real-time</li>
        <li>How performance scales with data volume</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Can&apos;t give specific performance numbers</li>
        <li>&quot;It depends&quot; without any benchmarks</li>
        <li>Demo is suspiciously fast (might be cached/pre-computed)</li>
      </ul>

      <h3>Question 7: &quot;Can I export my data and models if I leave?&quot;</h3>
      <p>
        Vendor lock-in is expensive. You need an exit strategy.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Data export in standard formats (CSV, JSON, not proprietary)</li>
        <li>Whether you can export model weights (if you paid for custom training)</li>
        <li>Transition period and support for migration</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>No data export capability</li>
        <li>Export only in proprietary format</li>
        <li>&quot;Why would you want to leave?&quot; (hostile to the question)</li>
      </ul>

      <h2>Category 3: The Economics Questions</h2>
      <p>
        The sticker price isn&apos;t the real price. Dig into total cost of ownership.
      </p>

      <h3>Question 8: &quot;What&apos;s the all-in cost for year one?&quot;</h3>
      <p>
        Get everything on the table:
      </p>
      <ul>
        <li>Base platform fee</li>
        <li>Implementation/setup fee</li>
        <li>Training data labeling costs</li>
        <li>Integration costs</li>
        <li>Per-user or per-transaction fees</li>
        <li>Support costs</li>
        <li>Required professional services</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;Pricing is custom, we&apos;ll figure it out&quot;</li>
        <li>Implementation costs more than the annual platform fee</li>
        <li>Surprise fees for things that should be standard (API access, data export, etc.)</li>
      </ul>

      <h3>Question 9: &quot;How does pricing scale with my usage?&quot;</h3>
      <p>
        You&apos;re buying this to grow. Make sure the pricing model doesn&apos;t punish success.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Clear pricing tiers</li>
        <li>Volume discounts</li>
        <li>Predictable scaling (not exponential cost increases)</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Per-transaction pricing with no caps</li>
        <li>Pricing jumps 10x at certain thresholds</li>
        <li>Can&apos;t give you a estimate for 2x or 10x your current volume</li>
      </ul>

      <div className="bg-slate-800 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Example Scenario: The Per-Transaction Trap</p>
        <p className="text-xs text-slate-500 mb-3 italic">(Hypothetical scenario based on common patterns)</p>
        <p className="mb-0">
          A company signed with an AI vendor at $0.10 per transaction. Seemed cheap—they were
          processing 10,000 transactions/month, so $1,000/month. Two years later, they&apos;d
          scaled to 500,000 transactions/month. Cost: $50,000/month = $600K/year. With no volume
          discounts. They were locked in for another year. Rebuilding it custom for $40K with
          hosting at $400/month would pay for itself in one month.
        </p>
      </div>

      <h3>Question 10: &quot;What&apos;s included in support, and what costs extra?&quot;</h3>
      <p>
        Support is where vendors hide costs.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Response time SLAs in the contract</li>
        <li>Whether support is included or extra</li>
        <li>Who you actually talk to (offshore tier 1 vs. engineers)</li>
        <li>Whether model retraining is included or extra</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Premium support costs 50%+ of the platform fee</li>
        <li>No SLAs in the contract</li>
        <li>Model updates or retraining cost thousands per iteration</li>
      </ul>

      <h2>Category 4: The Integration Questions</h2>
      <p>
        The AI is useless if it doesn&apos;t fit into your workflow.
      </p>

      <h3>Question 11: &quot;How does this integrate with our existing systems?&quot;</h3>
      <p>
        Be specific. Name your actual systems.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Pre-built integrations with your ERP/CRM/data warehouse</li>
        <li>API documentation you can actually read</li>
        <li>Realistic integration timeline</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;We can integrate with anything&quot; (vague = expensive)</li>
        <li>No API documentation available until after you sign</li>
        <li>Every integration is custom professional services</li>
      </ul>

      <h3>Question 12: &quot;Who builds the integrations, and what&apos;s it cost?&quot;</h3>
      <p>
        Can your team do it, or do you need to pay the vendor&apos;s professional services team
        at $300/hour?
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Self-service integration tools</li>
        <li>Clear documentation</li>
        <li>Fixed-price integration packages</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Only vendor can build integrations</li>
        <li>Time-and-materials pricing for integration work</li>
        <li>Integration costs more than the platform</li>
      </ul>

      <h3>Question 13: &quot;What happens when our data schema changes?&quot;</h3>
      <p>
        Your business evolves. The AI needs to keep up.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>How model retraining works when data changes</li>
        <li>Whether you can update mappings yourself</li>
        <li>Cost and timeline for adapting to schema changes</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Any schema change requires full reimplementation</li>
        <li>Model retraining costs $20K+ per iteration</li>
        <li>3-month lead time for changes</li>
      </ul>

      <h2>Category 5: The Vendor Viability Questions</h2>
      <p>
        The technology might be great, but will the vendor exist in two years?
      </p>

      <h3>Question 14: &quot;How long have you been in business?&quot;</h3>
      <p>
        Not a dealbreaker if they&apos;re new, but you need to know what you&apos;re getting into.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Company history and funding</li>
        <li>Customer count and retention rates</li>
        <li>Whether they&apos;re profitable or burning cash</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Series A startup with 6 months of runway asking for 3-year contracts</li>
        <li>Can&apos;t name 10 production customers</li>
        <li>Customer case studies are all from 6+ months ago</li>
      </ul>

      <h3>Question 15: &quot;What&apos;s your customer retention rate?&quot;</h3>
      <p>
        If customers aren&apos;t renewing, that tells you something.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>80%+ retention rate (logo retention, not dollar retention)</li>
        <li>Willingness to share the number</li>
        <li>Explanation of why customers leave</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>Won&apos;t share retention numbers</li>
        <li>Can&apos;t explain churn</li>
        <li>&lt;60% retention (means half their customers leave each year)</li>
      </ul>

      <h3>Question 16: &quot;Can I talk to three customers who&apos;ve been using this for 12+ months?&quot;</h3>
      <p>
        Not cherry-picked references. Real customers, ideally in your industry, who&apos;ve been
        through the full implementation and renewal cycle.
      </p>
      <p>
        <strong>Questions to ask references:</strong>
      </p>
      <ul>
        <li>What surprised you during implementation?</li>
        <li>What didn&apos;t work as expected?</li>
        <li>How much time did it actually take vs. what they promised?</li>
        <li>What did it actually cost vs. what they quoted?</li>
        <li>Would you buy it again knowing what you know now?</li>
      </ul>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <p className="font-semibold text-orange-400 mb-2">Example Scenario: What References Actually Tell You</p>
        <p className="text-xs text-slate-500 mb-3 italic">(Hypothetical scenario based on common patterns)</p>
        <p className="mb-0">
          References for a company evaluating an AI forecasting tool revealed discrepancies. Vendor said
          implementation takes 6 weeks. Three references all said it took 4-6 months and required
          significant data cleanup first. Vendor said accuracy was 95%. References said 70-80% on
          their actual data. Still might have been worth it, but realistic expectations allowed
          negotiating price down 40% to account for longer implementation.
        </p>
      </div>

      <h2>Category 6: The Contract Questions</h2>
      <p>
        Read the contract. Seriously. Here&apos;s what to look for.
      </p>

      <h3>Question 17: &quot;What&apos;s the contract term, and what&apos;s the out?&quot;</h3>
      <p>
        Don&apos;t sign multi-year contracts for unproven technology.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>12-month initial term with annual renewals</li>
        <li>Performance-based out clauses</li>
        <li>Reasonable termination notice (30-90 days)</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>3-year minimum commitment</li>
        <li>Auto-renewal with no opt-out window</li>
        <li>Termination requires 6+ months notice</li>
        <li>Penalties for early termination exceed remaining contract value</li>
      </ul>

      <h3>Question 18: &quot;What are your uptime SLAs and remedies?&quot;</h3>
      <p>
        If the system is down, what happens?
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>99%+ uptime SLA in the contract</li>
        <li>Specific remedies (credits, not just apologies)</li>
        <li>Defined downtime (what counts as an outage)</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>No uptime SLA in contract</li>
        <li>&quot;Best effort&quot; language</li>
        <li>Remedies are capped at trivial amounts</li>
      </ul>

      <h3>Question 19: &quot;What happens if you get acquired or shut down?&quot;</h3>
      <p>
        Startups get acquired. Companies fail. You need protection.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Source code escrow for mission-critical systems</li>
        <li>Data export rights that survive company changes</li>
        <li>Transition assistance terms</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>No continuity provisions in contract</li>
        <li>Won&apos;t discuss the scenario</li>
        <li>&quot;We&apos;re not going anywhere&quot; (famous last words)</li>
      </ul>

      <h3>Question 20: &quot;Can we do a 90-day pilot before full commitment?&quot;</h3>
      <p>
        The ultimate risk mitigation.
      </p>
      <p>
        <strong>What you&apos;re looking for:</strong>
      </p>
      <ul>
        <li>Fixed-price pilot with clear success metrics</li>
        <li>Option to expand or terminate based on results</li>
        <li>Pilot cost credited toward full contract if you proceed</li>
      </ul>
      <p>
        <strong>Red flags:</strong>
      </p>
      <ul>
        <li>&quot;No pilots, full contract only&quot;</li>
        <li>Pilot costs $50K+ (should be cheap to prove value)</li>
        <li>Vague pilot success criteria</li>
      </ul>

      <h2>How to Use These Questions</h2>
      <p>
        Don&apos;t just rapid-fire all 20 questions in a single meeting. Use them strategically:
      </p>

      <div className="bg-slate-800 p-6 rounded-lg my-8">
        <h4 className="mt-0">First Meeting: Reality Check (Q1-3)</h4>
        <p>
          Verify they can actually solve your problem with your data. If they can&apos;t answer
          these convincingly, stop here.
        </p>

        <h4>Second Meeting: Technical Due Diligence (Q4-7)</h4>
        <p>
          Dig into what&apos;s under the hood. Bring your technical team. If the technology
          doesn&apos;t hold up, stop here.
        </p>

        <h4>Third Meeting: Economics &amp; Integration (Q8-13)</h4>
        <p>
          Understand the true cost and implementation complexity. If the economics don&apos;t work,
          stop here.
        </p>

        <h4>Fourth Meeting: Vendor Viability &amp; References (Q14-16)</h4>
        <p>
          Verify the vendor will be around and can actually deliver. Talk to references separately.
        </p>

        <h4>Contract Review: Legal &amp; Risk (Q17-20)</h4>
        <p>
          Negotiate terms that protect you. Don&apos;t sign until you&apos;re comfortable with
          outs and risk mitigation.
        </p>
      </div>

      <h2>Good Signs vs Red Flags Summary</h2>

      <table className="w-full my-8">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left p-3">Good Signs</th>
            <th className="text-left p-3">Red Flags</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-800">
            <td className="p-3">Shows production data and discusses failures openly</td>
            <td className="p-3">Only perfect demo data, won&apos;t discuss limitations</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">Offers paid POC with clear success metrics</td>
            <td className="p-3">Requires long-term contract before testing your data</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">Transparent pricing with predictable scaling</td>
            <td className="p-3">Vague costs, surprise fees, exponential scaling</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">80%+ customer retention, shares numbers</td>
            <td className="p-3">Won&apos;t share retention, can&apos;t explain churn</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">References confirm timeline and cost accuracy</td>
            <td className="p-3">References reveal 3x time and cost vs. sales pitch</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">12-month terms with performance outs</td>
            <td className="p-3">3-year lock-in with punitive termination clauses</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">Data export and portability guaranteed</td>
            <td className="p-3">Proprietary formats, no export capability</td>
          </tr>
          <tr className="border-b border-slate-800">
            <td className="p-3">Specific SLAs with meaningful remedies</td>
            <td className="p-3">&quot;Best effort&quot; with no guarantees</td>
          </tr>
        </tbody>
      </table>

      <h2>The Bottom Line</h2>
      <p>
        Most AI vendors are selling futures, not solutions. Your job is to figure out which ones
        can actually deliver.
      </p>
      <p>
        These 20 questions separate:
      </p>
      <ul>
        <li>Real technology from rebranded business rules</li>
        <li>Proven solutions from science projects</li>
        <li>Fair pricing from vendor lock-in traps</li>
        <li>Sustainable vendors from startups that won&apos;t exist in 18 months</li>
      </ul>
      <p>
        Don&apos;t get dazzled by the demo. Do the diligence. Ask hard questions. Talk to
        references. Read the contract.
      </p>
      <p>
        And remember: the best AI solution might be building custom with someone who knows your
        business, rather than buying a generic platform that kind of fits.
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 my-8">
        <h3 className="text-orange-400 mt-0">Need an Honest Second Opinion?</h3>
        <p>
          I help CFOs and finance leaders evaluate AI vendors and alternative solutions. I&apos;ve
          seen enough vendor pitches to know what&apos;s real and what&apos;s marketing.
        </p>
        <p>
          Sometimes the AI vendor is the right choice. Often, a custom-built solution delivers
          better results at 90% lower cost. I&apos;ll tell you honestly which makes sense for
          your situation.
        </p>
        <p className="mb-0">
          Let&apos;s review the vendor proposals you&apos;re considering. I&apos;ll help you ask
          the right questions, interpret the answers, and make a decision you won&apos;t regret.
          No sales pitch—just straight talk from someone who builds this stuff and knows what
          actually works.
        </p>
      </div>
    </article>
  );
}
