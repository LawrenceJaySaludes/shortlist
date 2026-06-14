"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import Swal from "sweetalert2";


type LineReview = {
  original: string;
  issue: string;
  suggestedRewrite: string;
};

type RecruiterVerdict = {
  atsPassProbability: string;
  shortlistProbability: string;
  recommendation: string;
};

type AnalysisResult = {
  overallScore: number;
  atsScore: number;
  skillsMatch: number;
  keywordMatch: number;
  formattingScore: number;
  summary: string;
  missingKeywords: string[];
  matchedSkills: string[];
missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  lineReviews: LineReview[];
  recruiterVerdict: RecruiterVerdict;
  improvedResume: string;
};

const sampleResume = `Alex Johnson
Junior Web Developer

Summary
Entry-level web developer with hands-on experience building responsive websites and web applications using React, JavaScript, HTML, CSS, Node.js, REST APIs, MySQL, Git, and GitHub.

Experience
BrightTech Solutions - Junior Web Developer Intern
- Worked on frontend pages using React and CSS.
- Fixed UI bugs and improved page responsiveness.
- Helped connect frontend components to backend APIs.
- Used Git and GitHub for version control and team collaboration.
- Assisted in testing website features before deployment.

Projects
TaskFlow App
- Built a task management web app using React, Node.js, Express, and MySQL.
- Implemented task creation, editing, deletion, and status updates.
- Designed a responsive dashboard for desktop and mobile users.

ShopEase Landing Page
- Created a responsive landing page for an online store using HTML, CSS, and JavaScript.
- Improved layout, navigation, and call-to-action sections.

Skills
React, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Node.js, Express, REST APIs, MySQL, Git, GitHub, Responsive Design`;

const sampleJobDescription = `We are looking for a Junior Web Developer with experience in React, JavaScript, HTML, CSS, REST APIs, Git, GitHub, MySQL, and responsive web design. The candidate should be able to build user-friendly interfaces, connect frontend features with backend APIs, troubleshoot bugs, and collaborate with a development team.`;

