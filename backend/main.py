from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from typing import List, Dict, Optional
import json

app = FastAPI(title="Synapse IELTS RPG API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables (set these in Cloudflare Workers)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai.api_key = OPENAI_API_KEY


class AnalysisResult(BaseModel):
    bandEstimate: float
    errors: List[Dict]
    enemy: Dict
    gapGraph: Dict[str, float]


class Enemy(BaseModel):
    name: str
    type: str
    description: str
    weakness: str
    hp: int
    image: str
    color: str


@app.get("/")
async def root():
    return {"message": "Synapse IELTS RPG API - Neural Combat System Online"}


@app.post("/api/analyze-speech", response_model=AnalysisResult)
async def analyze_speech(audio: UploadFile = File(...)):
    """
    Analyze speech audio using OpenAI Whisper + GPT-4o-mini
    
    1. Transcribe audio with Whisper
    2. Analyze transcript for errors with GPT-4o-mini
    3. Generate enemy based on primary error
    4. Calculate gap graph scores
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Transcribe with Whisper
        transcript = await transcribe_audio(audio_bytes)
        
        # Analyze with GPT-4o-mini
        analysis = await analyze_transcript(transcript)
        
        return analysis
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        # Save temporarily
        temp_path = "/tmp/audio.webm"
        with open(temp_path, "wb") as f:
            f.write(audio_bytes)
        
        # Transcribe
        with open(temp_path, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        
        return transcript
    
    except Exception as e:
        print(f"Whisper transcription error: {e}")
        return "Sample transcription for testing"


async def analyze_transcript(transcript: str) -> AnalysisResult:
    """Analyze transcript for IELTS errors using GPT-4o-mini"""
    
    prompt = f"""You are an IELTS examiner and linguistic expert. Analyze this speech transcript for errors.

Transcript: "{transcript}"

Provide a detailed analysis in JSON format:
{{
  "bandEstimate": 5.5-9.0,
  "errors": [
    {{
      "type": "Tense Error|Article Missing|Subject-Verb Agreement|Vocabulary|Pronunciation",
      "category": "Grammar|Syntax|Phonetics|Coherence",
      "example": "exact phrase from transcript",
      "correction": "correct version",
      "severity": "high|medium|low"
    }}
  ],
  "gapGraph": {{
    "vocabulary": 0-100,
    "syntax": 0-100,
    "phonetics": 0-100,
    "coherence": 0-100
  }}
}}

Focus on the PRIMARY error that most impacts the band score."""

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an IELTS expert examiner."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        analysis_data = json.loads(response.choices[0].message.content)
        
        # Generate enemy from primary error
        enemy = generate_enemy(analysis_data["errors"][0] if analysis_data["errors"] else None)
        
        return AnalysisResult(
            bandEstimate=analysis_data["bandEstimate"],
            errors=analysis_data["errors"],
            enemy=enemy,
            gapGraph=analysis_data["gapGraph"]
        )
    
    except Exception as e:
        print(f"GPT analysis error: {e}")
        # Return mock data for testing
        return get_mock_analysis()


def generate_enemy(error: Optional[Dict]) -> Dict:
    """Generate enemy based on error type"""
    
    enemies = {
        "Tense Error": {
            "name": "The Chronos Wraith",
            "type": "Syntax Demon",
            "description": "A phantom that distorts the flow of time in your sentences",
            "weakness": "Past Perfect Tense",
            "hp": 100,
            "image": "⏰",
            "color": "from-purple-600 to-pink-600"
        },
        "Article Missing": {
            "name": "The Void Specter",
            "type": "Grammar Demon",
            "description": "An entity that devours determiners from your speech",
            "weakness": "Definite Articles",
            "hp": 80,
            "image": "👻",
            "color": "from-blue-600 to-cyan-600"
        },
        "Subject-Verb Agreement": {
            "name": "The Discord Fiend",
            "type": "Syntax Demon",
            "description": "A creature that breaks harmony between subjects and verbs",
            "weakness": "Third Person Singular",
            "hp": 90,
            "image": "😈",
            "color": "from-red-600 to-orange-600"
        },
        "Vocabulary": {
            "name": "The Lexicon Shade",
            "type": "Word Demon",
            "description": "A shadow that limits your vocabulary range",
            "weakness": "Academic Words",
            "hp": 85,
            "image": "📚",
            "color": "from-green-600 to-teal-600"
        },
        "Pronunciation": {
            "name": "The Echo Phantom",
            "type": "Phonetic Demon",
            "description": "A being that corrupts your pronunciation patterns",
            "weakness": "IPA Master",
            "hp": 95,
            "image": "🔊",
            "color": "from-yellow-600 to-orange-600"
        }
    }
    
    if error and error["type"] in enemies:
        return enemies[error["type"]]
    
    return enemies["Tense Error"]


def get_mock_analysis() -> AnalysisResult:
    """Mock analysis for testing without API"""
    return AnalysisResult(
        bandEstimate=6.0,
        errors=[
            {
                "type": "Tense Error",
                "category": "Grammar",
                "example": "I go to school yesterday",
                "correction": "I went to school yesterday",
                "severity": "high"
            }
        ],
        enemy=generate_enemy({"type": "Tense Error"}),
        gapGraph={
            "vocabulary": 65.0,
            "syntax": 55.0,
            "phonetics": 70.0,
            "coherence": 68.0
        }
    )


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "whisper": "configured" if OPENAI_API_KEY else "missing_key",
        "gpt": "configured" if OPENAI_API_KEY else "missing_key"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
