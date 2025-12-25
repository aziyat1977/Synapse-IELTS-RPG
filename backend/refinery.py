from pydantic import BaseModel
from typing import List, Dict, Optional
import openai
import os
import json
import io
from pypdf import PdfReader

# Environment variable check happens in main.py usually, but we need key here if not passed
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai.api_key = OPENAI_API_KEY

class QuestNode(BaseModel):
    id: str
    type: str  # 'vocabulary', 'grammar', 'phonetics', 'coherence'
    title: str
    description: str
    difficulty: float
    coordinates: Dict[str, int] # q, r for hex grid
    status: str # 'locked', 'unlocked', 'completed'
    rewards: Dict[str, int]

async def refine_ielts_content(file_bytes: bytes, filename: str) -> List[QuestNode]:
    """
    Refines raw PDF bytes into a set of QuestNodes
    """
    # 1. Extract Text
    text = extract_text_from_pdf(file_bytes)
    if not text:
        print("Failed to extract text from PDF")
        return get_mock_quests()
        
    # Trim text to fit context window if needed (simple approach: first 3000 chars)
    # Ideally we'd chunk it, but for a game demo, 3000 chars is enough context
    context_text = text[:3000]

    # 2. AI Generation
    prompt = f"""
    You are an IELTS Content Architect. Analyze the following educational text from "{filename}" and extract 5 distinct "Learning Quests".
    Each quest should target a specific linguistic gap (Vocabulary, Grammar, Phonetics, or Coherence) found in or relevant to the text.
    
    Text Excerpt: "...{context_text}..."
    
    Provide the output in JSON format as a list of quest objects:
    [
      {{
        "id": "q_unique_1",
        "type": "vocabulary",
        "title": "Short Epic Title",
        "description": "Quest description.",
        "difficulty": 6.5,
        "coordinates": {{"q": 0, "r": 0}},
        "status": "unlocked",
        "rewards": {{"xp": 100, "sanity": 10}}
      }}
    ]
    
    Requirements:
    1. Generate exactly 5 quests.
    2. Coordinates (q, r) must be unique small integers for a hex grid (e.g. within range -2 to 2).
    3. Ensure variety in 'type'.
    """

    try:
        if not OPENAI_API_KEY:
            print("No OpenAI Key, using mock for refinery")
            return get_mock_quests()

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert IELTS curriculum designer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        quests = []
        raw_list = data.get("quests", data.get("nodes", []))
        
        for idx, q_data in enumerate(raw_list):
            quests.append(QuestNode(
                id=q_data.get("id", f"q_{idx}"),
                type=q_data.get("type", "vocabulary"),
                title=q_data.get("title", "Untitled Quest"),
                description=q_data.get("description", "No description"),
                difficulty=q_data.get("difficulty", 6.0),
                coordinates=q_data.get("coordinates", {"q": 0, "r": 0}),
                status=q_data.get("status", "locked"),
                rewards=q_data.get("rewards", {"xp": 100, "sanity": 10})
            ))
            
        return quests
    except Exception as e:
        print(f"Refinery GPT error: {e}")
        return get_mock_quests()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"PDF Extraction Error: {e}")
        return ""

def get_mock_quests() -> List[QuestNode]:
    return [
        QuestNode(
            id="q1",
            type="vocabulary",
            title="The Academic Lexis",
            description="Master complex academic words in context (Mock Data).",
            difficulty=6.5,
            coordinates={"q": 0, "r": 0},
            status="unlocked",
            rewards={"xp": 150, "sanity": 20}
        ),
        QuestNode(
            id="q2",
            type="grammar",
            title="Tense Mastery",
            description="Navigate the trickiest past perfect tenses. (Mock Data)",
            difficulty=7.0,
            coordinates={"q": 1, "r": -1},
            status="locked",
            rewards={"xp": 200, "sanity": 15}
        ),
        QuestNode(
            id="q3",
            type="coherence",
            title="Logical Links",
            description="Build bridge between ideas with advanced connectors. (Mock Data)",
            difficulty=6.0,
            coordinates={"q": -1, "r": 1},
            status="locked",
            rewards={"xp": 120, "sanity": 10}
        ),
         QuestNode(
            id="q4",
            type="phonetics",
            title="Echoes of Oxford",
            description="Perfect your intonation and stress. (Mock Data)",
            difficulty=7.5,
            coordinates={"q": 0, "r": -2},
            status="locked",
            rewards={"xp": 180, "sanity": 10}
        ),
         QuestNode(
            id="q5",
            type="vocabulary",
            title="Synonym Hunter",
            description="Stop saying 'good' and 'bad'. (Mock Data)",
            difficulty=5.5,
            coordinates={"q": 2, "r": 0},
            status="locked",
            rewards={"xp": 100, "sanity": 5}
        )
    ]
