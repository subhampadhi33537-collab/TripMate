from pathlib import Path
import os
import traceback
import uvicorn

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

from backend import run_travel_agent

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="TripMate",
    description="LangGraph Multi-Agent Travel Planner with FastAPI Frontend",
    version="1.0.0"
)


app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)


templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)



class TravelRequest(BaseModel):
    message: str
    thread_id: str | None = None


class VoiceCleanRequest(BaseModel):
    raw_transcript: str


# Groq client reused for the voice-cleaning micro-call
_groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))



@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


@app.post("/api/travel")
async def travel_planner(request_data: TravelRequest):
    try:
        user_message = request_data.message.strip()

        if not user_message:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Message cannot be empty."
                }
            )

        result = run_travel_agent(
            user_input=user_message,
            thread_id=request_data.thread_id
        )

        return JSONResponse(
            content={
                "success": True,
                "thread_id": result["thread_id"],
                "answer": result["answer"],
                "flight_results": result["flight_results"],
                "hotel_results": result["hotel_results"],
                "itinerary": result["itinerary"],
                "llm_calls": result["llm_calls"],
            }
        )

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )




@app.post("/api/clean-voice")
async def clean_voice(request_data: VoiceCleanRequest):
    """Use openai/gpt-oss-20b via Groq to turn a raw voice transcript
    into a clean, structured travel planning query."""
    raw = request_data.raw_transcript.strip()
    if not raw:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Empty transcript."}
        )

    try:
        completion = _groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a voice-to-text filter for a travel planning assistant. "
                        "The user has just dictated a travel request via microphone. "
                        "Your job is to:\n"
                        "1. Remove filler words (um, uh, like, you know, etc.)\n"
                        "2. Fix grammar and punctuation\n"
                        "3. Preserve ALL travel details (destinations, dates, budget, preferences)\n"
                        "4. Output ONLY the clean, polished travel query — no commentary, no preamble."
                    )
                },
                {
                    "role": "user",
                    "content": f"Raw voice transcript:\n{raw}"
                }
            ],
            temperature=0.3,
            max_tokens=512,
        )

        cleaned = completion.choices[0].message.content.strip()
        return JSONResponse(content={"success": True, "cleaned": cleaned})

    except Exception as e:
        print("Voice clean error:", e)
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "AI Travel Planner API is running"
    }


@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})



if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )

    