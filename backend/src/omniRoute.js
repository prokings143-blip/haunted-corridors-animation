/**
 * OmniRoute API Client
 * Handles communication with OmniRoute video generation service
 */

export async function generateVideoWithOmniRoute({
  prompt,
  duration,
  model
}) {
  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";
  const apiKey = process.env.OMNIROUTE_API_KEY;

  if (!apiKey) {
    throw new Error("OMNIROUTE_API_KEY is not configured");
  }

  if (!model) {
    throw new Error("VIDEO_MODEL is not configured");
  }

  const url = `${baseUrl}/videos/generations`;

  const payload = {
    model,
    prompt,
    duration
  };

  try {
    console.log(`[OmniRoute] Sending request to ${url}`);
    console.log(`[OmniRoute] Model: ${model}, Duration: ${duration}s`);

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
      throw new Error(
        `OmniRoute API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data = await response.json();
    console.log("[OmniRoute] Response received:", data);

    return {
      success: true,
      videoId: data.id || data.videoId,
      videoUrl: data.url || data.videoUrl,
      status: data.status || "processing",
      data
    };
  } catch (error) {
    console.error("[OmniRoute] Error:", error.message);
    throw error;
  }
}

/**
 * Poll OmniRoute for video generation status
 */
export async function getVideoStatus(videoId) {
  const baseUrl = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";
  const apiKey = process.env.OMNIROUTE_API_KEY;

  if (!apiKey) {
    throw new Error("OMNIROUTE_API_KEY is not configured");
  }

  const url = `${baseUrl}/videos/generations/${videoId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      status: data.status,
      videoUrl: data.url || data.videoUrl,
      data
    };
  } catch (error) {
    console.error("[OmniRoute] Status check error:", error.message);
    throw error;
  }
}
