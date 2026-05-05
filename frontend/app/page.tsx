"use client";

import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";
import { configureAmplify } from "../lib/amplify-config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function Home() {
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [protectedMessage, setProtectedMessage] = useState<string | null>(null);

  const [authReady, setAuthReady] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    configureAmplify();
    setAuthReady(true);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.payload;
      const label =
        (idToken?.name as string | undefined) ??
        (idToken?.email as string | undefined) ??
        user.username;
      setUserLabel(label);
    } catch {
      setUserLabel(null);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    void refreshUser();
  }, [authReady, refreshUser]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then((res) => res.json())
      .then((data: { message?: string }) => setBackendMessage(data.message ?? null))
      .catch(() => setBackendError("Could not reach backend"));
  }, []);

  const callProtected = useCallback(async () => {
    try {
      const { tokens } = await fetchAuthSession();
      const accessToken = tokens?.accessToken?.toString();
      if (!accessToken) return;
      const res = await fetch(`${BACKEND_URL}/protected`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await res.json()) as { message?: string; detail?: string };
      setProtectedMessage(data.message ?? data.detail ?? "No message");
    } catch {
      setProtectedMessage("Failed to call protected endpoint");
    }
  }, []);

  useEffect(() => {
    if (userLabel) void callProtected();
    else setProtectedMessage(null);
  }, [userLabel, callProtected]);

  const cognitoConfigured = Boolean(
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID &&
      process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  );

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "80px auto", padding: "0 16px" }}>
      <h1>test_aws_cognito</h1>
      <p>This is a simple NextJS frontend connected to a FastAPI backend.</p>

      <h2>Sign in</h2>
      {!cognitoConfigured && (
        <p style={{ color: "#b45309" }}>
          Copy <code>frontend/.env.example</code> to <code>.env.local</code> and set the Cognito variables.
        </p>
      )}
      {cognitoConfigured && userLabel && (
        <p>
          Signed in as <strong>{userLabel}</strong>
        </p>
      )}
      {cognitoConfigured && userLabel && (
        <p>
          <button
            type="button"
            onClick={() => void signOut().finally(() => void refreshUser())}
          >
            Sign out
          </button>
        </p>
      )}
      {cognitoConfigured && !userLabel && (
        <p>
          <button type="button" onClick={() => void signInWithRedirect()}>
            Sign in with Cognito
          </button>
        </p>
      )}

      <h2>Open endpoint</h2>
      {backendMessage && <p style={{ color: "green" }}>{backendMessage}</p>}
      {backendError && <p style={{ color: "red" }}>{backendError}</p>}
      {!backendMessage && !backendError && <p>Loading...</p>}

      {userLabel && (
        <>
          <h2>Protected endpoint</h2>
          {protectedMessage ? (
            <p style={{ color: "green" }}>{protectedMessage}</p>
          ) : (
            <p>Calling...</p>
          )}
        </>
      )}
    </main>
  );
}
