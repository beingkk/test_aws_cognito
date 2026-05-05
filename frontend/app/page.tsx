"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setError("Could not reach backend"));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "80px auto", padding: "0 16px" }}>
      <h1>test_aws_cognito</h1>
      <p>
        This is a simple NextJS frontend connected to a FastAPI backend.
      </p>
      <h2>Backend response</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!message && !error && <p>Loading...</p>}
    </main>
  );
}
