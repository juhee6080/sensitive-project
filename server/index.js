const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseServiceKey && !supabaseServiceKey.includes('YOUR_')) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.log('Supabase is not configured or using placeholders. Logging to DB disabled.');
}

/**
 * Sentiment Analysis API
 * POST /api/analyze
 */
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;

  // Validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: '분석할 텍스트를 입력해주세요.' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: '텍스트가 너무 깁니다. (최대 1000자)' });
  }

  try {
    // OpenAI API Request (Structured Output)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a stable model
      messages: [
        {
          role: "system",
          content: `너는 한국어 텍스트 감성 분석기다.
사용자 텍스트를 positive, negative, neutral 중 하나로 분류한다.
confidence는 0부터 100 사이의 정수로 작성한다.
reason은 한국어로 한 문장만 작성한다.
과장하지 말고 텍스트 근거만 사용한다.
반드시 JSON 형식으로만 응답하며, 키는 sentiment, confidence, reason이다.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Normalize output
    const sentiment = result.sentiment || 'neutral';
    const confidence = result.confidence || 0;
    const reason = result.reason || '분석 결과를 생성할 수 없습니다.';

    // Log to Supabase (if available)
    if (supabase) {
      const { error } = await supabase
        .from('sentiment_logs')
        .insert([
          { 
            input_text: text, 
            sentiment, 
            confidence, 
            reason 
          }
        ]);
      
      if (error) {
        console.error('Supabase logging failed:', error.message);
      }
    }

    res.json({
      sentiment,
      confidence,
      reason
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: '분석 중 문제가 발생했습니다. API 키와 설정을 확인해주세요.' 
    });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
