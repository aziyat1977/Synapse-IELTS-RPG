from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from typing import List, Dict, Optional
import json
from refinery import refine_ielts_content, QuestNode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, desc
from database import engine, Base, get_db
from models import User, Clan
from fastapi import Depends, WebSocket, WebSocketDisconnect
import uuid
from raid_engine import ConnectionManager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start Scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(sunday_raid_trigger, 'cron', day_of_week='sun', hour=20, minute=0, timezone='Asia/Tashkent')
    scheduler.add_job(andisha_notification_check, 'cron', hour=18, minute=0, timezone='Asia/Tashkent')
    scheduler.start()
    
    yield
    # Shutdown

app = FastAPI(title="Synapse IELTS RPG API", lifespan=lifespan)
raid_manager = ConnectionManager()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai.api_key = OPENAI_API_KEY


class Question(BaseModel):
    id: int
    prompt: str
    options: List[str]
    correctAnswer: str
    complexity: float
    explanation: str


class CustomEnemy(BaseModel):
    name: str
    type: str
    description: str
    weakness: str
    hp: int
    image: str
    color: str


class AnalysisResult(BaseModel):
    bandEstimate: float
    errors: List[Dict]
    enemy: CustomEnemy
    gapGraph: Dict[str, float]
    questions: List[Question]


class VoiceCombatResult(BaseModel):
    transcript: str
    damage: int
    isCritical: bool
    feedback: str
    recoilType: str # 'stunned', 'parried', 'hit', 'critical'


class ClanCreate(BaseModel):
    username: str
    telegram_id: Optional[str] = None

class ClanInvite(BaseModel):
    inviter_username: str
    invitee_username: str


@app.get("/")
async def root():
    return {"message": "Synapse IELTS RPG API - Neural Combat System Online"}


@app.post("/api/telegram-webhook")
async def telegram_webhook(update: Dict):
    """
    Handle Telegram Payment Updates (Pre_Checkout_Query)
    """
    print(f"Received Webhook: {update}")
    
    # Mock Logic for "Integration Command"
    if "pre_checkout_query" in update:
        query = update["pre_checkout_query"]
        payload = query.get("invoice_payload", "")
        
        print(f"Processing Payment for: {payload}")
        
        # Verify user ID in database (Mock)
        # If Battle Pass, upgrade tier
        
        return {"ok": True}
        
    return {"ok": True}


