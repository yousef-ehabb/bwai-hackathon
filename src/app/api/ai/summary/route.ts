import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Fallback to manual load if process.env is not populated (needs restart)
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY=(.*)/);
      if (match) apiKey = match[1].trim();
    }
  } catch (e) {}
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { overview, rankings, breaches, summary } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an elite urban infrastructure analyst assistant for the City Governor. 
      Your task is to provide a high-level, executive summary based on the following real-time data from the "UrbanFix" platform.

      DATA OVERVIEW:
      - Total Reports: ${overview.totalReports}
      - Active Issues: ${overview.activeIssues}
      - Resolved Today: ${overview.resolvedToday}
      - Avg Resolution Time: ${overview.avgResolutionTime.toFixed(1)} hours
      - SLA Breach Count: ${overview.slaBreachCount}

      DISTRICT PERFORMANCE:
      ${rankings.slice(0, 5).map((r: any) => `- ${r.districtName}: ${r.resolutionRate.toFixed(1)}% resolution rate, ${r.pendingCount} pending`).join('\n')}

      SLA BREACHES:
      ${breaches.length > 0 ? breaches.map((b: any) => `- ${b.severity} breach in ${b.district}: ${b.category} (Exceeded by ${b.timeExceeded})`).join('\n') : "No active SLA breaches."}

      DAILY SUMMARY:
      - New Reports Today: ${summary.totalNewReports}
      - Resolved Today: ${summary.resolvedIssues}

      INSTRUCTIONS:
      1. Provide a professional, concise "Executive Command Summary" (max 150 words).
      2. Identify the most critical area requiring immediate intervention.
      3. Offer 1-2 strategic recommendations for the next 24 hours.
      4. Use a tone that is authoritative yet helpful.
      5. Format with clear headings and bullet points where appropriate.
      6. If there are no breaches, acknowledge the operational excellence.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 });
  }
}
