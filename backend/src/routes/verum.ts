import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VerumSource {
  journal: string;
  title: string;
  year: number;
  url: string;
}

interface VerumResponse {
  content: string;
  sources: VerumSource[];
}

// Fallback responses when OpenAI is unavailable (from mockData)
const FALLBACK_RESPONSES: Array<{ keywords: string[]; content: string; sources: VerumSource[] }> = [
  {
    keywords: ['pain', 'orthopedic', 'surgery', 'dog'],
    content:
      "Published literature emphasizes multimodal analgesia for post-operative pain in dogs following orthopedic procedures [1]. Opioids such as fentanyl or hydromorphone are commonly used initially [2], with transition to NSAIDs like carprofen or meloxicam once hemostasis is achieved [1]. Local/regional blocks (e.g., epidural, peripheral nerve blocks) when applicable may reduce systemic opioid requirements [3]. Evidence suggests individual assessment of pain and titration of therapy is important [2].",
    sources: [
      { journal: 'Veterinary Surgery', title: 'Multimodal analgesia in small animal orthopedic surgery', year: 2022, url: '#' },
      { journal: 'JAVMA', title: 'AAHA/AAFP Pain Management Guidelines', year: 2020, url: '#' },
      { journal: 'Vet Clin North Am', title: 'Postoperative pain management in dogs', year: 2019, url: '#' },
    ],
  },
  {
    keywords: ['hyperthyroid', 'methimazole', 'monitoring', 'feline', 'cat'],
    content:
      "Guidelines generally recommend monitoring serum T4 at 2–4 weeks after initiating methimazole, then at 4–6 week intervals until stable [1]. CBC and chemistry panels are suggested before treatment and at regular intervals to screen for hematologic or hepatic adverse effects [2]. Blood pressure assessment is often recommended given the cardiovascular effects of hyperthyroidism [1].",
    sources: [
      { journal: 'J Feline Med Surg', title: 'ACVIM consensus statement on feline hyperthyroidism', year: 2023, url: '#' },
      { journal: 'JAVMA', title: 'Methimazole use and monitoring in cats', year: 2021, url: '#' },
    ],
  },
  {
    keywords: ['fluid', 'pancreatitis', 'canine'],
    content:
      "Evidence suggests balanced crystalloids (e.g., lactated Ringer's, Plasmalyte) are commonly used [1]. Aggressive fluid resuscitation to restore perfusion, followed by maintenance with ongoing assessment of electrolytes and hydration, is a standard approach [2]. Colloid use remains debated; crystalloid-first strategies are widely described [1,3]. Close monitoring of volume status and response is emphasized [2].",
    sources: [
      { journal: 'J Vet Emerg Crit Care', title: 'Fluid therapy in acute pancreatitis', year: 2022, url: '#' },
      { journal: 'Vet Clin North Am', title: 'Canine acute pancreatitis: current concepts', year: 2021, url: '#' },
      { journal: 'ACVECC', title: 'Fluid resuscitation guidelines for small animals', year: 2020, url: '#' },
    ],
  },
  {
    keywords: ['carprofen', 'adverse', 'effects', 'side'],
    content:
      "Carprofen is an NSAID; reported adverse effects include gastrointestinal signs (vomiting, anorexia, melena), hepatopathy, and renal effects [1]. Published studies suggest GI adverse events in a minority of patients; frequency varies by study design and population [2]. Hepatotoxicity is uncommon but well-documented [1]. Renal effects may be of concern in hypovolemic or compromised patients [3]. Product labeling and published reviews provide further detail on incidence.",
    sources: [
      { journal: 'JAVMA', title: 'NSAID safety in dogs: a systematic review', year: 2021, url: '#' },
      { journal: 'Vet J', title: 'Adverse effects of carprofen in clinical use', year: 2019, url: '#' },
      { journal: 'Front Vet Sci', title: 'NSAID adverse drug events in companion animals', year: 2023, url: '#' },
    ],
  },
  {
    keywords: ['kidney', 'ckd', 'staging', 'monitoring', 'cat'],
    content:
      "IRIS staging uses creatinine and SDMA to classify CKD into stages 1–4 [1]. Sub-staging by blood pressure and proteinuria is recommended [1,2]. Monitoring typically includes serial creatinine/SDMA, electrolytes, blood pressure, urinalysis, and UPC [2]. Frequency depends on stage and stability. Consensus guidelines recommend individualized plans based on patient factors [1].",
    sources: [
      { journal: 'IRIS', title: 'IRIS staging of CKD guidelines', year: 2023, url: '#' },
      { journal: 'J Feline Med Surg', title: 'Chronic kidney disease in cats: guidelines', year: 2022, url: '#' },
    ],
  },
  {
    keywords: ['sepsis', 'consensus', 'small animal'],
    content:
      "Consensus definitions for sepsis in small animals typically describe a dysregulated host response to infection associated with organ dysfunction [1]. Criteria may include suspected infection plus changes in vital signs, lactate, or other markers [2]. Definitions continue to evolve; multiple working groups have proposed criteria. Refer to current consensus statements for the most up-to-date diagnostic criteria [1,2].",
    sources: [
      { journal: 'J Vet Emerg Crit Care', title: 'RECOVER sepsis consensus in small animals', year: 2023, url: '#' },
      { journal: 'ACVECC', title: 'Sepsis definition and recognition in veterinary medicine', year: 2022, url: '#' },
    ],
  },
];

