import { NextRequest, NextResponse } from "next/server";

interface VerumSource {
  journal: string;
  title: string;
  year: number;
  url: string;
  pmc_id?: string;
}

const FALLBACK_RESPONSES: Array<{ keywords: string[]; content: string; sources: VerumSource[] }> = [
  {
    keywords: ["pain", "orthopedic", "surgery", "dog"],
    content:
      "Published literature emphasizes multimodal analgesia for post-operative pain in dogs following orthopedic procedures [1]. Opioids such as fentanyl or hydromorphone are commonly used initially [2], with transition to NSAIDs like carprofen or meloxicam once hemostasis is achieved [1]. Local/regional blocks (e.g., epidural, peripheral nerve blocks) when applicable may reduce systemic opioid requirements [3]. Evidence suggests individual assessment of pain and titration of therapy is important [2].",
    sources: [
      { journal: "Veterinary Surgery", title: "Multimodal analgesia in small animal orthopedic surgery", year: 2022, url: "#" },
      { journal: "JAVMA", title: "AAHA/AAFP Pain Management Guidelines", year: 2020, url: "#" },
      { journal: "Vet Clin North Am", title: "Postoperative pain management in dogs", year: 2019, url: "#" },
    ],
  },
  {
    keywords: ["hyperthyroid", "methimazole", "monitoring", "feline", "cat"],
    content:
      "Guidelines generally recommend monitoring serum T4 at 2–4 weeks after initiating methimazole, then at 4–6 week intervals until stable [1]. CBC and chemistry panels are suggested before treatment and at regular intervals to screen for hematologic or hepatic adverse effects [2]. Blood pressure assessment is often recommended given the cardiovascular effects of hyperthyroidism [1].",
    sources: [
      { journal: "J Feline Med Surg", title: "ACVIM consensus statement on feline hyperthyroidism", year: 2023, url: "#" },
      { journal: "JAVMA", title: "Methimazole use and monitoring in cats", year: 2021, url: "#" },
    ],
  },
  {
    keywords: ["fluid", "pancreatitis", "canine"],
    content:
      "Evidence suggests balanced crystalloids (e.g., lactated Ringer's, Plasmalyte) are commonly used [1]. Aggressive fluid resuscitation to restore perfusion, followed by maintenance with ongoing assessment of electrolytes and hydration, is a standard approach [2]. Colloid use remains debated; crystalloid-first strategies are widely described [1,3]. Close monitoring of volume status and response is emphasized [2].",
    sources: [
      { journal: "J Vet Emerg Crit Care", title: "Fluid therapy in acute pancreatitis", year: 2022, url: "#" },
      { journal: "Vet Clin North Am", title: "Canine acute pancreatitis: current concepts", year: 2021, url: "#" },
      { journal: "ACVECC", title: "Fluid resuscitation guidelines for small animals", year: 2020, url: "#" },
    ],
  },
];

function getFallbackResponse(question: string): { content: string; sources: VerumSource[] } {
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

export async function POST(req: NextRequest) {
  let question = "";
  try {
    const body = await req.json();
    const parsed = body || {};
    question = parsed.question ?? "";
    const petType = parsed.petType;
    
    // Clean up the question - remove extra quotes and trim
    question = question.trim().replace(/^["']|["']$/g, '');
    
    console.log("📝 Received question:", question);
    
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { success: false, error: "Question required", message: "Please provide a question" },
        { status: 400 }
      );
    }

    // Get RAG backend URL from environment
    const ragBackendUrl = process.env.VERUM_RAG_BACKEND_URL || "http://localhost:8000";
    console.log("🔗 RAG Backend URL:", ragBackendUrl);
    
    try {
      // Call the RAG backend API
      console.log("🚀 Calling RAG backend...");
      const response = await fetch(`${ragBackendUrl}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          petType: petType || "all",
          top_k: 5,
        }),
      });

      console.log("📡 Backend response status:", response.status);

      if (!response.ok) {
        throw new Error(`RAG backend returned ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Got response from RAG backend");
      
      if (data.success && data.data) {
        return NextResponse.json({
          success: true,
          data: {
            content: data.data.content,
            sources: data.data.sources || [],
          },
          message: "Response from RAG system",
        });
      } else {
        throw new Error("Invalid response from RAG backend");
      }
      
    } catch (backendError) {
      console.error("❌ RAG backend error:", backendError);
      console.log("⚠️ Falling back to mock response");
      
      // Fallback to mock responses if backend is unavailable
      const fallback = getFallbackResponse(question);
      return NextResponse.json({
        success: true,
        data: fallback,
        message: "Response generated (fallback - RAG backend unavailable)",
      });
    }
    
  } catch (error: unknown) {
    console.error("Verum API error:", error);
    const fallback = getFallbackResponse(question || "");
    return NextResponse.json({
      success: true,
      data: fallback,
      message: "Response generated (fallback after error)",
    });
  }
}
