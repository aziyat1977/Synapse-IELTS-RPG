import asyncio
import websockets
import json

async def verify_raid_mechanics():
    uri_base = "ws://localhost:8000/ws/raid/1"
    
    # Retry logic for connection
    max_retries = 5
    for i in range(max_retries):
        try:
            async with websockets.connect(f"{uri_base}/MemberA") as ws_a, \
                       websockets.connect(f"{uri_base}/MemberB") as ws_b, \
                       websockets.connect(f"{uri_base}/MemberC") as ws_c:
                
                print("✅ 3 Members Connected the Raid Lobby.")
                
                # 1. Start Raid
                print("🔄 Starting Raid...")
                await ws_a.send(json.dumps({"type": "start_raid"}))
                
                # Wait for broadcast state - Handle potential queue of 'waiting' messages
                print("🔄 Waiting for Active State...")
                state = None
                # Drain queue up to 10 messages or until active
                for _ in range(10):
                    resp = await ws_a.recv()
                    temp_state = json.loads(resp)["data"]
                    if temp_state['status'] == 'active':
                        state = temp_state
                        break
                
                if not state:
                    print(f"❌ Timed out waiting for active state.")
                    return

                print(f"📡 Raid State: {state['status']}, Question: {state['question']}")
                assert state['status'] == 'active'
                assert state['active_player'] == 'MemberA'
                
                # 2. Member A Turn
                print("🔄 Member A Speaking...")
                await ws_a.send(json.dumps({"type": "submit_part", "content": "I went to Charvak..."}))
                
                resp = await ws_b.recv()
                state = json.loads(resp)["data"]
                print(f"➡️ Turn Passed to: {state['active_player']}")
                assert state['active_player'] == 'MemberB'
                
                # 3. Member B Turn (Power Word injection)
                print("🔄 Member B Injecting Power Word...")
                await ws_b.send(json.dumps({"type": "submit_part", "content": "...which was incredibly **serene**..."}))
                
                # 4. Member C Turn (Conclusion)
                await ws_c.recv() # Sync
                
                print("🔄 Member C Concluding...")
                await ws_c.send(json.dumps({"type": "submit_part", "content": "...despite the scorching heat."}))
                
                # 5. Check Grading
                while True:
                    msg_txt = await ws_a.recv()
                    msg = json.loads(msg_txt)
                    if msg.get("type") == "notification" and "CRITICAL HIT" in msg.get("message", ""):
                        print(f"🎉 Result: {msg['message']}")
                        break
                
                print("🚀 Raid Logic Verified Successfully!")
                return

        except (OSError, ConnectionRefusedError) as e:
            print(f"⚠️ Connection failed (Attempt {i+1}/{max_retries}). Retrying in 1s...")
            await asyncio.sleep(1)
        except Exception as e:
             print(f"❌ Error: {e}")
             break
    print("❌ Failed to connect after multiple retries.")

if __name__ == "__main__":
    asyncio.run(verify_raid_mechanics())
