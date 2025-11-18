import React, { useState, useEffect, useCallback } from "react";
// Tailwind CSS is assumed to be available.

// ✅ PDF.js via npm (Vite/Webpack-friendly)
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// --- 1. FileUpload Component ---
const FileUpload = ({ onTextExtracted, text }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // --- PDF PARSING LOGIC (ACTIVE) ---
  const readPdfFile = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const typedArray = new Uint8Array(e.target.result);

            const loadingTask = pdfjsLib.getDocument({ data: typedArray });
            const pdf = await loadingTask.promise;

            let fullText = "";
            const numPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              const strings = content.items.map((item) => item.str);
              fullText += strings.join(" ") + "\n\n";
            }

            resolve(fullText.trim());
          } catch (err) {
            console.error("PDF parse error:", err);
            reject(
              new Error(
                "Failed to read PDF file. Try another file or paste the text manually."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(new Error("Unable to read PDF file."));
        };

        reader.readAsArrayBuffer(file);
      } catch (err) {
        reject(err);
      }
    });
  };
  // --- END PDF PARSING LOGIC ---

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    let extractedText = "";

    try {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const isTxt =
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt");
      const isDoc =
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".docx");

      if (isPdf) {
        // ✅ Now actually parse the PDF
        extractedText = await readPdfFile(file);
      } else if (isTxt) {
        // Handle plain text files
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Failed to read text file."));
          reader.readAsText(file);
        });
      } else if (isDoc) {
        // Still not handling DOC/DOCX – ask user to convert or paste
        throw new Error(
          "Automatic parsing for DOC/DOCX is not supported. Please save as PDF/TXT or paste the content below."
        );
      } else {
        // Catch other binary types
        throw new Error(
          `Unsupported file type: ${file.name}. Please upload a PDF/TXT or paste the content manually.`
        );
      }

      onTextExtracted(extractedText);
    } catch (e) {
      setError(e.message);
      onTextExtracted(""); // Clear previous text on error
    } finally {
      setIsUploading(false);
      event.target.value = null; // Reset file input
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition duration-150">
      <input
        type="file"
        id="resume-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept=".txt,.pdf,.doc,.docx"
        disabled={isUploading}
      />
      <label htmlFor="resume-upload" className="cursor-pointer">
        <div className="flex flex-col items-center">
          <svg
            className="w-10 h-10 text-indigo-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4.903A5.989 5.989 0 0018 14h-1a1 1 0 01-1-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 01-1 1H7z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            {isUploading
              ? "Reading file..."
              : "Click to Upload Resume (PDF / TXT preferred)"}
          </p>
          <p className="text-xs text-gray-500 font-bold mt-1">
            DOC/DOCX files are not parsed automatically. Convert to PDF/TXT or
            paste below.
          </p>
        </div>
      </label>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="mt-4">
        <label
          htmlFor="resume-text"
          className="block text-sm font-medium text-gray-700 mb-2 text-left"
        >
          Resume Text Content
        </label>
        <textarea
          id="resume-text"
          value={text}
          onChange={(e) => onTextExtracted(e.target.value)}
          placeholder="Paste your resume content here or upload a PDF/TXT..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={6}
        />
        <p className="text-xs text-gray-500 text-left mt-1">
          {text.length} characters
        </p>
      </div>
    </div>
  );
};

