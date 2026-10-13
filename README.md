# 📄 MatchMy Resume

An AI-powered resume analyzer and ATS (Applicant Tracking System) optimization tool built with React and Vite. MatchMy Resume compares a candidate's resume against any target job description, generating comprehensive match scores, ATS compatibility ratings, missing keyword alerts, and actionable recommendations.

---

## ✨ Features

- **📄 Smart Resume Parsing**: 
  - Drag-and-drop or upload PDF and plain text (`.txt`) resumes.
  - Client-side PDF text extraction using PDF.js (`pdfjs-dist`) with web workers.
  - Live character count and manual text editing directly in the browser.

- **🤖 AI-Powered Match Analysis**:
  - Powered by Google Gemini (`gemini-2.5-flash`) via structured JSON schema generation.
  - Calculates an overall **Match Percentage** with color-coded status badges.
  - Detailed **Score Breakdown** across four dimensions:
    - 🛠️ **Skills**
    - 💼 **Experience**
    - 🎓 **Education**
    - 🏷️ **Keywords**

- **🎯 ATS Compatibility Scoring**:
  - Evaluates resume scanability on a scale of 0–100.
  - Identifies missing standard sections, headings, or structural problems that trip up automated applicant scanners.

- **🔍 Keyword Gap Analysis**:
  - Detects critical job keywords missing from your resume.
  - Displays missing terms as visual, easily scannable tags.

- **💡 Actionable Feedback & Suggestions**:
  - Highlights your key strengths and potential weaknesses for the specific role.
  - Outlines concrete, prioritized changes to tailor your resume.
  - Provides section-by-section feedback for Skills, Experience, and Education.

- **⚡ Resilient API Engine**:
  - Built-in exponential backoff retry mechanism for handling rate limits (HTTP 429) and network fluctuations.
  - Detailed error messages and diagnostics.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Bundler & Build Tool** | [Vite 7](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **AI / LLM Integration** | [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`) |
| **PDF Processing** | [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) |
| **File Upload** | [React Dropzone](https://react-dropzone.js.org/) |
| **Icons** | [React Icons (Feather Icons)](https://react-icons.github.io/react-icons/) |
| **Code Quality** | [ESLint 9](https://eslint.org/) |

---

## 📋 Prerequisites

Before getting started, make sure you have:

- **Node.js**: Version **20.19+** or **22.12+** (check with `node -v`).
- **npm**: Version **9+** (check with `npm -v`).
- **Google Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Anup050/MatchMy-Resume.git
cd MatchMy-Resume
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local    # if .env.example exists, or create manually
```

Add your Gemini API key:

```env
# Required: Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Gemini model override (defaults to gemini-2.5-flash)
VITE_GEMINI_MODEL=gemini-2.5-flash
```

> **Security Note**: Never commit `.env.local` or expose your API keys in version control. The `.env.local` file is already included in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start using the app.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory. |
| `npm run preview` | Runs a local server to preview the production build. |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues. |

---

## 📂 Project Structure

```text
MatchMy-Resume/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images and local static files
│   ├── components/         # Reusable UI components
│   │   ├── AnalysisResults.jsx    # Score displays, metrics, and suggestions
│   │   ├── ATSCompatibility.jsx  # ATS grading card & checklist
│   │   ├── FileUpload.jsx        # Drag-and-drop resume uploader
│   │   ├── ResumeEditor.jsx      # In-browser text editor & diff suggestions
│   │   └── ScoreBreakdown.jsx    # Visual categorical score charts
│   ├── App.jsx             # Main application orchestrator & API integration
│   ├── index.css           # Global Tailwind CSS definitions
│   └── main.jsx            # React root entry point
├── .env.local              # Local environment variables (API keys)
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Project dependencies and npm scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## 💡 How It Works

1. **Upload Resume**: Upload your resume as a `.pdf` or `.txt` file, or paste your text directly into the input area.
2. **Provide Job Description**: Paste the target job description or requirements into the Job Description field.
3. **Analyze Match**: Click the **Analyze Match** button to send a structured prompt to Gemini.
4. **Review Results**:
   - Inspect your overall match score and ATS readiness.
   - Review missing keywords and weave them naturally into your resume.
   - Follow tailored suggestions to optimize each section before submitting your application.

---

## 🔧 Troubleshooting

<details>
<summary><b>HTTP error! status: 404 from Gemini API</b></summary>

Ensure you are using a valid, active model. In `src/App.jsx`, the app defaults to `gemini-2.5-flash`. You can also configure `VITE_GEMINI_MODEL=gemini-2.5-flash` in `.env.local`.
</details>

<details>
<summary><b>Vite Node.js Version Warning</b></summary>

Vite 7 requires Node.js `20.19+` or `22.12+`. Check `node -v`. If an older local Node binary is overriding your system installation, verify that no conflicting `node` packages exist in parent `node_modules` folders.
</details>

<details>
<summary><b>PDF parsing issues</b></summary>

Ensure the PDF contains selectable text (not scanned images without OCR). Encrypted or password-protected PDFs should be decrypted or pasted as plain text.
</details>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
