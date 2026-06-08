# OPX Playbook Builder

**A production-ready, wizard-style "Prompt Factory" and "Static HTML Compiler" for creating bilingual (Arabic / Kurdish) corporate training matrices.**

No backend. No API keys. Everything runs 100% client-side with LocalStorage persistence.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (hot reload)
npm run dev
```

Open your browser at: **http://localhost:5173**

### Production Build

```bash
npm run build
```

The compiled output will be in `./dist`. Serve it with any static file host (Nginx, Apache, Vercel, Netlify, GitHub Pages, etc.).

```bash
# Preview production build locally
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| UI Components | Custom shadcn/ui-inspired components |
| Icons | Lucide React |
| State | React `useState` + `useEffect` only |
| Persistence | Browser `localStorage` |

### Project Structure

```
src/
├── components/
│   ├── ui/                  # Reusable UI primitives
│   │   ├── Alert.tsx        # Alert / notification component
│   │   ├── Badge.tsx        # Status badge component
│   │   ├── Button.tsx       # Button component (all variants)
│   │   ├── Card.tsx         # Card container components
│   │   ├── Dialog.tsx       # Modal dialog
│   │   ├── Input.tsx        # Text input
│   │   ├── Select.tsx       # Dropdown select
│   │   ├── Tabs.tsx         # Tab navigation
│   │   └── Textarea.tsx     # Multi-line text area
│   ├── steps/
│   │   ├── Step1Configure.tsx   # Context Configurator
│   │   ├── Step2Generate.tsx    # Prompt Factory
│   │   ├── Step3Ingest.tsx      # Payload Ingestor
│   │   ├── Step4Audit.tsx       # Bilingual Review Suite
│   │   └── Step5Export.tsx      # Compiler & Export Engine
│   └── Header.tsx           # Persistent wizard navigation header
├── data/
│   ├── industries.ts        # INDUSTRIES_DATA constant (20 sectors)
│   ├── seniority.ts         # SENIORITY_LEVELS constant (3 tiers)
│   └── i18n.ts              # UI_LABELS for i18n (EN/AR/KU)
├── lib/
│   ├── htmlExporter.ts      # Standalone HTML compiler engine
│   ├── localStorage.ts      # Session persistence helpers
│   ├── promptEngine.ts      # Execution prompt builder
│   ├── utils.ts             # Utility functions (cn, slugify, formatDate)
│   └── validator.ts         # JSON schema validator
├── types/
│   └── index.ts             # All TypeScript interfaces and types
├── App.tsx                  # Root component + wizard state machine
├── main.tsx                 # React entry point
└── index.css                # Tailwind base + global styles
```

---

## 🧩 The 5-Step Wizard

### Step 1: Configure (Context Configurator)
- Select from **20 industry sectors** with embedded focus areas and risk factors
- Enter a specific **job title / role**
- Choose one of **3 seniority tiers** (Entry / Junior / Senior)
- Optionally paste **company policy text** for contextual injection

### Step 2: Generate (Prompt Factory)
- Dynamically constructs a **~900-word precision execution prompt** by merging:
  - Industry knowledge (5 focus areas + 5 risks)
  - Job title and seniority tonal frame
  - Raw policy text injection (if provided)
  - Bilingual boilerplate with strict JSON schema instructions
- Copy to clipboard or download as `.txt`

### Step 3: Ingest (Payload Ingestor)
- Paste the AI-generated JSON into the large editor
- **Validate & Parse** button performs:
  1. JSON.parse() — surfaces exact syntax errors
  2. Schema check — verifies 60 stages × 10 fields each, 7 exams × 6 fields each
  3. Saves to `localStorage` on success

### Step 4: Audit (Bilingual Review & Editing Suite)
- **Stages tab**: Paginated table (10/page) with search, status badges, inline edit dialogs
- **Exams tab**: All 7 exams with inline editing
- Each edit saves immediately to localStorage
- **Run Full Validation** scans every stage for missing scenario fields

