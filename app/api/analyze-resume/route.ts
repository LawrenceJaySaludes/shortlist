import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const resumeText = formData.get("resumeText");
    const jobDescription = formData.get("jobDescription");

    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert resume reviewer, ATS evaluator, and recruiter.

Analyze the resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON only. Do not use markdown. Do not wrap the response in triple backticks.

Return this exact JSON structure:
{
  "overallScore": 85,
  "atsScore": 88,
  "skillsMatch": 82,
  "keywordMatch": 79,
  "formattingScore": 90,
  "summary": "A short professional summary explaining how well the resume matches the job description.",
  "missingKeywords": ["keyword 1", "keyword 2"],
  "matchedSkills": ["skill 1", "skill 2"],
"missingSkills": ["skill 1", "skill 2"],
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "lineReviews": [
    {
      "original": "Weak resume line from the actual resume",
      "issue": "Why this line is weak",
      "suggestedRewrite": "Better rewritten resume line"
    }
  ],
 "recruiterVerdict": {
  "atsPassProbability": "High",
  "shortlistProbability": "Moderate to High",
  "recommendation": "Apply after improving the weak lines."
},
"improvedResume": "Rewrite the resume into a stronger, job-targeted version based on the job description."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error) {
  console.error("ANALYZE_RESUME_ERROR:", error);

  const message =
    error instanceof Error ? error.message : "Unknown error";

  if (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand")
  ) {
    return NextResponse.json(
      {
        error:
          "AI is temporarily busy. Please try again in a few seconds.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      error: message,
    },
    { status: 500 }
  );
}
}