import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MCQQuestion {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  conceptTags: string[];
}

interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  expectedAnswer: string;
  explanation: string;
  conceptTags: string[];
}

type QuizQuestion = MCQQuestion | ShortAnswerQuestion;

function validateMCQ(q: any): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!q || q.type !== "mcq") { reasons.push("not mcq"); return { valid: false, reasons }; }
  if (!Array.isArray(q.options) || q.options.length !== 4) reasons.push("must have exactly 4 options");
  if (Array.isArray(q.options) && new Set(q.options.map((o: string) => o.trim().toLowerCase())).size !== q.options.length) reasons.push("options not unique");
  if (!q.correctAnswer || (Array.isArray(q.options) && !q.options.includes(q.correctAnswer))) reasons.push("correctAnswer must match an option");
  if (!q.explanation || q.explanation.trim().length === 0) reasons.push("explanation empty");
  if (!Array.isArray(q.conceptTags) || q.conceptTags.length === 0) reasons.push("conceptTags missing");
  if (!q.question || q.question.trim().length === 0) reasons.push("question empty");
  return { valid: reasons.length === 0, reasons };
}

function validateShortAnswer(q: any): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!q || q.type !== "short_answer") { reasons.push("not short_answer"); return { valid: false, reasons }; }
  if (!q.question || q.question.trim().length === 0) reasons.push("question empty");
  if (!q.expectedAnswer || q.expectedAnswer.trim().length === 0) reasons.push("expectedAnswer empty");
  if (!q.explanation || q.explanation.trim().length === 0) reasons.push("explanation empty");
  if (!Array.isArray(q.conceptTags) || q.conceptTags.length === 0) reasons.push("conceptTags missing");
  return { valid: reasons.length === 0, reasons };
}

function tryFixMCQ(q: any): any {
  if (!q || q.type !== "mcq") return q;
  // Fix correctAnswer mismatch
  if (q.options && q.correctAnswer && !q.options.includes(q.correctAnswer)) {
    const match = q.options.find((o: string) => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
    if (match) q.correctAnswer = match;
    else {
      const partial = q.options.find((o: string) =>
        o.toLowerCase().includes(q.correctAnswer.toLowerCase()) ||
        q.correctAnswer.toLowerCase().includes(o.toLowerCase())
      );
      if (partial) q.correctAnswer = partial;
    }
  }
  return q;
}

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string, itemSchema: any, numQuestions: number) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_quiz",
          description: "Return the generated quiz questions.",
          parameters: {
            type: "object",
            properties: {
              questions: { type: "array", items: itemSchema },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_quiz" } },
    }),
  });

  if (!response.ok) {
    return { error: response.status, body: await response.text() };
  }

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured output");
  return { questions: JSON.parse(toolCall.function.arguments).questions as any[] };
}

const mcqSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["mcq"] },
    question: { type: "string" },
    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    correctAnswer: { type: "string" },
    explanation: { type: "string" },
    conceptTags: { type: "array", items: { type: "string" } },
  },
  required: ["type", "question", "options", "correctAnswer", "explanation", "conceptTags"],
  additionalProperties: false,
};

const shortAnswerSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["short_answer"] },
    question: { type: "string" },
    expectedAnswer: { type: "string" },
    explanation: { type: "string" },
    conceptTags: { type: "array", items: { type: "string" } },
  },
  required: ["type", "question", "expectedAnswer", "explanation", "conceptTags"],
  additionalProperties: false,
};

const mixedSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["mcq", "short_answer"] },
    question: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correctAnswer: { type: "string" },
    expectedAnswer: { type: "string" },
    explanation: { type: "string" },
    conceptTags: { type: "array", items: { type: "string" } },
  },
  required: ["type", "question", "explanation", "conceptTags"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, difficulty, questionType, numQuestions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeInstruction = questionType === "mcq"
      ? "Generate only multiple choice questions with type 'mcq'."
      : questionType === "short_answer"
        ? "Generate only short answer questions with type 'short_answer'."
        : "Generate a mix of 'mcq' and 'short_answer' questions.";

    const systemPrompt = `You are an expert quiz generator. Generate exactly ${numQuestions} questions about "${topic}" at difficulty level ${difficulty}/6 (1=beginner, 6=expert). ${typeInstruction}

CRITICAL RULES FOR MCQ QUESTIONS:
1. The "correctAnswer" field MUST be an EXACT character-for-character copy of one of the strings in the "options" array. Do not paraphrase or reword it.
2. All 4 options MUST be unique — no duplicates or near-duplicates.
3. The "explanation" MUST clearly justify WHY the correct answer is correct and why the other options are wrong.
4. Questions must be unambiguous and educational.
5. Respect the difficulty level: level 1 = beginner fundamentals, level 6 = expert-level nuances.
6. Each question must have at least one conceptTag identifying the concept being tested.`;

    let itemSchema;
    if (questionType === "mcq") itemSchema = mcqSchema;
    else if (questionType === "short_answer") itemSchema = shortAnswerSchema;
    else itemSchema = mixedSchema;

    const userPrompt = `Generate ${numQuestions} questions about ${topic} at difficulty ${difficulty}/6.`;

    const MAX_RETRIES = 3;
    let validQuestions: QuizQuestion[] = [];
    let retryCount = 0;

    while (validQuestions.length < numQuestions && retryCount < MAX_RETRIES) {
      const needed = numQuestions - validQuestions.length;
      const retryPrompt = retryCount === 0
        ? userPrompt
        : `Generate ${needed} MORE questions about ${topic} at difficulty ${difficulty}/6. These must be different from previously generated questions.`;

      const result = await callAI(LOVABLE_API_KEY, systemPrompt, retryPrompt, itemSchema, needed);

      if ("error" in result) {
        if (result.error === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (result.error === 402) {
          return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("AI error:", result.error, result.body);
        throw new Error("AI gateway error");
      }

      for (const q of result.questions) {
        if (validQuestions.length >= numQuestions) break;

        if (q.type === "mcq") {
          const fixed = tryFixMCQ(q);
          const { valid, reasons } = validateMCQ(fixed);
          if (valid) {
            validQuestions.push(fixed as MCQQuestion);
          } else {
            console.warn("Discarded invalid MCQ:", reasons, JSON.stringify(q));
          }
        } else if (q.type === "short_answer") {
          const { valid, reasons } = validateShortAnswer(q);
          if (valid) {
            validQuestions.push(q as ShortAnswerQuestion);
          } else {
            console.warn("Discarded invalid short_answer:", reasons, JSON.stringify(q));
          }
        }
      }

      retryCount++;
    }

    if (validQuestions.length === 0) {
      throw new Error("Failed to generate any valid questions after retries");
    }

    return new Response(JSON.stringify({ questions: validQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