@app.post("/api/analyze-speech", response_model=AnalysisResult)
async def analyze_speech(audio: UploadFile = File(...)):
    """
    Analyze speech audio using OpenAI Whisper + GPT-4o-mini
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Transcribe with Whisper
        transcript = await transcribe_audio(audio_bytes)
        print(f"Transcript: {transcript}")
        
        # Analyze with GPT-4o-mini
        if not transcript or transcript.strip() == "":
             print("Empty transcript, using mock")
             return get_mock_analysis()

        analysis = await analyze_transcript(transcript)
        return analysis
    
    except Exception as e:
        print(f"Error in analyze_speech: {e}")
        return get_mock_analysis()


@app.post("/api/combat-voice", response_model=VoiceCombatResult)
async def combat_voice(audio: UploadFile = File(...), prompt: str = ""):
    """
    Real-time Voice Combat. 
    Analyzes short audio bursts for 'Voice Attacks'.
    """
    try:
        audio_bytes = await audio.read()
        transcript = await transcribe_audio(audio_bytes)
        
        if not transcript:
             return VoiceCombatResult(
                 transcript="[Silence]",
                 damage=0,
                 isCritical=False,
                 feedback="The Demon ignores your silence.",
                 recoilType="stunned"
             )

        # Combat Analysis Prompt (Uzbek Optimized)
        combat_prompt = f"""
        You are an IELTS Combat Judge. Analyze this spoken response to the question: "{prompt}".
        Transcript: "{transcript}"

        Rules:
        1. Ignore accents unless incomprehensible.
        2. PENALIZE heavily for "W vs V" or "Th vs S" errors (Uzbek traps).
        3. CRITICAL HIT if Band 7.5+ vocabulary is used.
        4. DAMAGE = 0-100 based on accuracy and lexical resource.
        
        Return JSON:
        {{
            "damage": int,
            "isCritical": bool,
            "feedback": "Short combat log", 
            "recoilType": "critical"|"hit"|"parried"|"stunned"
        }}
        """
        
        if not OPENAI_API_KEY:
             # Mock Result
             return VoiceCombatResult(
                 transcript=transcript,
                 damage=75,
                 isCritical=False,
                 feedback="Good pronunciation, but watch your 'Th' sound.",
                 recoilType="hit"
             )

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are the Synapse Combat Engine."},
                {"role": "user", "content": combat_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return VoiceCombatResult(
            transcript=transcript,
            damage=result.get("damage", 50),
            isCritical=result.get("isCritical", False),
            feedback=result.get("feedback", "Attack registered."),
            recoilType=result.get("recoilType", "hit")
        )

    except Exception as e:
        print(f"Combat Voice Error: {e}")
        return VoiceCombatResult(
            transcript="Error",
            damage=0,
            isCritical=False,
            feedback="The Demon deflects the glitch.",
            recoilType="parried"
        )


@app.post("/api/refine-content", response_model=List[QuestNode])
async def refine_content(file: UploadFile = File(...)):
    """
    Upload a PDF to generate Quests for the World Map
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
            
        contents = await file.read()
        quests = await refine_ielts_content(contents, file.filename)
        return quests
    except Exception as e:
        print(f"Refinery Error: {e}")
        # Return mock quests on error to keep flow going
        from refinery import get_mock_quests
        return get_mock_quests()


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        if not OPENAI_API_KEY:
            raise Exception("No OpenAI API Key")

        # Save temporarily
        temp_path = "/tmp/audio_upload.webm"
        os.makedirs("/tmp", exist_ok=True)
        
        with open(temp_path, "wb") as f:
            f.write(audio_bytes)
        
        # Transcribe
        with open(temp_path, "rb") as audio_file:
            transcript_obj = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="json"
            )
        
        return transcript_obj.text
    
    except Exception as e:
        print(f"Whisper transcription error: {e}")
        return ""


async def analyze_transcript(transcript: str) -> AnalysisResult:
    """Analyze transcript for IELTS errors using GPT-4o-mini"""
    
    prompt = f"""You are an IELTS examiner. Analyze this speech for errors and generate 3 combat training MCQs.

Transcript: "{transcript}"

Return JSON:
{{
  "bandEstimate": 5.5-9.0,
  "errors": [
    {{
      "type": "Tense Error|Article Missing|Subject-Verb Agreement|Vocabulary|Pronunciation",
      "category": "Grammar|Syntax|Phonetics|Coherence",
      "example": "error phrase",
      "correction": "corrected phrase",
      "severity": "high|medium|low"
    }}
  ],
  "gapGraph": {{ "vocabulary": 0-100, "syntax": 0-100, "phonetics": 0-100, "coherence": 0-100 }},
  "questions": [
    {{
        "id": 1,
        "prompt": "Fill in the blank...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "complexity": 5.0,
        "explanation": "Reasoning..."
    }}
  ]
}}
Ensure 'questions' has exactly 3 items. 'options' has exactly 4 items.
"""

    try:
        if not OPENAI_API_KEY:
             return get_mock_analysis()

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an IELTS expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        analysis_data = json.loads(response.choices[0].message.content)
        
        # Generate enemy from primary error
        enemy = generate_enemy(analysis_data.get("errors", [])[0] if analysis_data.get("errors") else None)
        
        return AnalysisResult(
            bandEstimate=analysis_data.get("bandEstimate", 6.0),
            errors=analysis_data.get("errors", []),
            enemy=enemy,
            gapGraph=analysis_data.get("gapGraph", {"vocabulary": 50, "syntax": 50, "phonetics": 50, "coherence": 50}),
            questions=analysis_data.get("questions", [])
        )
    
    except Exception as e:
        print(f"GPT analysis error: {e}")
        return get_mock_analysis()


