import OpenAI from 'openai';
import { AnalysisResult, ErrorDetail, CustomEnemy, Question } from './types';

export class OpenAIService {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    // Transcribe audio using Whisper API
    async transcribeAudio(audioBuffer: ArrayBuffer, prompt?: string): Promise<string> {
        try {
            const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

            const transcription = await this.client.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                prompt: prompt || 'English speech with Uzbek accent. Focus on comprehensibility, not accent.',
                language: 'en',
                response_format: 'json'
            });

            return transcription.text;
        } catch (error) {
            console.error('Whisper transcription error:', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    // Analyze transcript for IELTS errors using GPT-4o-mini
    async analyzeTranscript(transcript: string): Promise<AnalysisResult> {
        const systemPrompt = `You are an IELTS expert analyzing spoken English. Detect errors in:
1. Grammar (verb tenses, subject-verb agreement, articles)
2. Vocabulary (word choice, collocations)
3. Pronunciation issues that affect comprehensibility (not accent)
4. Fluency (hesitations, repetitions, incomplete thoughts)

Return a JSON object with:
{
  "bandEstimate": 5.5,
  "errors": [
    {"type": "grammar", "original": "I goes", "correction": "I go", "explanation": "..."},
    {"type": "vocabulary", "original": "big problem", "correction": "significant issue", "explanation": "..."}
  ],
  "gapGraph": {"grammar": 60, "vocabulary": 40, "pronunciation": 80, "fluency": 70}
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze this English speech: "${transcript}"` }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('No response from GPT');

            const analysis = JSON.parse(content);

            // Generate enemy based on primary error type
            const primaryError = analysis.errors[0];
            const enemy = this.generateEnemy(primaryError);

            // Generate adaptive questions
            const questions = this.generateQuestions(analysis.errors, analysis.bandEstimate);

            return {
                bandEstimate: analysis.bandEstimate,
                errors: analysis.errors,
                enemy,
                gapGraph: analysis.gapGraph,
                questions
            };
        } catch (error) {
            console.error('GPT analysis error:', error);
            throw new Error('Failed to analyze transcript');
        }
    }

    // Analyze voice combat attack
    async analyzeVoiceCombat(transcript: string, enemyWeakness: string): Promise<{
        damage: number;
        isCritical: boolean;
        feedback: string;
        recoilType: string;
    }> {
        const systemPrompt = `You are analyzing a voice attack in an RPG combat system. 
The enemy's weakness is: ${enemyWeakness}.

Evaluate the speech for:
1. Fluency (hesitations reduce damage)
2. Vocabulary complexity (advanced words = more damage)
3. Grammar accuracy (errors reduce damage)
4. How well it exploits the enemy's weakness

Return JSON:
{
  "damage": 15-100,
  "isCritical": true/false,
  "feedback": "brief feedback",
  "recoilType": "recoil-light" | "recoil-medium" | "recoil-heavy" | "critical-hit"
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Speech: "${transcript}"` }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('No combat analysis');

            return JSON.parse(content);
        } catch (error) {
            console.error('Voice combat analysis error:', error);
            // Return default values on error
            return {
                damage: 10,
                isCritical: false,
                feedback: 'Attack landed but caused minimal damage',
                recoilType: 'recoil-light'
            };
        }
    }

    // Generate enemy based on error type
    private generateEnemy(error?: ErrorDetail): CustomEnemy {
        const enemies: Record<string, CustomEnemy> = {
            grammar: {
                name: 'Grammar Gargoyle',
                type: 'grammar',
                description: 'A stone beast that feeds on broken sentences',
                weakness: 'Perfect verb tenses and subject-verb agreement',
                hp: 120,
                image: '🗿',
                color: '#8B4513'
            },
            vocabulary: {
                name: 'Lexicon Lich',
                type: 'vocabulary',
                description: 'An undead scholar hoarding forbidden words',
                weakness: 'Advanced academic vocabulary and collocations',
                hp: 100,
                image: '📚',
                color: '#4B0082'
            },
            pronunciation: {
                name: 'Phonetic Phantom',
                type: 'pronunciation',
                description: 'A ghost that distorts your voice',
                weakness: 'Clear articulation and proper stress patterns',
                hp: 90,
                image: '👻',
                color: '#9370DB'
            },
            fluency: {
                name: 'Hesitation Hydra',
                type: 'fluency',
                description: 'A many-headed serpent that multiplies with every pause',
                weakness: 'Smooth, continuous speech with natural linking',
                hp: 110,
                image: '🐉',
                color: '#DC143C'
            }
        };

        const errorType = error?.type || 'grammar';
        return enemies[errorType] || enemies.grammar;
    }

    // Generate adaptive questions based on errors
    private generateQuestions(errors: ErrorDetail[], bandEstimate: number): Question[] {
        // For now, return a simplified question set
        // In production, this would use GPT to generate contextual questions
        const questions: Question[] = [
            {
                id: 1,
                prompt: `Correct this sentence: "${errors[0]?.original || 'I goes to school'}"`,
                options: [
                    errors[0]?.correction || 'I go to school',
                    'I going to school',
                    'I gone to school',
                    'I went to school'
                ],
                correctAnswer: errors[0]?.correction || 'I go to school',
                complexity: bandEstimate > 6 ? 0.8 : 0.5,
                explanation: errors[0]?.explanation || 'Use proper subject-verb agreement'
            }
        ];

        return questions;
    }
}
