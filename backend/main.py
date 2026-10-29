
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.tickets import router as tickets_router

app = FastAPI(
    title="SupportIQ API",
    description="AI-powered customer support ticket management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://supportiq-frontend-icww.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to SupportIQ!"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(tickets_router)
