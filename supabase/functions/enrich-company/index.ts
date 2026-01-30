import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EnrichRequest {
  url: string;
}

interface EnrichedCompany {
  companyName: string;
  description: string;
  industry: string;
  companySize: string;
  estimatedRevenue: string;
  fundingStage: string;
  techStack: string[];
  region: string;
  website: string;
  rawContent: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured. Please connect Firecrawl in Settings.");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { url } = await req.json() as EnrichRequest;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Step 1: Scraping company website with Firecrawl:", formattedUrl);

    // Step 1: Scrape the website with Firecrawl
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.text();
      console.error("Firecrawl error:", scrapeResponse.status, errorData);
      throw new Error(`Failed to scrape website: ${scrapeResponse.status}`);
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    if (!markdown || markdown.length < 50) {
      throw new Error("Could not extract enough content from the website");
    }

    console.log("Step 2: Extracting company data with AI. Content length:", markdown.length);

    // Step 2: Use AI to extract structured company data
    const systemPrompt = `You are a B2B company research analyst. Extract structured company information from website content.

Focus on finding:
- Company name (from content or metadata)
- What they do (one sentence)
- Industry/vertical
- Company size (employees if mentioned, otherwise estimate based on signals)
- Revenue signals (ARR, funding, customer count can indicate revenue tier)
- Funding stage (seed, series A/B/C/D, public, bootstrapped)
- Technology stack they use or build with
- Geographic region/headquarters

Be specific with numbers when available. Make reasonable inferences based on signals (e.g., 50 employees likely means $5-15M ARR for SaaS).

Respond ONLY with valid JSON in this exact format:
{
  "companyName": "Company Name",
  "description": "One sentence description of what they do",
  "industry": "Primary industry (e.g., B2B SaaS, FinTech, MarTech)",
  "companySize": "Estimated employees (e.g., '50-100 employees' or '~200 employees')",
  "estimatedRevenue": "Revenue estimate (e.g., '$10-25M ARR' or 'Pre-revenue')",
  "fundingStage": "Funding stage (e.g., 'Series B' or 'Bootstrapped')",
  "techStack": ["Tech1", "Tech2", "Tech3"],
  "region": "HQ location (e.g., 'San Francisco, USA' or 'Europe')"
}`;

    const userPrompt = `Extract company information from this website content:

WEBSITE: ${formattedUrl}
PAGE TITLE: ${metadata.title || "Unknown"}

CONTENT:
${markdown.slice(0, 8000)}

Return the structured JSON with all company details.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Step 3: Parsing AI response");

    // Parse JSON from response
    let enrichedData: EnrichedCompany;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const parsed = JSON.parse(jsonStr.trim());
      
      enrichedData = {
        companyName: parsed.companyName || metadata.title || "Unknown Company",
        description: parsed.description || "",
        industry: parsed.industry || "Unknown",
        companySize: parsed.companySize || "Unknown",
        estimatedRevenue: parsed.estimatedRevenue || "Unknown",
        fundingStage: parsed.fundingStage || "Unknown",
        techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
        region: parsed.region || "Unknown",
        website: formattedUrl,
        rawContent: markdown.slice(0, 2000),
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to extract company data from AI response");
    }

    console.log("Enrichment complete:", enrichedData.companyName);

    return new Response(JSON.stringify({ success: true, data: enrichedData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in enrich-company function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
