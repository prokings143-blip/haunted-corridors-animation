import { useState } from "react";
import "./App.css";

export default function App() {
  const [formData, setFormData] = useState({
    story: "",
    characters: "",
    location: "City College, Nayapul, Hyderabad",
    style: "Cinematic anime horror",
    duration: 30
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const characters = formData.characters
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        story: formData.story,
        characters,
        location: formData.location,
        style: formData.style,
        duration: formData.duration
      };

      console.log("Sending request to backend:", payload);

      const res = await fetch("http://localhost:3000/api/generate-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Response from backend:", data);
      setResponse(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Haunted Corridors Animation</h1>
        <p>Generate cinematic horror videos with AI</p>
      </header>

      <main className="container">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="story">Story *</label>
              <textarea
                id="story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Enter your story or scene description..."
                required
                rows="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="characters">Characters</label>
              <input
                type="text"
                id="characters"
                name="characters"
                value={formData.characters}
                onChange={handleChange}
                placeholder="e.g., Prudhviraj, Akash (comma-separated)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., City College, Nayapul, Hyderabad"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="style">Visual Style *</label>
              <input
                type="text"
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
                placeholder="e.g., Cinematic anime horror"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="5"
                max="120"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Generating..." : "Generate Video"}
            </button>
          </form>
        </div>

        <div className="response-section">
          {error && (
            <div className="error-box">
              <h3>❌ Error</h3>
              <pre>{error}</pre>
            </div>
          )}

          {response && (
            <div className="success-box">
              <h3>✅ Success</h3>
              
              <div className="section">
                <h4>Message</h4>
                <p>{response.message}</p>
              </div>

              {response.storyboard && (
                <div className="section">
                  <h4>📋 Storyboard</h4>
                  <div className="storyboard-info">
                    <p><strong>Total Shots:</strong> {response.storyboard.totalShots}</p>
                    <p><strong>Duration:</strong> {response.storyboard.requestedDuration}s</p>
                    <p><strong>Shot Duration Limit:</strong> {response.storyboard.shotDurationLimit}s</p>
                  </div>

                  {response.storyboard.shots && (
                    <div className="shots-list">
                      <h5>Shots:</h5>
                      {response.storyboard.shots.map((shot) => (
                        <div key={shot.id} className="shot-card">
                          <strong>Shot {shot.id}</strong> ({shot.start}s - {shot.end}s)
                          <p>{shot.description.substring(0, 100)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {response.omnirouteResponse && (
                <div className="section">
                  <h4>🎬 OmniRoute Response</h4>
                  <pre className="json-output">
                    {JSON.stringify(response.omnirouteResponse, null, 2)}
                  </pre>
                </div>
              )}

              {response.note && (
                <div className="section">
                  <p className="note">{response.note}</p>
                </div>
              )}
            </div>
          )}

          {!response && !error && (
            <div className="info-box">
              <h3>ℹ️ About</h3>
              <p>
                Fill in the form to generate a video. Your story will be broken down into
                scenes, and each scene will be sent to OmniRoute for video generation.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