// --- 2. AnalysisResults Component ---
const AnalysisResults = ({ analysis, loading, hasData, originalText }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-gray-600 font-medium">
          Analyzing document and generating detailed report...
        </p>
        <p className="text-sm text-gray-400 mt-1">This may take a moment.</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <p className="text-gray-500">Awaiting resume and job description input...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
        <svg
          className="w-12 h-12 text-yellow-500 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.503-1.657 1.625-3.042L13.625 5.042a2.983 2.983 0 00-5.25 0L4.313 15.958c-.878 1.385.085 3.042 1.625 3.042z"
          />
        </svg>
        <p className="text-gray-500">
          Click <span className="font-semibold">Analyze Match</span> to generate your
          report.
        </p>
      </div>
    );
  }

  // Safe defaults
  const {
    matchPercentage = 0,
    atsScore = 0,
    scoreBreakdown = {},
    missingKeywords = [],
    sectionFeedback = {},
    strengths = [],
    weaknesses = [],
    keyChanges = [],
    summary = "",
  } = analysis || {};

  const BreakdownItem = ({ label, score }) => (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className="font-semibold text-lg"
        style={{
          color:
            score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444",
        }}
      >
        {score}%
      </span>
    </div>
  );

  const FeedbackList = ({ title, items }) => {
    const safeItems = Array.isArray(items) ? items : [];

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          {safeItems.length > 0 ? (
            safeItems.map((item, index) => <li key={index}>{item}</li>)
          ) : (
            <li className="text-gray-400">
              No specific points found for this section.
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary and Key Scores */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex flex-col">
          <p className="text-gray-500 font-medium">Overall Match Score</p>
          <div
            className="text-6xl font-extrabold"
            style={{
              color:
                matchPercentage >= 75
                  ? "#10B981"
                  : matchPercentage >= 50
                  ? "#F59E0B"
                  : "#EF4444",
            }}
          >
            {matchPercentage}%
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 font-medium">ATS Score</p>
          <div className="text-4xl font-extrabold text-indigo-600">
            {atsScore}%
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Score Breakdown
        </h3>
        <BreakdownItem
          label="Keywords Match"
          score={scoreBreakdown?.keywords || 0}
        />
        <BreakdownItem
          label="Experience Alignment"
          score={scoreBreakdown?.experience || 0}
        />
        <BreakdownItem
          label="Skills Relevance"
          score={scoreBreakdown?.skills || 0}
        />
        <BreakdownItem
          label="Education Fit"
          score={scoreBreakdown?.education || 0}
        />
      </div>

      {/* AI Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Summary</h3>
        <p className="text-gray-700 text-sm leading-relaxed border-l-4 border-indigo-400 pl-4 py-2 bg-indigo-50 rounded-r-lg">
          {summary}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Top Strengths
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside pl-3">
            {(Array.isArray(strengths) ? strengths : []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Key Weaknesses
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside pl-3">
            {(Array.isArray(weaknesses) ? weaknesses : []).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">
          Missing Keywords
        </h3>
        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((k, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full"
              >
                {k}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-yellow-700">
            No critical keywords are currently missing. Great job!
          </p>
        )}
      </div>

      {/* Suggested Changes */}
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-700 mb-2">
          Suggested Key Changes
        </h3>
        <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside pl-3">
          {(Array.isArray(keyChanges) ? keyChanges : []).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ol>
      </div>

      {/* Detailed Section Feedback (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeedbackList title="Skills Feedback" items={sectionFeedback?.skills} />
        <FeedbackList
          title="Experience Feedback"
          items={sectionFeedback?.experience}
        />
        <FeedbackList
          title="Education Feedback"
          items={sectionFeedback?.education}
        />
      </div>
    </div>
  );
};

// --- 3. Main App Component ---

// JSON Schema for structured output
const analysisSchema = {
  type: "OBJECT",
  properties: {
    matchPercentage: {
      type: "NUMBER",
      description: "Overall match score (0-100)",
    },
    scoreBreakdown: {
      type: "OBJECT",
      properties: {
        skills: { type: "NUMBER" },
        experience: { type: "NUMBER" },
        education: { type: "NUMBER" },
        keywords: { type: "NUMBER" },
      },
    },
    atsScore: {
      type: "NUMBER",
      description: "Applicant Tracking System score (0-100)",
    },
    missingKeywords: { type: "ARRAY", items: { type: "STRING" } },
    sectionFeedback: {
      type: "OBJECT",
      properties: {
        skills: { type: "ARRAY", items: { type: "STRING" } },
        experience: { type: "ARRAY", items: { type: "STRING" } },
        education: { type: "ARRAY", items: { type: "STRING" } },
      },
    },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    weaknesses: { type: "ARRAY", items: { type: "STRING" } },
    keyChanges: { type: "ARRAY", items: { type: "STRING" } },
    summary: { type: "STRING" },
  },
  required: [
    "matchPercentage",
    "scoreBreakdown",
    "atsScore",
    "missingKeywords",
    "sectionFeedback",
    "strengths",
    "weaknesses",
    "keyChanges",
    "summary",
  ],
};

const App = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [originalResumeText, setOriginalResumeText] = useState("");

  // Exponential backoff retry handler
  const fetchWithRetry = useCallback(async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }, []);

  const extractJSON = (apiResponse) => {
    try {
      const candidate = apiResponse.candidates?.[0];
      const jsonText = candidate?.content?.parts?.[0]?.text;

      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        if (parsed && typeof parsed === "object") return parsed;
      }

      console.error("Full extraction failure. Raw response:", apiResponse);
      throw new Error("API returned an invalid or empty structured response.");
    } catch (e) {
      console.error("Failed to parse final JSON payload:", e);
      throw new Error(`Failed to process analysis: ${e.message}`);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText || !jobDescription) return;

    setLoading(true);
    setAnalysis(null);
    setApiError("");
    setOriginalResumeText(resumeText);

    try {
      const prompt = `ANALYSIS REQUEST:
You are a professional resume analyzer. Analyze the provided RESUME against the JOB DESCRIPTION.

TASK: Calculate all scores and provide detailed feedback exactly according to the requested JSON schema.

RESUME:
${resumeText.substring(0, 10000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env.local file."
        );
      }

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;


      const result = await fetchWithRetry(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const parsed = extractJSON(result);

      if (typeof parsed?.matchPercentage !== "number") {
        throw new Error(
          "Invalid analysis format received - missing matchPercentage"
        );
      }

      setAnalysis(parsed);
    } catch (error) {
      console.error("Full analysis error:", error);
      setApiError(
        `Analysis failed: ${error.message}. Please try again with different content.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      {/* In a real app, put Tailwind setup in your CSS / index.html, not here */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .rounded-xl { border-radius: 0.75rem; }
      `}</style>

      <header className="bg-white shadow-sm py-4 sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h1 className="ml-2 text-2xl font-bold text-gray-800">
              MatchMy Resume
            </h1>
          </div>
          <div className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            </svg>
            Powered by AI
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Analysis Error</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Resume & Job Details
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload your resume (PDF/TXT) and paste the job description to
                analyze
              </p>

              <div className="mb-8">
                <FileUpload
                  onTextExtracted={(text) => {
                    setResumeText(text);
                    setOriginalResumeText(text);
                  }}
                  text={resumeText}
                />
              </div>

              <div>
                <label
                  htmlFor="job-description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                  rows={6}
                />
              </div>

              <button
                onClick={analyzeResume}
                disabled={loading || !resumeText || !jobDescription}
                className={`mt-8 w-full py-3.5 rounded-lg transition-all duration-200 ${
                  loading || !resumeText || !jobDescription
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                } flex items-center justify-center font-medium`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Analyze Match
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Analysis Results
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {analysis
                  ? "Detailed match analysis"
                  : "Results will appear here after analysis"}
              </p>

              <AnalysisResults
                analysis={analysis}
                loading={loading}
                hasData={!!resumeText && !!jobDescription}
                originalText={originalResumeText}
              />
            </div>
          </div>
        </div>

        {!analysis && !loading && (
          <div className="mt-12 text-center">
            <div className="inline-block p-5 bg-indigo-50 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700">
              Ready to Analyze Your Resume
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Upload your resume and paste the job description to get detailed
              matching analysis and improvement suggestions
            </p>
          </div>
        )}
      </main>

      <footer className="py-8 mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="ml-2 text-lg font-semibold text-gray-800">
                MatchMy Resume
              </span>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right text-sm text-gray-500">
              <p>
                © {new Date().getFullYear()} MatchMy Resume. All rights
                reserved.
              </p>
              <p className="mt-1">
                AI-powered resume analysis and optimization
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
