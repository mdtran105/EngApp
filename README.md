# English101: AI-powered English Learning Platform

English101 is a modern web application designed to help Vietnamese learners improve their English skills through interactive AI-powered features. The platform provides smart dictionary lookups, AI chat for speaking practice, writing evaluation, and assignment generation, all tailored to the user's proficiency level.

## Features

- **Smart Dictionary**: Look up words, idioms, and phrasal verbs with context-aware explanations, IPA, and audio pronunciation.
- **AI Chat Tutor**: Practice English conversation with an AI tutor (powered by GPT-4), which always responds in English to help improve speaking and reflexes.
- **Writing Practice**: Submit essays and receive instant feedback and scoring.
- **Assignment Generator**: Create and solve English assignments based on your level and interests.
- **Personalized Experience**: Onboarding flow to collect user info and adapt content accordingly.
- **Modern UI/UX**: Responsive, dark mode, and beautiful design using Tailwind CSS and ShadCN UI.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, ShadCN UI, Radix UI
- **Backend**: Node.js, Express.js
- **AI Models**:
  - **Chat**: Google Gemini (as English tutor)
  - **Dictionary & Translation**: Google Gemini (Generative AI) for context-aware explanations and translation
- **Other**: LocalStorage for user preferences, RESTful API, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Setup & Run Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd english-chatbot
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and update API keys if needed (e.g., `NEXT_PUBLIC_API_DOMAIN`, Gemini API key, OpenAI API key for backend).

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

5. **(Optional) Start the backend server:**
   - Go to the `server/` directory and follow its README/setup instructions if you want to run the backend locally.

## Project Structure

- `client/` – Frontend source code (Next.js, React, UI components)
- `server/` – Backend API (Express.js, AI integration)
- `public/` – Static assets
- `README.md` – Project documentation

## Model & AI Integration

- **Chat**: Uses Google Gemini to simulate an English tutor, always responding in English and focusing on speaking practice.
- **Dictionary & Translation**: Uses Google Gemini (Generative AI) to provide context-aware, Vietnamese explanations, IPA, and audio.
