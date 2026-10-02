import { supabaseAdmin } from '../../config/supabase';
import { callGemini, isGeminiConfigured } from './gemini.service';
import { aiChatResponseSchema } from '@scholarship-finder/shared';

interface ChatInput {
  message: string;
  scholarshipId?: string;
  history?: { sender: 'user' | 'assistant'; content: string }[];
}

export async function askScholarshipAssistant({ message, scholarshipId, history = [] }: ChatInput) {
  let contextScholarships: any[] = [];

  if (scholarshipId) {
    const { data: specific } = await supabaseAdmin
      .from('scholarships')
      .select(`
        *,
        provider:scholarship_providers(name, official_website),
        category:scholarship_categories(name),
        criteria:scholarship_eligibility_criteria(*)
      `)
      .eq('id', scholarshipId)
      .single();

    if (specific) {
      contextScholarships.push(specific);
    }
  }

  // Also query scholarships matching keywords from message
  const words = message.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
  let dbQuery = supabaseAdmin
    .from('scholarships')
    .select(`
      id, title, slug, short_description, funding_amount, funding_currency,
      application_deadline, official_application_url, official_source_url,
      education_levels, disciplines,
      provider:scholarship_providers(name)
    `)
    .eq('status', 'published')
    .limit(5);

  if (words.length > 0) {
    dbQuery = dbQuery.ilike('title', `%${words[0]}%`);
  }

  const { data: related } = await dbQuery;
  if (related) {
    for (const r of related) {
      if (!contextScholarships.some(s => s.id === r.id)) {
        contextScholarships.push(r);
      }
    }
  }

  // Fallback context if no specific matches
  if (contextScholarships.length === 0) {
    const { data: popular } = await supabaseAdmin
      .from('scholarships')
      .select(`
        id, title, slug, short_description, funding_amount, funding_currency,
        application_deadline, official_application_url, official_source_url,
        provider:scholarship_providers(name)
      `)
      .eq('status', 'published')
      .limit(3);
    if (popular) contextScholarships = popular;
  }

  // Format contextual records for prompt
  const recordsSummary = contextScholarships.map(s => ({
    id: s.id,
    title: s.title,
    provider: s.provider?.name,
    amount: s.funding_amount ? `${s.funding_currency || 'INR'} ${s.funding_amount}` : 'Not specified',
    deadline: s.application_deadline || 'Not specified',
    source_url: s.official_source_url,
    application_url: s.official_application_url,
    education_levels: s.education_levels,
    disciplines: s.disciplines,
    criteria: s.criteria?.map((c: any) => c.description || c.source_text) || []
  }));

  if (isGeminiConfigured()) {
    const prompt = `
Verified Scholarship Database Context:
${JSON.stringify(recordsSummary, null, 2)}

User Question: "${message}"

Recent Conversation:
${history.map(h => `${h.sender.toUpperCase()}: ${h.content}`).join('\n')}

Instructions:
Answer the student's question accurately using ONLY the supplied verified database context.
If the information is not in the database records, state that clearly and suggest verifying on the official source portal.
Never make up URLs, dates, or amounts.

Respond with valid JSON matching this schema:
{
  "answer": "A clear, helpful, structured student-friendly explanation",
  "source_references": [
    {
      "scholarship_id": "exact_id_from_context",
      "title": "exact_title",
      "source_url": "exact_source_url_from_context"
    }
  ],
  "related_scholarship_ids": ["exact_id_from_context"],
  "needs_clarification": false,
  "clarification_question": null,
  "information_limitations": []
}
`;

    try {
      const rawText = await callGemini(prompt);
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validated = aiChatResponseSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    } catch (err) {
      console.warn('[Assistant Service] Gemini parse error, using factual fallback:', err);
    }
  }

  // Graceful fallback when Gemini is offline or not configured
  const topScholarship = contextScholarships[0];
  const sourceRefs = contextScholarships.slice(0, 3).map(s => ({
    scholarship_id: s.id,
    title: s.title,
    source_url: s.official_source_url
  }));

  let fallbackAnswer = `Based on our verified scholarship database, we have relevant opportunities including **${topScholarship?.title || 'National Scholarship Programs'}**.`;
  if (topScholarship?.funding_amount) {
    fallbackAnswer += ` It offers financial aid of up to **${topScholarship.funding_currency || 'INR'} ${topScholarship.funding_amount}** with application deadline on **${topScholarship.application_deadline || 'scheduled dates'}**.`;
  }
  fallbackAnswer += `\n\nYou can review eligibility requirements and apply directly through the official provider link below.`;

  return {
    answer: fallbackAnswer,
    source_references: sourceRefs,
    related_scholarship_ids: contextScholarships.map(s => s.id),
    needs_clarification: false,
    clarification_question: null,
    information_limitations: ['Generated using verified database records. For custom conversational guidance, configure GEMINI_API_KEY.']
  };
}
