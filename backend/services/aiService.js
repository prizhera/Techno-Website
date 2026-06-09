import { PDFParse } from "pdf-parse";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function aiCompletion(systemPrompt, userPrompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  // Gemini keys start with AIza, Groq keys start with gsk_
  const isGemini = key.startsWith("AIza");

  if (isGemini) {
    const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Gemini API error:", res.status, text.slice(0, 300));
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  }

  // OpenAI-compatible (Groq, etc.)
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Groq API error:", res.status, text.slice(0, 300));
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

export async function generateQuestionInsight(questionText, topic, mistakeDistribution, teacherNote) {
  const systemPrompt = "You are a teaching assistant analyzing student mistakes. Respond concisely in 2-3 sentences.";
  const userPrompt = `Question: "${questionText}" (Topic: ${topic})\n\nMistake distribution:\n${Object.entries(mistakeDistribution).map(([label, count]) => `- ${label}: ${count} students`).join("\n")}\n\nTeacher observation: ${teacherNote || "None provided"}\n\nGenerate a concise 2-sentence insight about the most common struggle and one specific teaching recommendation.`;

  const result = await aiCompletion(systemPrompt, userPrompt);
  return result ?? "Unable to generate AI insight at this time.";
}

export async function extractTextFromPdfBase64(pdfBase64) {
  const raw = pdfBase64.replace(/^data:application\/pdf;base64,/, "").replace(/^data:application\/octet-stream;base64,/, "");
  const buf = Buffer.from(raw, "base64");
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  return result.text ?? "";
}

export async function generateStudentFeedback(studentName, mistakes, weakestTopic) {
  const systemPrompt = "You are a supportive tutor giving feedback to a student. Respond concisely in 2-3 sentences.";
  const userPrompt = `Student ${studentName} made these mistakes:\n${mistakes.slice(0, 5).map((m) => `- ${m.topic}: ${m.mistakeType}`).join("\n")}\n\nGenerate a supportive 2-sentence feedback and one specific practice recommendation focusing on ${weakestTopic}.`;

  const result = await aiCompletion(systemPrompt, userPrompt);
  return result ?? "Unable to generate AI feedback at this time.";
}

export async function extractQuestionsFromExam(examText) {
  const systemPrompt = `You are a teaching assistant that extracts questions from exam text. 
Return ONLY a valid JSON array of objects, no markdown, no explanation. 
Each object must have: "question_number" (number), "question_text" (string), "topic" (string).
Example: [{"question_number":1,"question_text":"Find the derivative of x^2","topic":"Basic Differentiation"}]
If the text is not an exam paper, return an empty array.`;

  const result = await aiCompletion(systemPrompt, `Extract questions from this exam text:\n\n${examText}`);

  if (!result) return [];

  try {
    const cleaned = result.replace(/```json\s*/i, "").replace(/```\s*$/m, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export async function chatCompletion(messages, context) {
  const systemPrompt = `You are a teaching assistant helping a teacher analyze student performance. You ONLY answer questions about education, teaching, student performance, and classroom strategy. If asked about anything unrelated, politely decline and redirect to teaching topics.
You have access to TRACE analytics data about mistake patterns.

Keep responses concise (2-4 sentences unless asked for detail).
Be supportive and practical — suggest actionable teaching strategies.

${context ? `Current context: ${JSON.stringify(context)}` : ""}`;

  const lastMsg = messages[messages.length - 1]?.content ?? "";
  const result = await aiCompletion(systemPrompt, lastMsg);
  return result ?? "Unable to get AI response at this time.";
}

export async function generateExam(topics, numQuestions, classContext) {
  const systemPrompt = `You are a teaching assistant that generates exam questions targeting specific weak topics.
Return ONLY a valid JSON array of objects, no markdown, no explanation.
Each object must have: "question_number" (number), "question_text" (string), "topic" (string), "answer" (string).`;

  const userPrompt = `Generate ${numQuestions} exam questions${classContext ? ` for ${classContext}` : ""}.
Target these weak topics: ${topics.join(", ")}.
Distribute the questions across topics based on how weak each topic is.
Make questions progressively harder. Return a JSON array.`;

  const result = await aiCompletion(systemPrompt, userPrompt);
  if (!result) return [];

  try {
    const cleaned = result.replace(/```json\s*/i, "").replace(/```\s*$/m, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}
