import type { Source } from "./mockData";

// Use Next.js API route (no separate backend needed)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface AskVerumResponse {
  content: string;
  sources: Source[];
}

export async function askVerum(
  question: string,
  petType?: string
): Promise<AskVerumResponse> {
  const res = await fetch(`${API_BASE_URL || ""}/api/verum/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, petType }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to get response");
  }

  if (!data.success || !data.data) {
    throw new Error(data.message || "Invalid response from API");
  }

  const { content, sources } = data.data;
  if (typeof content !== "string") {
    throw new Error("Invalid response format");
  }

  return {
    content,
    sources: Array.isArray(sources)
      ? sources.map((s: { journal?: string; title?: string; year?: number; url?: string }) => ({
          journal: String(s?.journal ?? ""),
          title: String(s?.title ?? ""),
          year: Number(s?.year) || new Date().getFullYear(),
          url: String(s?.url ?? "#"),
        }))
      : [],
  };
}