def generate_enemy(error: Optional[Dict]) -> CustomEnemy:
    """Generate enemy based on error type"""
    
    enemies = {
        "Tense": {
            "name": "The Chronos Wraith",
            "type": "Syntax Demon",
            "description": "Distorts time flow",
            "weakness": "Past Perfect Tense",
            "hp": 100,
            "image": "⏰",
            "color": "from-purple-600 to-pink-600"
        },
        "Article": {
            "name": "The Void Specter",
            "type": "Grammar Demon",
            "description": "Devours determiners",
            "weakness": "Definite Articles",
            "hp": 80,
            "image": "👻",
            "color": "from-blue-600 to-cyan-600"
        },
        "Subject-Verb": {
            "name": "The Discord Fiend",
            "type": "Syntax Demon",
            "description": "Breaks harmony",
            "weakness": "Third Person Singular",
            "hp": 90,
            "image": "😈",
            "color": "from-red-600 to-orange-600"
        },
        "Vocabulary": {
            "name": "The Lexicon Shade",
            "type": "Word Demon",
            "description": "Limits vocabulary",
            "weakness": "Academic Words",
            "hp": 85,
            "image": "📚",
            "color": "from-green-600 to-teal-600"
        },
        "Pronunciation": {
            "name": "The Echo Phantom",
            "type": "Phonetic Demon",
            "description": "Corrupts pronunciation",
            "weakness": "IPA Master",
            "hp": 95,
            "image": "🔊",
            "color": "from-yellow-600 to-orange-600"
        }
    }
    
    # Default
    enemy_data = enemies["Tense"]
    
    if error:
        err_type = error.get("type", "")
        if "Tense" in err_type: enemy_data = enemies["Tense"]
        elif "Article" in err_type: enemy_data = enemies["Article"]
        elif "Subject" in err_type or "Agreement" in err_type: enemy_data = enemies["Subject-Verb"]
        elif "Vocabulary" in err_type: enemy_data = enemies["Vocabulary"]
        elif "Pronunciation" in err_type: enemy_data = enemies["Pronunciation"]
    
    return CustomEnemy(**enemy_data)


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
        enemy=generate_enemy({"type": "Tense"}),
        gapGraph={
            "vocabulary": 65.0,
            "syntax": 55.0,
            "phonetics": 70.0,
            "coherence": 68.0
        },
        questions=[
            {
                "id": 1,
                "prompt": "Choose the correct past form: 'I ___ (to see) him yesterday.'",
                "options": ["see", "seen", "saw", "seeing"],
                "correctAnswer": "saw",
                "complexity": 5.0,
                "explanation": "Simple past is used for finished actions."
            },
            {
                "id": 2,
                "prompt": "She ___ (to have) never been to Paris.",
                "options": ["has", "have", "having", "had"],
                "correctAnswer": "has",
                "complexity": 6.0,
                "explanation": "Present Perfect with 3rd person singular."
            },
            {
                "id": 3,
                "prompt": "By next year, I ___ (to finish) my degree.",
                "options": ["will finish", "will have finished", "finish", "finished"],
                "correctAnswer": "will have finished",
                "complexity": 7.0,
                "explanation": "Future Perfect usage."
            }
        ]
    )


# --- Clan Mechanics Endpoints ---