### Step 5: Export (Compiler & Export Engine)
- Sanity check preview of first 3 stages + first exam
- Build options:
  - **Anti-Copy Protection**: Disables right-click, F12, Ctrl+U/S/C, DevTools detection
  - **Bilingual Toggle UI**: English/Arabic/Kurdish language switcher
  - **Custom matrix title**
- Compiles a **fully self-contained `.html` file** with:
  - Vanilla CSS (zero external dependencies)
  - Embedded JSON payload
  - Progress tracker with click-to-navigate
  - Stage cards with 4 scenario type sections (colour-coded borders)
  - Exam milestone cards
  - Completion certificate section
- Filename format: `OPX_{JobTitle}_{Seniority}_{Date}.html`

---

## 💾 LocalStorage Keys

| Key | Content |
|-----|---------|
| `opx_config` | AppConfig (industry, jobTitle, seniorityId, policyText) |
| `opx_payload` | Full TrainingPayload (60 stages + 7 exams) |
| `opx_step` | Current wizard step (1–5) |
| `opx_export_options` | ExportOptions (antiCopy, bilingualToggle, matrixTitle) |

Session auto-restores on page refresh. "Start New Project" clears all keys.

---

## 🌐 Internationalization (i18n)

All UI labels are defined in `src/data/i18n.ts` as a typed object:

```typescript
const UI_LABELS: Record<string, I18nEntry> = {
  next: { en: 'Next', ar: 'التالي', ku: 'دواتر' },
  // ...
};
```

The application currently renders in **English** (`L(key)` returns `.en`). To switch the active language, change the `L` helper in `i18n.ts`:

```typescript
// Switch to Arabic:
export const L = (key: string): string => UI_LABELS[key]?.ar ?? key;

// Switch to Kurdish:
export const L = (key: string): string => UI_LABELS[key]?.ku ?? key;
```

---

## 📋 Knowledge Engine Data

### INDUSTRIES_DATA (20 sectors)
Each sector contains:
- `industry`: Sector name
- `focuses`: 5 core focus areas
- `risks`: 5 key risk factors

Sectors covered:
Oil & Gas, Banking & Financial Services, Healthcare & Hospitals, Real Estate & Construction, Telecommunications, Retail & FMCG, Manufacturing, Agriculture & Food Production, Energy & Utilities, Logistics & Supply Chain, Insurance, Education, Technology & Software, Pharmaceuticals & Biotech, Hospitality & Tourism, Mining & Metals, Media & Entertainment, Automotive, Government & Public Sector, Aviation & Aerospace

### SENIORITY_LEVELS (3 tiers)
| ID | Label | Tonal Frame |
|----|-------|------------|
| `entry` | Entry-Level / Operator | task adherence, procedure compliance, safety awareness |
| `junior` | Junior Management / Supervisor | team coordination, KPI monitoring, operational problem-solving |
| `senior` | Senior Management / Executive | P&L optimization, strategic risk, stakeholder governance |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "lucide-react": "^0.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^4.x",
    "typescript": "^5.x",
    "vite": "^6.x"
  }
}
```

---

## 🔒 Privacy & Security

- **Zero data transmission**: All processing happens in the browser.
- **No telemetry**: No analytics, no tracking.
- **No API keys**: The app is a prompt generator, not an AI executor. You paste the AI output from your own AI session.
- **LocalStorage only**: Data never leaves your device.

---

## 🤝 Supported AI Models (for Step 2 prompt)

The generated prompt is compatible with:
- **GPT-4o** / GPT-4 Turbo (recommended — largest context window)
- **Claude 3.5 Sonnet / Claude 3 Opus**
- **Gemini 1.5 Pro** / Gemini 2.0 Flash
- Any model with 30k+ token output capacity

**Tip**: Use GPT-4o with the instruction "Output only JSON, no markdown fences, no commentary."

---

*OPX Playbook Builder — Built for Arabic and Kurdish corporate training ecosystems.*
