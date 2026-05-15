# FROM TEXT TO FEELING

AI-powered Korean sentiment analysis service using OpenAI API.

## Features
- Minimalist and responsive UI design.
- Real-time sentiment analysis (Positive, Negative, Neutral).
- Confidence score and reasoning provided by AI.
- Analysis history logging via Supabase.

## Tech Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript.
- **Backend**: Node.js, Express.
- **AI**: OpenAI Chat Completions API (GPT-4o-mini).
- **Database**: Supabase.

## Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory and fill in your keys:
   ```env
   OPENAI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3000
   ```

3. **Supabase Database Setup**:
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   create table if not exists sentiment_logs (
     id uuid primary key default gen_random_uuid(),
     input_text text not null,
     sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
     confidence integer not null check (confidence >= 0 and confidence <= 100),
     reason text not null,
     created_at timestamptz not null default now()
   );
   ```

4. **Run Server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## Deployment
This project is designed to be easily deployed on **Vercel**.
Ensure you add the environment variables in the Vercel project settings.
