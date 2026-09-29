# AI Translator (English • Русский • O‘zbekcha)

A modern, responsive, full-featured web translation application built with React, TypeScript, Tailwind CSS, and Google Gemini AI (`gemini-3.8-flash`).

Supports high-quality, natural translation in all six directions across English, Russian, and Uzbek, featuring Text-to-Speech (TTS), Voice Input (STT), translation history, language swap, light/dark themes, and server-side API key protection.

---

## 🌟 Features

- **3 Supported Languages & 6 Translation Directions**:
  - English ⇄ O‘zbekcha (Uzbek)
  - English ⇄ Русский (Russian)
  - Русский ⇄ O‘zbekcha (Uzbek)
- **Natural AI Translation**: Powered by Gemini 3.8 Flash with specialized linguistic prompts to preserve idiomatic expressions, tone, and grammar.
- **Microphone Voice Input (Speech-to-Text)**: Speak directly into the browser in English, Russian, or Uzbek using the Web Speech API.
- **Text-to-Speech (TTS) with Wave Visualizer**:
  - Audio playback button (🔊) and stop button (⏹)
  - Automatically matches speech engine voices for `en-US`, `ru-RU`, and `uz-UZ` with graceful fallback
  - Visual animated wave bars while speaking
- **Automatic & Manual Translation**:
  - Real-time debounced auto-translation as you type
  - Dedicated **Translate** button for instant manual execution
- **Instant Language & Content Swap (⇅)**: Flips source and target languages and swaps text seamlessly.
- **Copy & Clear**: One-click clipboard copy with feedback ("Copied!") and quick input reset.
- **Translation History**: Automatically stores recent translations in `localStorage` with click-to-restore and clear options.
- **Light & Dark Mode**: Persistent theme switcher with high-contrast accessibility.
- **Private API Key Architecture**: All Gemini calls run server-side (`/api/translate`); `GEMINI_API_KEY` is never exposed to the client.

---

## 📁 Project Structure

```text
├── api/
│   └── translate.ts        # Vercel Serverless Function handler for /api/translate
├── src/
│   ├── components/
│   │   ├── AudioWaveIndicator.tsx # Visual animated audio wave indicator
│   │   ├── Header.tsx             # App header with theme toggle & badge
│   │   ├── HistorySection.tsx     # Translation history list & restore actions
│   │   ├── LanguageDropdown.tsx   # Top-right corner language selector
│   │   └── PresetChips.tsx        # Quick 1-click example prompts
│   ├── lib/
│   │   ├── speech.ts              # Web Speech API services (TTS & STT)
│   │   └── translator.ts          # Core Gemini translation logic & fallback dict
│   ├── App.tsx                    # Main translator interface & state management
│   ├── index.css                  # Tailwind CSS imports & global styles
│   ├── main.tsx                   # React root mount
│   └── types.ts                   # TypeScript interfaces & language constants
├── .env.example                   # Template for environment variables
├── .gitignore                     # Git ignore rules (protects API keys)
├── index.html                     # HTML entry point with metadata & Google Fonts
├── metadata.json                  # AI Studio app metadata
├── package.json                   # Dependencies & scripts
├── server.ts                      # Express server (dev middleware & prod serving)
├── tsconfig.json                  # TypeScript compiler settings
├── vercel.json                    # Vercel deployment & routing configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## 1. How to Install the Project

Clone or download the repository, then install dependencies:

```bash
git clone https://github.com/your-username/ai-translator.git
cd ai-translator
npm install
```

---

## 2. How to Add the Gemini API Key

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

3. Open `.env` and add your key:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

> **Note:** `.env` is listed in `.gitignore` and will never be committed to GitHub or exposed to client browsers.

---

## 3. How to Run Locally

Start the local development server (Express + Vite with hot reload):

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:3000
```

To build and run in production mode:

```bash
npm run build
npm start
```

---

## 4. How to Upload to GitHub

1. Initialize Git repository (if not already initialized):

```bash
git init
```

2. Verify that `.env` is ignored:

```bash
git status
# Make sure .env is NOT in the untracked files list!
```

3. Commit your files:

```bash
git add .
git commit -m "Initial commit: AI Translator for English, Russian, Uzbek"
```

4. Create a new repository on [GitHub](https://github.com/new).

5. Link your local repo and push to GitHub:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 5. How to Deploy to Vercel

### Method A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository (`<your-repo-name>`).
4. In the **Configure Project** screen:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Proceed to **Environment Variables** (see Section 6 below).
6. Click **Deploy**.

### Method B: Deploy using Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 6. How to Configure Environment Variables in Vercel

1. In the Vercel Dashboard, go to your project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key
   - **Environments**: Check *Production*, *Preview*, and *Development*
4. Click **Save**.
5. If the project is already deployed, go to the **Deployments** tab, click **Redeploy** on the latest deployment for the new environment variable to take effect.

---

## 🧪 Translation Examples to Test

Try these sample sentences directly in the app (or click the quick example chips at the top):

1. **English → Uzbek**:
   - Input: `"Hello, how are you?"`
   - Output: `"Salom, qalaysiz?"`
2. **Uzbek → Russian**:
   - Input: `"Men maktabga boryapman."`
   - Output: `"Я иду в школу."`
3. **Russian → English**:
   - Input: `"Как тебя зовут?"`
   - Output: `"What is your name?"`

---

## 📄 License

Apache-2.0
