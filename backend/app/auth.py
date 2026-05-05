import os
from functools import lru_cache

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer()


@lru_cache(maxsize=1)
def _jwks_client() -> jwt.PyJWKClient:
    region = os.environ["COGNITO_REGION"]
    pool_id = os.environ["COGNITO_USER_POOL_ID"]
    url = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json"
    return jwt.PyJWKClient(url)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    token = credentials.credentials
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        region = os.environ["COGNITO_REGION"]
        pool_id = os.environ["COGNITO_USER_POOL_ID"]
        issuer = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}"
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False},  # Cognito access tokens omit aud
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    return claims
