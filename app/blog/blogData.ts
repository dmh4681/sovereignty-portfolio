export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  seoKeywords: string[];
  excerpt: string;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'outgrown-spreadsheets',
    title: '10 Signs You\'ve Outgrown Spreadsheets',
    subtitle: 'A Finance Leader\'s Guide to Knowing When It\'s Time to Automate',
    author: 'Dylan Heiney',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Financial Reporting',
    tags: ['Spreadsheet Automation', 'Financial Reporting', 'Power BI'],
    seoKeywords: ['spreadsheet automation', 'financial reporting automation', 'Power BI consulting', 'custom financial dashboards'],
    excerpt: 'Your spreadsheets got you here, but they won\'t get you there. Learn the 10 critical signs that it\'s time to modernize your financial reporting.',
    featured: true
  },
  {
    slug: 'cfo-guide-to-ai',
    title: 'The CFO\'s Guide to AI',
    subtitle: 'Competitive Advantage or Expensive Distraction?',
    author: 'Dylan Heiney',
    date: '2025-01-14',
    readTime: '10 min read',
    category: 'AI Strategy',
    tags: ['AI', 'CFO', 'Finance Technology'],
    seoKeywords: ['CFO AI guide', 'AI consultant for finance', 'financial reporting automation'],
    excerpt: 'Cut through the AI hype. A practical framework for evaluating AI opportunities specifically for finance teams.',
    featured: true
  },
  {
    slug: 'ai-accelerated-consulting',
    title: 'AI-Accelerated Consulting: 10x Faster, 90% Lower Cost',
    subtitle: 'How AI is Revolutionizing Professional Services',
    author: 'Dylan Heiney',
    date: '2025-01-13',
    readTime: '7 min read',
    category: 'AI Strategy',
    tags: ['AI', 'Consulting', 'Efficiency'],
    seoKeywords: ['AI consultant for finance', 'Power BI consulting', 'custom financial dashboards'],
    excerpt: 'Traditional consulting is broken. Learn how AI acceleration delivers enterprise-quality solutions at a fraction of the time and cost.',
    featured: true
  },
  {
    slug: 'sovereignty-manifesto',
    title: 'The Sovereignty Manifesto',
    subtitle: 'Why Personal Freedom Starts With Data',
    author: 'Dylan Heiney',
    date: '2025-01-12',
    readTime: '12 min read',
    category: 'Philosophy',
    tags: ['Sovereignty', 'Data Privacy', 'Personal Freedom'],
    seoKeywords: ['data sovereignty', 'personal data control', 'financial independence'],
    excerpt: 'Sovereignty is measured not by what you own, but by how long you can say no. A manifesto on reclaiming control in the digital age.',
    featured: false
  },
  {
    slug: 'power-bi-vs-custom-development',
    title: 'Power BI vs Custom Development: Decision Framework',
    subtitle: 'When to Build, When to Buy, and When to Partner',
    author: 'Dylan Heiney',
    date: '2025-01-11',
    readTime: '9 min read',
    category: 'Technology Decisions',
    tags: ['Power BI', 'Custom Development', 'Decision Framework'],
    seoKeywords: ['Power BI consulting', 'custom financial dashboards', 'financial reporting automation'],
    excerpt: 'Power BI or custom development? This framework helps you make the right choice for your organization\'s needs and budget.',
    featured: false
  },
  {
    slug: 'hidden-cost-manual-reporting',
    title: 'The Hidden Cost of Manual Financial Reporting',
    subtitle: 'It\'s Not Just the Hours',
    author: 'Dylan Heiney',
    date: '2025-01-10',
    readTime: '6 min read',
    category: 'Financial Reporting',
    tags: ['Financial Reporting', 'Automation', 'ROI'],
    seoKeywords: ['financial reporting automation', 'spreadsheet automation', 'Power BI consulting'],
    excerpt: 'Manual reporting costs more than you think. Beyond the hours, discover the hidden costs of opportunity, errors, and strategic blind spots.',
    featured: false
  },
  {
    slug: 'evaluate-ai-vendors',
    title: 'How to Evaluate AI Vendors (Without Getting Burned)',
    subtitle: '20 Questions to Ask Before You Sign',
    author: 'Dylan Heiney',
    date: '2025-01-09',
    readTime: '11 min read',
    category: 'AI Strategy',
    tags: ['AI', 'Vendor Selection', 'Due Diligence'],
    seoKeywords: ['AI consultant for finance', 'CFO AI guide', 'AI vendor evaluation'],
    excerpt: 'AI vendor promises sound great until they don\'t deliver. Ask these 20 questions to separate signal from noise and avoid costly mistakes.',
    featured: false
  },
  {
    slug: 'when-spreadsheets-break',
    title: 'What Happens When Your Spreadsheets Break?',
    subtitle: 'Real Stories from the Front Lines',
    author: 'Dylan Heiney',
    date: '2025-01-07',
    readTime: '8 min read',
    category: 'Financial Reporting',
    tags: ['Spreadsheets', 'Case Studies', 'Lessons Learned'],
    seoKeywords: ['spreadsheet automation', 'financial reporting automation', 'spreadsheet failures'],
    excerpt: 'Real stories of spreadsheet failures and their consequences. Learn from others\' mistakes before they become your own.',
    featured: false
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}
