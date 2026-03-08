import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const systemPrompt = `You are an expert quiz generator. Generate exactly ${numQuestions} questions about "${topic}" at difficulty level ${difficulty}/6 (1=beginner, 6=expert). ${typeInstruction}`;

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

    let itemSchema;
    if (questionType === "mcq") {
      itemSchema = mcqSchema;
    } else if (questionType === "short_answer") {
      itemSchema = shortAnswerSchema;
    } else {
      itemSchema = { oneOf: [mcqSchema, shortAnswerSchema] };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${numQuestions} questions about ${topic} at difficulty ${difficulty}/6.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_quiz",
              description: "Return the generated quiz questions.",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: itemSchema,
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    
    // Extract from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      throw new Error("AI did not return structured output");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
