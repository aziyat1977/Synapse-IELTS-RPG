from typing import List, Dict, Optional
import asyncio
import json
import openai

class RaidState:
    def __init__(self, clan_id: int):
        self.clan_id = clan_id
        self.status = "waiting" # waiting, active, grading, finished
        self.current_turn_index = 0 # 0, 1, 2 (Refers to members A, B, C)
        self.responses: List[str] = ["", "", ""] # A, B, C parts
        self.members: List[str] = [] # connected usernames in order
        self.question = "Describe a time you had to overcome a significant challenge."
        self.boss_hp = 1000

    def add_member(self, username: str):
        if username not in self.members:
            self.members.append(username)
    
    def next_turn(self):
        self.current_turn_index += 1
        if self.current_turn_index >= 3:
            self.status = "grading"
            return True # Round Finished
        return False

    def get_active_player(self):
        if self.status != "active" or not self.members:
            return None
        return self.members[self.current_turn_index % len(self.members)]

    def to_json(self):
        return {
            "status": self.status,
            "active_player": self.get_active_player(),
            "responses": self.responses,
            "boss_hp": self.boss_hp,
            "question": self.question,
            "members": self.members
        }

class ConnectionManager:
    def __init__(self):
        # clan_id -> {username: websocket}
        self.active_connections: Dict[int, Dict[str, any]] = {} 
        self.raid_states: Dict[int, RaidState] = {}

    async def connect(self, websocket: any, clan_id: int, username: str):
        await websocket.accept()
        if clan_id not in self.active_connections:
            self.active_connections[clan_id] = {}
            self.raid_states[clan_id] = RaidState(clan_id)
        
        self.active_connections[clan_id][username] = websocket
        self.raid_states[clan_id].add_member(username)
        
        await self.broadcast_state(clan_id)

    def disconnect(self, clan_id: int, username: str):
        if clan_id in self.active_connections and username in self.active_connections[clan_id]:
            del self.active_connections[clan_id][username]
            # Cleanup if empty? For now, keep state active for basic persistence
            
    async def broadcast_state(self, clan_id: int):
        if clan_id not in self.active_connections: return
        
        state = self.raid_states[clan_id].to_json()
        message = json.dumps({"type": "state_update", "data": state})
        
        for connection in self.active_connections[clan_id].values():
            try:
                await connection.send_text(message)
            except:
                pass # Handle disconnects gracefully in real app

    async def handle_action(self, clan_id: int, username: str, action: dict):
        state = self.raid_states.get(clan_id)
        if not state: return

        if action["type"] == "start_raid":
            state.status = "active"
            state.question = "Describe a memorable journey you have taken. (Speak about: Where, When, Who with, Why memorable)"
            await self.broadcast_state(clan_id)

        elif action["type"] == "submit_part":
            # Verify turn
            if state.get_active_player() != username:
                return # Not your turn
            
            part_index = state.current_turn_index
            state.responses[part_index] = action["content"]
            
            round_finished = state.next_turn()
            
            if round_finished:
                await self.broadcast_message(clan_id, "All parts submitted! Assessing damage...")
                # Grading Logic
                damage = await self.calculate_damage(" ".join(state.responses))
                state.boss_hp -= damage
                state.status = "finished" if state.boss_hp <= 0 else "waiting" # Reset to waiting for next round or finish
                
                await self.broadcast_message(clan_id, f"CRITICAL HIT! {damage} Damage Dealt.")
            
            await self.broadcast_state(clan_id)

    async def broadcast_message(self, clan_id: int, text: str):
        if clan_id not in self.active_connections: return
        msg = json.dumps({"type": "notification", "message": text})
        for conn in self.active_connections[clan_id].values():
            try: await conn.send_text(msg)
            except: pass

    async def calculate_damage(self, full_response: str) -> int:
        # Mock AI Grading for prototype speed, or use OpenAI if key exists
        if len(full_response) < 10: return 10
        
        # Real AI call could go here
        return len(full_response) * 2 # Simple mock: longer answer = more damage