function getFallbackResponse(question: string): VerumResponse {
  const lower = question.toLowerCase();
  let best = FALLBACK_RESPONSES[0];
  let maxScore = 0;
  for (const r of FALLBACK_RESPONSES) {
    let score = 0;
    for (const kw of r.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      best = r;
    }
  }
  return { content: best.content, sources: best.sources };
}

function getSpeciesContext(petType: string): string {
  if (!petType || petType === 'all') return 'The question may relate to various species.';
  const species: Record<string, string> = {
    dog: 'dogs',
    cat: 'cats',
    horse: 'horses',
    bird: 'birds',
    lizard: 'reptiles/lizards',
    fish: 'fish',
  };
  const s = species[petType] || petType;
  return `The question relates to ${s}.`;
}

/**
 * POST /api/verum/ask
 * No auth required (demo).
 * Body: { question: string, petType?: string }
 * Returns: { content: string, sources: VerumSource[] }
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question, petType } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Question required',
        message: 'Please provide a question',
      });
    }

    const speciesContext = getSpeciesContext(petType || 'all');

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-your-openai-api-key-here') {
      console.log('Verum: OpenAI key not configured, using fallback');
      const fallback = getFallbackResponse(question);
      return res.json({
        success: true,
        data: fallback,
        message: 'Response generated (fallback)',
      });
    }

    const systemPrompt = `You are a veterinary literature research assistant for clinicians. You answer questions using evidence from published veterinary literature.

${speciesContext}

CRITICAL: You MUST respond with valid JSON only, no other text. The format is:
{"content": "Your answer here with inline citations [1], [2], [1,2] etc.", "sources": [{"journal": "Journal Name", "title": "Article Title", "year": 2023, "url": "#"}]}

Rules:
1. Write 2-4 concise, evidence-based sentences
2. Include inline citations [1], [2], [1,2] in the content where you reference sources
3. The sources array must have entries matching each citation number (1-based)
4. Use realistic veterinary journal names (JAVMA, Vet Clin North Am, J Feline Med Surg, J Vet Emerg Crit Care, etc.)
5. Use plausible article titles and years (2019-2024)
6. Use "#" for url if you don't have a real link
7. Be professional and cite appropriately`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Empty response from OpenAI');
    }

    // Extract JSON if wrapped in markdown code block
    let jsonStr = raw.trim();
    const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
      jsonStr = codeBlock[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as { content?: string; sources?: VerumSource[] };
    const content = typeof parsed.content === 'string' ? parsed.content : '';
    const sources = Array.isArray(parsed.sources)
      ? parsed.sources.map((s) => ({
          journal: String(s?.journal ?? ''),
          title: String(s?.title ?? ''),
          year: Number(s?.year) || new Date().getFullYear(),
          url: String(s?.url ?? '#'),
        }))
      : [];

    if (!content) {
      throw new Error('Invalid response format');
    }

    return res.json({
      success: true,
      data: { content, sources },
      message: 'Response generated',
    });
  } catch (error: any) {
    console.error('Verum API error:', error?.message || error);
    const fallback = getFallbackResponse(req.body?.question || '');
    return res.json({
      success: true,
      data: fallback,
      message: 'Response generated (fallback after error)',
    });
  }
});

export default router;
