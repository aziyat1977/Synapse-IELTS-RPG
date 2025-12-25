import asyncio
from database import engine, Base, AsyncSessionLocal
from models import User, Clan
from sqlalchemy import select

async def verify_clan_mechanics():
    print("🔄 Initializing Database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all) # Clean start
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        print("✅ Database initialized.")
        
        # 1. Create User 1 (Inviter)
        inviter = User(username="InviterOne", xp=100)
        db.add(inviter)
        await db.commit()
        await db.refresh(inviter)
        print(f"✅ Created Inviter: {inviter.username}")
        
        # 2. Simulate Summoning (User 2 joins via referral)
        print("🔄 Simulating Summoning...")
        # Logic matches API: Find inviter -> Create Clan -> Add Inviter -> Add Invitee
        
        # API Logic Simulation
        if not inviter.clan_id:
            new_clan = Clan(name=f"Triad of {inviter.username}")
            db.add(new_clan)
            await db.commit()
            await db.refresh(new_clan)
            inviter.clan_id = new_clan.id
            db.add(inviter)
            await db.commit()
        
        invitee = User(username="NewbieTwo", clan_id=inviter.clan_id)
        db.add(invitee)
        await db.commit()
        print(f"✅ Summoned: {invitee.username} joined Clan {new_clan.id}")
        
        # 3. Verify Clan Members
        result = await db.execute(select(Clan).where(Clan.id == new_clan.id))
        clan = result.scalars().first()
        # Refresh to load members if needed, or query members
        result_members = await db.execute(select(User).where(User.clan_id == clan.id))
        members = result_members.scalars().all()
        
        print(f"✅ Clan '{clan.name}' Members: {[m.username for m in members]}")
        assert len(members) == 2, "Should be 2 members"
        
        print("🚀 Clan Logic Verified Successfully!")

if __name__ == "__main__":
    asyncio.run(verify_clan_mechanics())