function cleanJsonResponse(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export default function AnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawResult, setRawResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    setError("Please upload a valid PDF file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("File size exceeds 5MB.");
    return;
  }

  try {
    setError("");

    const pdfToText = (await import("react-pdftotext")).default;
    const text = await pdfToText(file);

    setResumeText(text);
  } catch {
    setError(
      "Unable to extract text from this PDF. Please paste your resume manually."
    );
  }
}

  async function handleAnalyze() {
    if (!resumeText.trim()) {
      setError("Please paste your resume text or use the sample resume.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description or use the sample job description.");
      return;
    }

    try {
      setError("");
      setResult(null);
      setRawResult("");
     setIsLoading(true);
setLoadingStep("Reading resume...");

setTimeout(() => {
  setLoadingStep("Comparing skills...");
}, 1000);

setTimeout(() => {
  setLoadingStep("Calculating ATS score...");
}, 2000);

setTimeout(() => {
  setLoadingStep("Generating AI feedback...");
}, 3000);

setTimeout(() => {
  setLoadingStep("Building improved resume draft...");
}, 4000);

      const formData = new FormData();
      formData.append("resumeText", resumeText);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

     const cleaned = cleanJsonResponse(data.result);

const jsonStart = cleaned.indexOf("{");
const jsonEnd = cleaned.lastIndexOf("}");

if (jsonStart === -1 || jsonEnd === -1) {
  console.error("Invalid AI response:", cleaned);
  setError("AI returned an invalid format. Please try again.");
  return;
}

const jsonOnly = cleaned.slice(jsonStart, jsonEnd + 1);
const parsed = JSON.parse(jsonOnly) as AnalysisResult;

setResult(parsed);
setRawResult(jsonOnly);

    } catch {
      setError("AI returned an invalid format. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  }

  function handleDownloadReport() {
  if (!result) return;

  const doc = new jsPDF();
  const report = `
AI Resume Analysis Report

Overall Score: ${result.overallScore}/100
ATS Score: ${result.atsScore}%
Skills Match: ${result.skillsMatch}%
Keyword Match: ${result.keywordMatch}%
Formatting Score: ${result.formattingScore}%

Missing Keywords:
${result.missingKeywords.map((item) => `- ${item}`).join("\n")}

Strengths:
${result.strengths.map((item) => `- ${item}`).join("\n")}

Weaknesses:
${result.weaknesses.map((item) => `- ${item}`).join("\n")}

Recruiter Verdict:
ATS Pass Probability: ${result.recruiterVerdict.atsPassProbability}
Shortlist Probability: ${result.recruiterVerdict.shortlistProbability}
Recommendation: ${result.recruiterVerdict.recommendation}

AI Improved Resume Draft:
${result.improvedResume}
`;

  const lines = doc.splitTextToSize(report, 180);
  doc.text(lines, 15, 20);
  doc.save("resume-analysis-report.pdf");
}

function handleClearAll() {
  setResumeText("");
  setJobDescription("");
  setError("");
  setResult(null);
  setRawResult("");
}

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <a href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← Back to home
        </a>

        <h1 className="mt-8 text-3xl font-bold md:text-5xl">
          Analyze your resume
        </h1>

        <p className="mt-4 text-slate-300">
          Paste your resume and job description to get AI-powered ATS feedback,
          missing keywords, line reviews, and recruiter verdict.
        </p>

        <div className="mt-10 grid gap-6">
<button
  type="button"
  onClick={async () => {
    await navigator.clipboard.writeText(`
AI Resume Analysis Report

Overall Score: ${result!.overallScore}/100
ATS Score: ${result!.atsScore}%
Skills Match: ${result!.skillsMatch}%
Keyword Match: ${result!.keywordMatch}%
Formatting Score: ${result!.formattingScore}%

Missing Keywords:
${result!.missingKeywords.map((item) => `- ${item}`).join("\n")}

Strengths:
${result!.strengths.map((item) => `- ${item}`).join("\n")}

Weaknesses:
${result!.weaknesses.map((item) => `- ${item}`).join("\n")}

Recruiter Verdict:
ATS Pass Probability: ${result!.recruiterVerdict.atsPassProbability}
Shortlist Probability: ${result!.recruiterVerdict.shortlistProbability}
Recommendation: ${result!.recruiterVerdict.recommendation}

AI Improved Resume Draft:
${result!.improvedResume}
`);

    Swal.fire({
      title: "Copied!",
      text: "Analysis report copied successfully.",
      icon: "success",
      background: "#020617",
      color: "#ffffff",
      confirmButtonColor: "#06b6d4",
    });
  }}
  className="rounded-xl border border-cyan-400/40 px-6 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
>
  Copy Analysis Report
</button>

<button
  type="button"
  onClick={handleDownloadReport}
  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
>
  Download PDF Report
</button>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <label className="block text-sm font-medium text-slate-200">
                Resume Text
              </label>

              <button
                type="button"
                onClick={() => setResumeText(sampleResume)}
                className="rounded-lg border border-cyan-400/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/10"
              >
                Use Sample Resume
              </button>
            </div>

            <input
  type="file"
  accept="application/pdf"
  onChange={handlePdfUpload}
  className="mt-4 block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-300"
/>

<p className="mt-2 text-xs text-slate-500">
  Optional: Upload a PDF to auto-fill the resume text box. Max 5MB.
</p>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="mt-4 min-h-72 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <label className="block text-sm font-medium text-slate-200">
                Job Description
              </label>

              <button
                type="button"
                onClick={() => setJobDescription(sampleJobDescription)}
                className="rounded-lg border border-cyan-400/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/10"
              >
                Use Sample Job Description
              </button>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="mt-4 min-h-52 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
<div className="grid gap-3 md:grid-cols-2">
  <button
    type="button"
    onClick={handleAnalyze}
    disabled={isLoading}
    className="rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isLoading ? "Analyzing..." : result ? "Analyze Again" : "Analyze Resume"}
  </button>

  <button
    type="button"
    onClick={handleClearAll}
    className="rounded-xl border border-slate-700 px-6 py-4 font-semibold text-slate-300 transition hover:bg-slate-900"
  >
    Clear All
  </button>
</div>

          {isLoading && (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6 text-cyan-300">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
               <p>{loadingStep || "Analyzing resume..."}</p>
              </div>
            </div>
          )}

          {result && (
            <section className="grid gap-6">
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm text-cyan-300">Overall Match Score</p>
      <h2 className="mt-2 text-5xl font-bold text-white">
        {result.overallScore}/100
      </h2>
    </div>

    <span className="w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
      {getMatchLevel(result.overallScore)}
    </span>
  </div>

  <div className="mt-6 h-3 rounded-full bg-slate-800">
    <div
      className="h-3 rounded-full bg-cyan-400"
      style={{ width: `${result.overallScore}%` }}
    />
  </div>
</div>

<div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
  <h2 className="text-2xl font-bold text-cyan-300">
    Resume Match Summary
  </h2>

  <p className="mt-4 leading-relaxed text-slate-300">
    {result.summary}
  </p>
</div>

<div className="grid gap-6 md:grid-cols-2">
  <ListCard title="Matched Skills" items={result.matchedSkills} />
  <ListCard title="Missing Skills" items={result.missingSkills} />
</div>

              <div className="grid gap-4 md:grid-cols-4">
                <ScoreCard title="ATS Score" value={result.atsScore} />
                <ScoreCard title="Skills Match" value={result.skillsMatch} />
                <ScoreCard title="Keyword Match" value={result.keywordMatch} />
                <ScoreCard title="Formatting" value={result.formattingScore} />
              </div>

              <ListCard title="Missing Keywords" items={result.missingKeywords} />
              <ListCard title="Strengths" items={result.strengths} />
              <ListCard title="Weaknesses" items={result.weaknesses} />

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h2 className="text-2xl font-bold text-cyan-300">
                  Smart Resume Line Review
                </h2>

                <div className="mt-4 grid gap-4">
                  {result.lineReviews.map((line, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                    >
                      <p className="text-sm text-slate-400">Original</p>
                      <p className="mt-1 text-slate-200">{line.original}</p>

                      <p className="mt-4 text-sm text-slate-400">Issue</p>
                      <p className="mt-1 text-red-300">{line.issue}</p>

                      <p className="mt-4 text-sm text-slate-400">
                        Suggested Rewrite
                      </p>
                      <p className="mt-1 text-cyan-300">
                        {line.suggestedRewrite}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <h2 className="text-2xl font-bold text-cyan-300">
                  Recruiter Verdict
                </h2>

                <div className="mt-4 grid gap-3 text-slate-300">
                  <p>
                    <span className="text-slate-500">ATS Pass Probability:</span>{" "}
                    {result.recruiterVerdict.atsPassProbability}
                  </p>
                  <p>
                    <span className="text-slate-500">Shortlist Probability:</span>{" "}
                    {result.recruiterVerdict.shortlistProbability}
                  </p>
                  <p>
                    <span className="text-slate-500">Recommendation:</span>{" "}
                    {result.recruiterVerdict.recommendation}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
  <h2 className="text-2xl font-bold text-cyan-300">
    AI Improved Resume Draft
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    AI-generated version optimized for the selected job description.
  </p>

  <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-300">
    {result.improvedResume}
  </pre>
</div>
              </div>
            </section>
          )}
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-800 py-8 text-center">
  <p className="text-sm text-slate-500">
    By using ShortList, you acknowledge that AI-generated results are provided
    for informational purposes only and should not be considered professional
    career, hiring, or recruitment advice. Users are responsible for reviewing
    and verifying all recommendations before use.
  </p>

  <p className="mt-6 text-xs text-slate-600">
    © 2026 ShortList. All rights reserved.
  </p>

  <p className="mt-2 text-xs text-slate-600">
    Developed by Lawrence Saludes.
  </p>
</footer>

    </main>


  );
}

function ScoreCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="font-bold text-cyan-300">{value}%</p>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-cyan-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function getMatchLevel(score: number) {
  if (score >= 90) return "🏆 Excellent Candidate";
  if (score >= 80) return "✅ Strong Candidate";
  if (score >= 70) return "⚠️ Potential Candidate";
  return "Needs Improvement";
}


function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <h2 className="text-2xl font-bold text-cyan-300">{title}</h2>

      <ul className="mt-4 grid gap-2 text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="rounded-lg bg-slate-900 p-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}