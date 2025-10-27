// app/api/assessment/send-results/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const pathDetails = {
  default: {
    name: 'Balanced Path',
    focus: ['Physical health', 'Mental clarity', 'Financial discipline', 'Daily learning'],
    dailyPractices: [
      'Cook 2-3 home meals daily',
      '30-40 minutes of exercise',
      '10 minutes of meditation',
      'Track spending and invest in Bitcoin',
      'Read or learn something new'
    ]
  },
  financial: {
    name: 'Financial Sovereignty',
    focus: ['Spending discipline', 'Daily Bitcoin investment', 'Continuous learning', 'Wealth building'],
    dailyPractices: [
      'No discretionary spending',
      'Invest in Bitcoin daily (even $1)',
      '30+ minutes of financial education',
      'Cook at home to save money',
      'Practice gratitude for what you have'
    ]
  },
  mental: {
    name: 'Mental Resilience',
    focus: ['Meditation practice', 'Gratitude journaling', 'Learning and growth', 'Stress management'],
    dailyPractices: [
      '15 minutes of meditation',
      'Write 3 things you\'re grateful for',
      'Learn something new daily',
      'Mindful movement (walking, yoga)',
      'Limit information overload'
    ]
  },
  physical: {
    name: 'Physical Optimization',
    focus: ['Strength training', 'Optimal nutrition', 'Recovery practices', 'Athletic performance'],
    dailyPractices: [
      'Strength training 4-6x per week',
      'Cook all meals - high protein focus',
      '40+ minutes of intentional exercise',
      'Track macros and performance',
      'Prioritize sleep and recovery'
    ]
  },
  spiritual: {
    name: 'Spiritual Growth',
    focus: ['Meditation and presence', 'Gratitude practice', 'Mindful living', 'Environmental consciousness'],
    dailyPractices: [
      '20 minutes of meditation',
      'Gratitude journaling',
      'Mindful meals (no distractions)',
      'Time in nature',
      'Acts of service or kindness'
    ]
  },
  planetary: {
    name: 'Planetary Stewardship',
    focus: ['Environmental action', 'Sustainable living', 'Reduced consumption', 'Regenerative practices'],
    dailyPractices: [
      'One environmental action daily',
      'Plant-forward meals',
      'Minimize waste and consumption',
      'Learn about sustainability',
      'Support regenerative practices'
    ]
  }
};

export async function POST(request: Request) {
  try {
    const { email, name, pathResult, secondaryPath } = await request.json();

    if (!email || !name || !pathResult) {
      return NextResponse.json(
        { error: 'Email, name, and path result required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client here (only when handling requests)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const primaryPath = pathDetails[pathResult as keyof typeof pathDetails];
    const secondPath = pathDetails[secondaryPath as keyof typeof pathDetails];

    // Generate personalized insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the Sovereignty Tracker Coach. Generate personalized guidance for someone named ${name} whose primary path is ${primaryPath.name} and secondary path is ${secondPath.name}.

Write a motivating 2-3 paragraph email that:
1. Starts with "Hey ${name}," as the greeting
2. Affirms their path alignment
3. Explains why this path suits them based on their answers
4. Provides 1-2 specific action steps to start TODAY
5. Connects daily habits to sovereignty goals
6. Ends with empowerment and urgency
7. Sign off with just your coach name (use a creative sovereignty-related name, NOT "[Your Name]" or any placeholder)

IMPORTANT: Use their actual name "${name}" throughout. DO NOT use placeholders like [Name] or [Your Name].

Tone: Direct, powerful, motivating. Like a coach who believes in them.
Keep it under 250 words.`
        },
        {
          role: "user",
          content: `Person's name: ${name}. Primary path: ${primaryPath.name}. Secondary: ${secondPath.name}. Write their personalized sovereignty message.`
        }
      ],
      temperature: 0.8,
      max_tokens: 400
    });

    const personalizedMessage = completion.choices[0].message.content;

    // Construct email body
    const emailBody = `
🛡️ YOUR SOVEREIGNTY PATH ASSESSMENT RESULTS

Dear ${name},

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR PRIMARY PATH: ${primaryPath.name.toUpperCase()}

${primaryPath.focus.map(f => `• ${f}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DAILY PRACTICES FOR YOUR PATH:

${primaryPath.dailyPractices.map((p, i) => `${i + 1}. ${p}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 YOUR PERSONALIZED GUIDANCE:

${personalizedMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR SECONDARY PATH: ${secondPath.name}

Consider incorporating these practices as you master your primary path:
${secondPath.dailyPractices.slice(0, 3).map(p => `• ${p}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 READY TO START?

Create your free account and start tracking your daily sovereignty:
👉 https://www.sovereigntytracker.com/signup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Sovereignty is built through daily discipline, not grand gestures."

- The Sovereignty Tracker Team
    `.trim();

    // Send email via Mailgun
    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          from: `Sovereignty Tracker <noreply@${process.env.MAILGUN_DOMAIN}>`,
          to: email,
          subject: `Your Sovereignty Tracker: ${primaryPath.name}`,
          text: emailBody,
        })
      }
    );

    if (!mailgunResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: 'Results sent successfully'
    });

  } catch (error) {
    console.error('Error sending results:', error);
    return NextResponse.json(
      { error: 'Failed to send results' },
      { status: 500 }
    );
  }
}