@app.post("/api/clan/summon")
async def summon_clan_member(invite: ClanInvite, db: AsyncSession = Depends(get_db)):
    """
    Generate a 'Summoning' (Referral) mechanism.
    For simplicity in this RPG:
    - Creates a new user (Invitee) linked to the Inviter's Clan (if exists) or creates a new Clan.
    """
    # Find Inviter
    result = await db.execute(select(User).where(User.username == invite.inviter_username))
    inviter = result.scalars().first()
    
    if not inviter:
        # Create Inviter if not exists (Auto-onboarding)
        inviter = User(username=invite.inviter_username, xp=100)
        db.add(inviter)
        await db.commit()
        await db.refresh(inviter)

    # Check if Inviter has a Clan
    if not inviter.clan_id:
        # Create a new Clan (The Triad of [Name])
        new_clan = Clan(name=f"Triad of {inviter.username}")
        db.add(new_clan)
        await db.commit()
        await db.refresh(new_clan)
        
        inviter.clan_id = new_clan.id
        db.add(inviter)
        await db.commit()
    
    # Create Invitee with "Starter Artifact" (Bonus Stats)
    starter_stats = {"vocabulary": 70, "syntax": 60, "fluency": 60} # Band 7.0 Start
    new_user = User(username=invite.invitee_username, clan_id=inviter.clan_id, stats=starter_stats, xp=500) # 500 XP Bonus
    db.add(new_user)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    return {
        "message": f"{invite.invitee_username} has been summoned via {inviter.username}! Starter Artifact (Band 7.0 Pack) unlocked.", 
        "clan_id": inviter.clan_id
    }

@app.get("/api/clan/status/{username}")
async def get_clan_status(username: str, db: AsyncSession = Depends(get_db)):
    """
    Get the status of the user's clan: Members, Sync Level, Sanity.
    """
    result = await db.execute(select(User).where(User.username == username).options(selectinload(User.clan).selectinload(Clan.members)))
    user = result.scalars().first()
    
    if not user or not user.clan:
        return {"clan": None, "message": "User is not in a clan yet."}
    
    clan = user.clan
    members_data = [{"username": m.username, "role": "Member", "stats": m.stats} for m in clan.members]
    
    return {
        "clan": {
            "name": clan.name,
            "sanity_meter": clan.sanity_meter,
            "sync_level": clan.sync_level,
            "members": members_data
        }
    }

@app.get("/api/leaderboard")
async def get_leaderboard(by: str = "national", db: AsyncSession = Depends(get_db)):
    """
    Get Leaderboard:
    - by="national": Top 10 Clans globally.
    - by="regional": Aggregate score by Region (War Status).
    """
    if by == "regional":
        # Aggregate XP/Sanity by Region
        # Note: In real app, this would be a complex query. Mocking aggregation for prototype speed if needed, 
        # but let's try a real query assuming 'region' is populated.
        stmt = select(
            User.region, 
            func.sum(User.xp).label("total_xp"), 
            func.count(User.id).label("user_count")
        ).group_by(User.region)
        
        result = await db.execute(stmt)
        regions = result.all()
        
        return {
            "type": "regional",
            "data": [{"region": r.region, "score": r.total_xp, "army_size": r.user_count} for r in regions]
        }
    
    else:
        # National: Top Clans by Sanity * Members XP (Simplified to just XP sum for now)
        # Ideally, we sum member XP for the clan.
        # For prototype, let's just return Top Users
        result = await db.execute(select(User).order_by(desc(User.xp)).limit(10))
        users = result.scalars().all()
        
        return {
            "type": "national",
            "data": [{"rank": i+1, "username": u.username, "region": u.region, "xp": u.xp, "credits": u.digital_credits} for i, u in enumerate(users)]
        }

# --- Background Tasks ---

async def sunday_raid_trigger():
    print("⚔️ SUNDAY RAID STARTED: The British Council Boss has spawned! ⚔️")
    # In production: Send WebSocket event to all connected clients
    
async def andisha_notification_check():
    print("🔔 Checking for 'Andisha' violations...")
    # Logic: Query all users, check 'daily_battle_completed'.
    # If False, find their clan members and send Telegram alert.
    # For now, we mock it.
    print("Alert sent: 'Gladiator Malika is faltering. Rally them!'")


@app.websocket("/ws/raid/{clan_id}/{username}")
async def websocket_raid(websocket: WebSocket, clan_id: int, username: str):
    await raid_manager.connect(websocket, clan_id, username)
    try:
        while True:
            data = await websocket.receive_text()
            action = json.loads(data)
            await raid_manager.handle_action(clan_id, username, action)
    except WebSocketDisconnect:
        raid_manager.disconnect(clan_id, username)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
