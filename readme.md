<div align="center">

# ✈️ TripMate AI

### Your intelligent co-pilot for turning travel ideas into practical trip plans

<p>
  <img src="https://img.shields.io/badge/AI-Travel%20Planner-7c3aed?style=for-the-badge&logo=openai&logoColor=white" alt="AI travel planner">
  <img src="https://img.shields.io/badge/Architecture-Multi--Agent-2563eb?style=for-the-badge&logo=workflow&logoColor=white" alt="Multi-agent architecture">
  <img src="https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Graph-LangGraph-111827?style=for-the-badge" alt="LangGraph">
  <img src="https://img.shields.io/badge/Voice-Web%20Speech%20API-ef4444?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Voice input">
</p>

<p>
  <b>Ask for a trip — type it or speak it. Watch the agents do the planning.</b><br>
  Flights • Hotels • Itineraries • Budgets • Voice Input • Persistent conversations
</p>

<br>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=900&color=60A5FA&center=true&vCenter=true&width=700&lines=From+%22I+want+to+travel%22+to+a+plan+you+can+use.;Search+live+flight+status.;Discover+hotel+options+with+web+research.;Speak+your+travel+idea+%E2%80%94+AI+cleans+it+up.;Generate+a+day-by-day+itinerary+with+AI." alt="TripMate AI animated feature list">

</div>

---

## 🌍 What is TripMate AI?

TripMate AI is a full-stack, multi-agent travel planner. Describe your destination, dates, origin, interests, and budget — by typing **or by speaking** — and TripMate coordinates specialized agents to produce a complete, useful travel plan.

```text
"Plan a complete 7-day Japan trip from Bangladesh under 2 lakhs,
including flights, hotels, sightseeing, and a practical itinerary."
```

The result is presented in a polished web interface with Markdown rendering, one-click copy, and PDF download support. The background features an interactive 3D animated solar system.

## ✨ Features

| Capability | What it does |
| --- | --- |
| 🛫 **Live flight lookup** | Resolves natural-language locations to airports and queries AviationStack for live flight/status data. |
| 🏨 **Hotel discovery** | Uses Tavily web search to find relevant hotel information and travel sources. |
| 🗺️ **AI itinerary planning** | Combines flight and hotel research into a practical, budget-aware day-by-day plan. |
| 🤖 **Multi-agent workflow** | Runs dedicated flight, hotel, itinerary, and final-response agents through LangGraph. |
| 🎙️ **Voice input** | Speak your travel request in the browser — raw transcript is cleaned by `openai/gpt-oss-20b` before submission. |
| 💬 **Conversation memory** | Persists thread state with LangGraph's PostgreSQL checkpointer so a conversation can continue. |
| 📄 **Export-ready results** | Copy the response or download the generated plan as a PDF directly from the browser. |
| 🪐 **3D solar system UI** | Animated canvas solar system with glassmorphism cards and a dark space theme. |
| 📱 **Responsive interface** | Mobile-friendly layout with quick prompts, loading states, and smooth transitions. |

## 🧠 How it works

```mermaid
flowchart LR
    U[👤 Travel request] --> VC{🎙️ Voice?}
    VC -- Yes --> VF[/api/clean-voice\ngpt-oss-20b]
    VC -- No  --> F
    VF --> F[🛫 Flight agent]
    F --> H[🏨 Hotel research agent]
    H --> I[🗺️ Itinerary agent]
    I --> R[✨ Final response agent]
    R --> V[🖥️ FastAPI web UI]
    F -. AviationStack .-> A[(Live flight data)]
    H -. Tavily .-> W[(Web results)]
    R -. LangGraph checkpoint .-> P[(PostgreSQL)]
```

### Agent pipeline

1. **Voice filter** *(optional)* — if the user speaks, `gpt-oss-20b` strips filler words and polishes the query.
2. **Flight agent** — parses the request and fetches matching live flight information via AviationStack.
3. **Hotel agent** — researches hotel options and destination information through Tavily.
4. **Itinerary agent** — turns the collected research into a practical schedule.
5. **Final response agent** — formats everything into trip summary, flights, hotels, itinerary, budget, and recommendations.
6. **PostgreSQL checkpointing** — stores the graph state under a reusable thread ID.

## 🛠️ Technology stack

<div align="center">

| Layer | Technologies |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript, Web Speech API, Marked.js, html2pdf.js |
| Background | Canvas 2D — 3D animated solar system (8 planets, asteroid belt, nebulae) |
| API | FastAPI, Uvicorn, Pydantic |
| Agent orchestration | LangGraph, LangChain |
| Language models | Groq — `openai/gpt-oss-120b` (planning) · `openai/gpt-oss-20b` (voice cleaning) |
| External data | AviationStack (flights), Tavily (hotels & destinations) |
| Persistence | PostgreSQL, `langgraph-checkpoint-postgres`, Psycopg 3 |
| Deployment | Docker (multi-stage), Render-compatible |

