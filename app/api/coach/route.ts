// app/api/coach/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sovereignty principles and expert knowledge
const SOVEREIGNTY_KNOWLEDGE = {
  core_principles: [
    "Personal sovereignty is built through daily discipline across multiple domains",
    "Health, wealth, and freedom are interconnected - weakness in one erodes the others",
    "Small, consistent actions compound into unshakeable autonomy over time",
    "True freedom comes from internal systems, not external circumstances",
    "Your body, mind, and resources are your last pieces of private property",
  ],
  expert_knowledge: {
    huberman: {
      focus: "Neuroscience, circadian biology, performance optimization",
      principles: [
        "Morning sunlight exposure within 30-60 minutes of waking",
        "Delay caffeine 90-120 minutes after waking",
        "Fasted training for metabolic flexibility",
        "Cold exposure for resilience and dopamine regulation",
      ]
    },
    cavaliere: {
      focus: "Athletic training, injury prevention, functional strength",
      principles: [
        "Protein prioritization (0.8-1g per lb bodyweight)",
        "Train movements not muscles",
        "Progressive overload with perfect form",
        "Face pulls and rotator cuff work daily",
      ]
    },
    pollan: {
      focus: "Nutrition philosophy, food culture",
      principles: [
        "Eat food, not too much, mostly plants",
        "Don't eat anything your great-grandmother wouldn't recognize as food",
        "Eat only foods that will eventually rot",
        "The whiter the bread, the sooner you're dead",
      ]
    },
    hyman: {
      focus: "Functional medicine, systems thinking",
      principles: [
        "Food is medicine - what you eat controls your health destiny",
        "Eliminate inflammatory foods (sugar, processed oils, gluten)",
        "Optimize gut health as foundation of all health",
        "Focus on nutrient density over calorie counting",
      ]
    }
  }
};

// Create or get assistant (in production, store this ID)
let assistantId: string | null = null;

async function getOrCreateAssistant() {
  if (assistantId) return assistantId;

  const assistant = await openai.beta.assistants.create({
    name: "Sovereignty Coach",
    instructions: `You are the Sovereignty Coach, an expert in personal sovereignty through health, wealth, and daily discipline.

CORE PRINCIPLES:
${JSON.stringify(SOVEREIGNTY_KNOWLEDGE.core_principles, null, 2)}

EXPERT KNOWLEDGE:
${JSON.stringify(SOVEREIGNTY_KNOWLEDGE.expert_knowledge, null, 2)}

Your responses should:
1. Apply sovereignty principles to the user's questions
2. Reference relevant expert knowledge (Huberman, Cavaliere, Pollan, Hyman)
3. Provide actionable, specific guidance
4. Connect daily habits to larger sovereignty goals
5. Be concise but powerful (2-4 paragraphs max)
6. End with ONE specific action the user can take today

Tone: Direct, motivating, philosophical but practical. Like a wise coach who's been there.

Always remember: Sovereignty is built through daily discipline, not grand gestures.`,
    model: "gpt-4o",
    tools: [],
  });

  assistantId = assistant.id;
  return assistantId;
}

export async function POST(request: Request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create assistant
    const assistant = await getOrCreateAssistant();

    // Create thread
    const thread = await openai.beta.threads.create();

    // Add previous messages if any
    for (const msg of conversationHistory) {
      await openai.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant,
    });

    // Poll for completion - using correct v6.x syntax
    let runStatus = run;
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Correct v6.x syntax: path parameters
      runStatus = await openai.beta.threads.runs.retrieve(runStatus.id, {
        thread_id: thread.id
      });
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];
    
    if (lastMessage.content[0].type === 'text') {
      return NextResponse.json({
        response: lastMessage.content[0].text.value,
        threadId: thread.id,
      });
    }

    return NextResponse.json(
      { error: 'Unexpected response format' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to get coaching response' },
      { status: 500 }
    );
  }
}