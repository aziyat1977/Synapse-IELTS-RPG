# Synapse: The IELTS RPG

<div align="center">

![Synapse Logo](https://img.shields.io/badge/SYNAPSE-The_IELTS_RPG-8b5cf6?style=for-the-badge)
[![Telegram](https://img.shields.io/badge/Telegram-Mini_App-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/synapse_ielts_bot)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Reverse-engineer your gaps. Slay your demons. Master the system.**

</div>

## 🎮 Overview

Synapse is not your typical IELTS prep app. It's a **dark-mode RPG combat system** that transforms language learning into an epic battle against your own neural gaps. Using cutting-edge AI (OpenAI Whisper + GPT-4o-mini), every mistake you make spawns a unique "Syntax Demon" that you must defeat through Quick-Time Events (QTE).

### 🧠 Core Philosophy

- **Gap Graph Logic**: We don't track lessons—we track neural voids across 4 domains (Vocabulary, Syntax, Phonetics, Coherence)
- **Mastery Score Formula**: `(Accuracy × (TimeLimit - ResponseTime)) / Complexity`
- **The 3-Second Reflex**: Native-level combat timing for dopamine-driven engagement
- **Sanity Meter**: Scarcity mechanic that makes students *want* to study more

---

## 🚀 Features

### ✅ Task 1: Diagnostic Raid UI
- **Dark-mode landing screen** with animated neural circuit backgrounds
- **"Begin Diagnostic Raid" button** triggers 30-second voice recording
- Real-time **waveform visualization** during recording
- Microphone access with graceful fallback

### ✅ Task 2: Gap Graph & Reverse Engineering
- **AI-powered analysis** using GPT-4o-mini
- Error detection: Tense errors, Article omissions, Subject-verb agreement, etc.
- **Dynamic enemy generation**: "The Chronos Wraith" for tense errors, "The Void Specter" for article issues
- Visual gap graph showing 4-domain neural void percentages

### ✅ Task 3: Combat Mechanics (QTE)
- **3-second countdown** Quick-Time Events
- Sentence completion challenges targeting player weaknesses
- **Mastery Score calculation** with formula breakdown
- **Critical Hit system** (80%+ damage = epic particle effects)
- Enemy HP bars with damage visualization

### ✅ Task 4: Localization & Payments
- English UI with placeholder architecture
- **Click/Payme payment integration** ready (Uzbekistan-focused)
- Shop section framework for future monetization

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18.3+)
- **Tailwind CSS** (custom Synapse theme)
- **Framer Motion** (for AAA-game animations)
- **Zustand** (lightweight state management)
- **Telegram Web Apps SDK** (for TMA integration)

### Backend
- **FastAPI** (Python 3.9+)
- **OpenAI Whisper API** (speech-to-text)
- **GPT-4o-mini** (error analysis & enemy generation)
- **Cloudflare Workers/Pages** (deployment)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key

### 1. Clone & Install
```bash
cd d:/apps/game
git clone <your-repo-url> synapse-ielts-rpg
cd synapse-ielts-rpg
npm install
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables
Create `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run Development Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run backend
```

The app will run on:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## 🌐 Deployment

### Cloudflare Workers/Pages

1. **Install Wrangler CLI**:
```bash
npm install -g wrangler
```

2. **Configure Secrets**:
```bash
wrangler secret put OPENAI_API_KEY
```

3. **Deploy**:
```bash
wrangler deploy
```

### Telegram Mini App Setup

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Set the Web App URL: `/newapp` → `https://your-cloudflare-url.com`
3. Test in Telegram: Open your bot and launch the app

---

## 🎯 Game Mechanics Deep Dive

### The Mastery Score Formula

```
MasteryScore = (Accuracy × (TimeLimit - ResponseTime)) / Complexity

Where:
- Accuracy: 1 (correct) or 0 (wrong)
- TimeLimit: 3.0 seconds (the native-speaker reflex standard)
- ResponseTime: How fast the user answers
- Complexity: IELTS Band Level (5.5, 6.5, 7.5)
```

**Example:**
- User answers correctly in 1.2s on a Band 6.5 question
- MasteryScore = (1 × (3.0 - 1.2)) / 6.5 = **0.277**
- Damage Dealt = **27.7** (out of 100 HP)
- If score ≥ 0.8 → **CRITICAL HIT** 🎯

### Enemy Types

| Error Type | Enemy Name | Type | Weakness |
|------------|------------|------|----------|
| Tense Error | The Chronos Wraith | Syntax Demon | Past Perfect |
| Article Missing | The Void Specter | Grammar Demon | Definite Articles |
| Subject-Verb | The Discord Fiend | Syntax Demon | 3rd Person Singular |
| Vocabulary | The Lexicon Shade | Word Demon | Academic Words |
| Pronunciation | The Echo Phantom | Phonetic Demon | IPA Mastery |

---

## 🇺🇿 Uzbekistan Integration

### Cultural Considerations
- **Andisha (Social Standing)**: Clan system for accountability
- **Scarcity Mindset**: Sanity Meter creates urgency
- **Payment Methods**: Click & Payme integration for local users
- **Localization**: Cyrillic support ready for Phase 2

---

## 📊 Project Structure

```
synapse-ielts-rpg/
├── backend/
│   ├── main.py              # FastAPI server + OpenAI integration
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/
│   │   ├── LandingScreen.jsx     # Task 1: Landing UI
│   │   ├── DiagnosticRaid.jsx    # Task 1: Voice recording
│   │   ├── GapAnalysis.jsx       # Task 2: AI analysis display
│   │   └── CombatArena.jsx       # Task 3: QTE combat
│   ├── store/
│   │   └── gameStore.js          # Zustand state management
│   ├── App.jsx                   # Main router + Telegram SDK
│   └── index.css                 # Tailwind + custom RPG styles
├── wrangler.toml            # Cloudflare Workers config
├── tailwind.config.js       # Custom Synapse theme
└── README.md                # This file
```

---

## 🔮 Future Roadmap

- [ ] **Clan System**: Social accountability for Uzbek students
- [ ] **Sanity Meter**: 2-hour daily limit with "Sunset" animation
- [ ] **Shop System**: Click/Payme integration for power-ups
- [ ] **3D World Map**: React-Three-Fiber hex-grid levels
- [ ] **PDF Content Pipeline**: Auto-generate quests from IELTS materials
- [ ] **Leaderboards**: Regional rankings for competitiveness

---

## 👨‍💻 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Epic Games** for inspiring the tight combat mechanics
- **Duolingo** for gamification patterns (but we're better 😉)
- **Uzbekistan's IELTS Community** for being the target we're building for
- **OpenAI** for Whisper + GPT-4o-mini APIs

---

<div align="center">

**Made with 🧠 for the 16-year-old in Namangan tired of boring tutors**

[Report Bug](issues) · [Request Feature](issues) · [Join Community](https://t.me/synapse_ielts_community)

</div>
