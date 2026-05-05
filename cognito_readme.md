# Cognito Authentication

AWS Cognito is a managed user authentication service. It stores user accounts, handles passwords securely, and issues cryptographically signed tokens that prove who a user is. When a user clicks "Sign in", they are redirected to a login page hosted by AWS (the Hosted UI). After entering their credentials, AWS redirects them back to our app with a short-lived code, which our frontend exchanges for three tokens: an **ID token** (who you are — contains name, email), an **access token** (what you're allowed to do — sent to the API), and a **refresh token** (used silently to get new tokens when the others expire).

The backend never sees a password. Instead, when the frontend calls a protected API endpoint, it attaches the access token to the request. FastAPI verifies the token by checking its cryptographic signature against public keys that AWS publishes at a known URL. If the signature is valid and the token hasn't expired, the request is allowed through and the endpoint can read claims from the token (user ID, org ID, etc.) to decide what data to return. This means the backend is stateless — it doesn't store sessions, it just checks the maths on the token.

## What's been implemented

### AWS setup
- User Pool in `eu-west-2`
- Cognito-hosted domain (`*.auth.eu-west-2.amazoncognito.com`)
- SPA app client (no client secret)
- Managed login style assigned to the SPA client

### Frontend (`frontend/`)
- `aws-amplify` added as a dependency
- `lib/amplify-config.ts` — configures Amplify once from `NEXT_PUBLIC_*` env vars
- `app/providers.tsx` — client wrapper that calls `configureAmplify()` on mount; wraps the app in `layout.tsx`
- `app/page.tsx` — sign-in via Cognito Hosted UI (`signInWithRedirect`), sign-out (`signOut`), displays signed-in user's name/email from the ID token, calls the protected backend endpoint

**Env vars required** (`frontend/.env.local`):
```
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
NEXT_PUBLIC_COGNITO_DOMAIN          # host only, no https://
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT
```

### Backend (`backend/`)
- `PyJWT` + `cryptography` added for RS256 JWT validation
- `app/auth.py` — `get_current_user` FastAPI dependency: fetches Cognito JWKS (cached), verifies access token signature, expiry, and issuer; returns decoded claims
- `app/main.py` — `GET /protected` requires a valid token; `GET /` remains public

**Env vars required** (`backend/.env`):
```
COGNITO_REGION
COGNITO_USER_POOL_ID
```

## Auth flow

```
Browser → signInWithRedirect → Cognito Hosted UI → redirect back with code
→ Amplify exchanges code for tokens (PKCE) → stores tokens in localStorage
→ frontend reads access token → sends as Authorization: Bearer to FastAPI
→ FastAPI verifies JWT against Cognito JWKS → returns protected data
```

---

## Next steps

### Short term
- [ ] Set up a **custom domain** (`auth.yourdomain.com`) for the Hosted UI — requires an ACM certificate in `us-east-1` and a DNS CNAME; then update `NEXT_PUBLIC_COGNITO_DOMAIN`

### For production (multi-tenant, invite-only)
- [ ] Add `custom:org_id` as a **custom attribute** on the User Pool before any real users are created (cannot safely add later)
- [ ] Build an **invite endpoint** in the backend that calls `AdminCreateUser` via the AWS SDK, setting `custom:org_id` and suppressing or customising the invitation email
- [ ] Read `custom:org_id` from `claims` in `get_current_user` and enforce tenant scoping on all data endpoints
- [ ] Decide on **roles** within a tenant: Cognito Groups (simple) vs roles stored in your own DB keyed by `sub` (more flexible)
- [ ] Customise the **Hosted UI email templates** (invitation, password reset) with your branding via Managed Login or SES

### Longer term
- [ ] Consider switching frontend auth to **server-side** (Next.js middleware + httpOnly cookie) if you need protected server components or SSR with auth — this replaces the current browser-only Amplify approach and requires a different token handling strategy
