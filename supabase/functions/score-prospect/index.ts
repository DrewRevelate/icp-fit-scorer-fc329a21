import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ICPCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
}

interface ScoreRequest {
  companyInfo: string;
  criteria: ICPCriteria[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { companyInfo, criteria } = await req.json() as ScoreRequest;

    if (!companyInfo || !criteria || criteria.length === 0) {
      return new Response(
        JSON.stringify({ error: "Company info and criteria are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an ICP (Ideal Customer Profile) scoring expert for B2B sales. You analyze company information and score them against specific criteria.

You will receive company information and a list of scoring criteria with their weights. For each criterion, provide:
1. A score from 0 to the maximum weight (the weight is the max score for that criterion)
2. A brief reasoning (1 sentence) explaining the score

Also generate a personalized cold outreach opening line based on the analysis.

IMPORTANT: Extract the company name from the provided information. If not clear, use the first few words or "Unknown Company".

Respond ONLY with valid JSON in this exact format:
{
  "companyName": "extracted company name",
  "criteriaScores": [
    {
      "criteriaId": "criterion id",
      "score": number (0 to weight),
      "reasoning": "brief explanation"
    }
  ],
  "openingLine": "personalized cold outreach opening line"
}`;

    const userPrompt = `Analyze this company and score against the ICP criteria:

COMPANY INFORMATION:
${companyInfo}

SCORING CRITERIA (score each from 0 to its weight):
${criteria.map(c => `- ${c.name} (ID: ${c.id}, Max Score: ${c.weight}): ${c.description}`).join('\n')}

Return the JSON response with scores for each criterion and a personalized opening line.`;

    console.log("Calling Lovable AI Gateway for ICP scoring...");

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received, parsing...");

    // Parse the JSON from the response (handle markdown code blocks)
    let parsedResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Build the full response with criteria details
    const criteriaBreakdown = criteria.map(c => {
      const scoreData = parsedResult.criteriaScores?.find(
        (s: { criteriaId: string }) => s.criteriaId === c.id
      );
      return {
        criteriaId: c.id,
        criteriaName: c.name,
        score: Math.min(scoreData?.score ?? 0, c.weight),
        maxScore: c.weight,
        weight: c.weight,
        reasoning: scoreData?.reasoning ?? "Analysis not available",
        icon: getIconForCriteria(c.id),
      };
    });

    const totalScore = criteriaBreakdown.reduce((sum, c) => sum + c.score, 0);

    const result = {
      companyName: parsedResult.companyName || "Unknown Company",
      totalScore,
      criteriaBreakdown,
      openingLine: parsedResult.openingLine || "I'd love to connect and share how we can help your team.",
    };

    console.log("Scoring complete. Total score:", totalScore);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in score-prospect function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getIconForCriteria(id: string): string {
  const iconMap: Record<string, string> = {
    "company-size": "Users",
    "industry": "Building2",
    "revenue": "DollarSign",
    "tech-stack": "Cpu",
    "funding-stage": "TrendingUp",
    "region": "Globe",
  };
  return iconMap[id] || "Building2";
}
