from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_current_user

app = FastAPI(title="test_aws_cognito API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def hello_world():
    return {"message": "Hello, World!"}


@app.get("/protected")
def protected(claims: dict = Depends(get_current_user)):
    return {"message": f"Hello, {claims.get('username') or claims.get('sub')}!"}
