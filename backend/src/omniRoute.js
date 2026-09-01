/**
 * OmniRoute API Client
 * Handles communication with OmniRoute video generation service
 *
 * IMPORTANT REQUIREMENTS:
 * 1. Use POST /v1/videos/generations endpoint
 * 2. Send Authorization: Bearer ${OMNIROUTE_API_KEY}
 * 3. Send only: model, prompt
 * 4. Do NOT invent model names - use VIDEO_MODEL from env
 * 5. Do NOT expose API key to frontend
 * 6. Preserve actual OmniRoute response - do NOT assume response fields
 * 7. Do NOT include invented fields like videoUrl, status, videoId
 */

export async function generateShotWithOmniRoute({
  prompt,
  model
}) {
  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";
  const apiKey = process.env.OMNIROUTE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OMNIROUTE_API_KEY is not configured. Please set it in .env"
    );
  }

  if (!model) {
    throw new Error(
      "VIDEO_MODEL is not configured. Please set it in .env"
    );
  }

  const url = `${baseUrl}/videos/generations`;

  // Send ONLY the fields OmniRoute actually requires
  const payload = {
    model,
    prompt
  };

  try {
    console.log(`[OmniRoute] POST ${url}`);
    console.log(`[OmniRoute] Model: ${model}`);
    console.log(`[OmniRoute] Prompt length: ${prompt.length} chars`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OmniRoute] Error ${response.status}:`, errorText);
      throw new Error(
        `OmniRoute API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data = await response.json();
    console.log("[OmniRoute] Response received:", JSON.stringify(data, null, 2));

    // Return the ACTUAL, UNMODIFIED OmniRoute response
    // Do NOT invent fields or assume response structure
    return {
      success: true,
      omnirouteResponse: data
    };
  } catch (error) {
    console.error("[OmniRoute] Request failed:", error.message);
    throw error;
  }
}