</div>

## 🚀 Run locally

### 1. Clone or enter the project

```bash
cd "Agentic AI Projects/TripMate-AI"
```

### 2. Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in this project directory:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
DATABASE_URL=postgresql://username:password@host:5432/database

# Optional: default origin airport (IATA code or country)
DEFAULT_ORIGIN_IATA=DAC

# Optional: LangSmith tracing
LANGSMITH_PROJECT=travel-agent
LANGSMITH_TRACING_V2=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
```

> 🔐 Never commit `.env` or real API keys. The repository's `.gitignore` already excludes environment files.

`DATABASE_URL` must point to a PostgreSQL database reachable by the application. TripMate automatically adds `sslmode=require` when it is not already present.

### 5. Start the app

```bash
python app.py
# or
uvicorn app:app --reload
```

Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

Health check: **[http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)**

## 🐳 Docker

### Build

```bash
docker build -t tripmate-ai .
```

### Run

```bash
docker run -p 8000:8000 --env-file .env tripmate-ai
```

Open **[http://localhost:8000](http://localhost:8000)**.

> The Dockerfile uses a **multi-stage build** — the final image contains only the Python runtime and installed packages, keeping the image lean.

## 💡 Try these prompts

```text
Plan a complete 7 days Japan trip from Bangladesh including flights,
hotels and sightseeing under 2 lakhs.
```

```text
Plan a 5 days Dubai trip from Dhaka with flights, hotels and sightseeing.
```

```text
Plan a 7 days Thailand trip from Bangladesh with budget hotels and sightseeing.
```

```text
Give me all country flight info.
```

Or just click the **🎙️ Speak** button and say your travel plan out loud!

## 🔌 API reference

### `POST /api/travel`

Runs the full multi-agent travel planning workflow.

**Request:**

```json
{
  "message": "Plan a 5-day trip to Dubai from Dhaka",
  "thread_id": null
}
```

**Response:**

```json
{
  "success": true,
  "thread_id": "user_<generated-id>",
  "answer": "## Trip Summary...",
  "flight_results": "...",
  "hotel_results": "...",
  "itinerary": "...",
  "llm_calls": 4
}
```

---

### `POST /api/clean-voice`

Filters and polishes a raw voice transcript using `openai/gpt-oss-20b`.
Removes filler words, fixes grammar, and preserves all travel details.

**Request:**

```json
{
  "raw_transcript": "um so I wanna like go to Japan uh for 7 days from Bangladesh maybe under 2 lakhs"
}
```

**Response:**

```json
{
  "success": true,
  "cleaned": "Plan a 7-day trip to Japan from Bangladesh for under 2 lakhs."
}
```

---

### `GET /health`

Returns service status:

```json
{
  "status": "ok",
  "message": "AI Travel Planner API is running"
}
```

## ⚠️ Important notes

- AviationStack provides live flight/status information, **not guaranteed ticket prices**. Fare estimates may be unavailable.
- Voice input uses the browser's **Web Speech API** — works in Chrome, Edge, and Safari. Firefox requires a flag.
- Travel information can change. Verify visa rules, schedules, hotel availability, and prices with official providers before booking.
- The first request may take longer while the graph initializes and external services respond.
- The browser stores the active `thread_id` in `localStorage` so subsequent requests can continue the same conversation.

## 📁 Project structure

```text
TripMate-AI/
├── app.py                 # FastAPI routes — /api/travel, /api/clean-voice, /health
├── backend.py             # LangGraph workflow and PostgreSQL checkpointing
├── tools/
│   ├── flight_tool.py     # AviationStack search and airport resolution
│   └── tavily_tool.py     # Hotel and destination web research
├── templates/
│   └── index.html         # Planner page with voice input UI
├── static/
│   ├── style.css          # Glassmorphism UI + voice bar + mic animations
│   ├── script.js          # API calls, voice recognition, Markdown, copy, PDF
│   └── solar.js           # 3D animated solar system canvas background
├── Dockerfile             # Multi-stage production Docker image
├── requirements.txt       # Pinned Python dependencies
└── readme.md              # Project documentation
```

## 🔮 Possible next steps

- Add fare search through a pricing provider such as Amadeus.
- Add calendar/date extraction and timezone-aware itinerary scheduling.
- Stream agent progress to the UI with WebSockets or Server-Sent Events.
- Add authentication and per-user trip history.
- Add automated tests for route parsing, airport resolution, and graph nodes.
- Extend voice to support multiple languages via `recognition.lang`.

---

<div align="center">

### Built for curious travelers who want to spend less time planning and more time exploring. 🌏

<sub>TripMate AI • Plan boldly. Travel better.</sub>

</div>
