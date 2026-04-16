from fastapi import FastAPI, Depends, HTTPException, status, Response, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from models import UserCreate, UserLogin, ContestantCreate
from security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import users_collection, contestants_collection
import asyncio
import json
import random
from datetime import timedelta

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AuraVOS Secure Backend")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom Security Headers Middleware (Helmet equivalent)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = get_password_hash(user.password)
    user_dict = {"email": user.email, "hashed_password": hashed_password}
    await users_collection.insert_one(user_dict)
    return {"message": "User registered securely"}

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, user: UserLogin, response: Response):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Store token in HTTP-Only cookie to prevent XSS theft
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True, # Change to True in prod via HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return {"message": "Authenticated securely"}

@app.post("/api/v1/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@app.post("/api/v1/contestants")
async def create_contestant(contestant: ContestantCreate):
    await contestants_collection.insert_one(contestant.model_dump())
    return {"message": "Contestant logged to secure vault"}

@app.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    endpoints = [
        {"ep": "/api/v1/auth/biometric", "verb": "POST", "status": [200, 200, 401]},
        {"ep": "/api/v1/crowd/density", "verb": "GET", "status": [200, 200]},
        {"ep": "/api/v1/concessions/stock", "verb": "PUT", "status": [201, 500]}
    ]
    try:
        while True:
            await asyncio.sleep(random.uniform(0.5, 2.0))
            ep = random.choice(endpoints)
            ip = f"10.42.{random.randint(0, 255)}.{random.randint(0, 255)}"
            stat = random.choice(ep["status"])
            
            payload = {}
            if "biometric" in ep["ep"]:
                payload = {"user_hash": f"0x{random.randint(10000000, 99999999):x}", "confidence": round(random.uniform(0.9, 0.99), 3)}
            else:
                payload = {"sector": f"Sec-{random.randint(1,100)}", "density": f"{random.randint(50,100)}%"}
                
            data = {
                "ip": ip,
                "verb": ep["verb"],
                "endpoint": ep["ep"],
                "status": stat,
                "payload": payload
            }
            await websocket.send_text(json.dumps(data))
    except Exception as e:
        pass

@app.websocket("/api/v1/ws/stadium")
async def websocket_stadium(websocket: WebSocket):
    await websocket.accept()
    # Simulated nodes that match the frontend graph
    nodes = ["n1","n2","n3","n4","n5","n6","n7","n8","n9","n10","f1","f2","r1","r2","g1","g2"]
    events = [
        "Major Play Ongoing!", 
        "Halftime Show initiating...", 
        "Congestion detected at North Gate", 
        "Fast track available at South Gate", 
        "VIP spotted near Concourse B"
    ]
    try:
        while True:
            await asyncio.sleep(2.0)
            
            # Base randomized heat (1 to 10, typically 1 to 5)
            crowd_heat = {node: random.randint(1, 5) for node in nodes}
            
            # Spike 2 to 3 nodes to act as heavy congestion elements
            for _ in range(random.randint(2, 3)):
                crowd_heat[random.choice(nodes)] = random.randint(8, 10)
                
            payload = {
                "crowd_heat": crowd_heat,
                "facility_queues": {
                    "f1": f"{random.randint(2, 20)} min",
                    "f2": f"{random.randint(2, 20)} min",
                    "r1": f"{random.randint(1, 10)} min",
                    "r2": f"{random.randint(1, 10)} min"
                },
                "live_event": random.choice(events) if random.random() > 0.5 else None
            }
            
            await websocket.send_text(json.dumps(payload))
    except Exception as e:
        pass

@app.websocket("/api/v1/ws/organizer")
async def websocket_organizer(websocket: WebSocket):
    await websocket.accept()
    zones = ["North Gate", "South Gate", "Concourse A", "Concourse B", "Food Court 1", "VIP Lounge"]
    incidents = ["Medical Emergency", "Suspicious Package", "Brawl", "Spill", "Fire Alarm"]
    
    try:
        while True:
            await asyncio.sleep(3.0)
            
            payload = {
                "crowd_analytics": {
                    zone: {
                        "count": random.randint(500, 3000),
                        "flow_speed": round(random.uniform(0.2, 1.5), 2),
                        "density": f"{random.randint(40, 100)}%"
                    } for zone in zones
                },
                "staff_locations": [
                    {"id": f"Medic-{i}", "zone": random.choice(zones), "status": "Available" if random.random() > 0.3 else "Busy"} for i in range(1, 4)
                ] + [
                    {"id": f"Security-{i}", "zone": random.choice(zones), "status": "Available" if random.random() > 0.3 else "Busy"} for i in range(1, 6)
                ],
                "incidents": [
                    {"id": f"INC-{random.randint(100,999)}", "type": random.choice(incidents), "zone": random.choice(zones), "severity": random.choice(["Low", "Medium", "Critical"])}
                ] if random.random() > 0.6 else [],
                "ai_recommendations": [
                    {
                        "id": f"REC-{random.randint(1000, 9999)}",
                        "text": f"Deploy additional security to {random.choice(zones)}—crowd rising rapidly.",
                        "action": "Dispatch Staff",
                        "status": "pending"
                    }
                ] if random.random() > 0.5 else []
            }
            await websocket.send_text(json.dumps(payload))
    except Exception as e:
        pass

@app.websocket("/api/v1/ws/social")
async def websocket_social(websocket: WebSocket):
    await websocket.accept()
    friends = ["Alex", "Jordan", "Sam", "Taylor"]
    chat_messages = [
        "Where is everyone?",
        "I'm at the North Gate, it's packed!",
        "Grab me a drink if you're near Concourse A.",
        "Meet me at the VIP Lounge?",
        "Heading to our seats now.",
        "Are we still doing the halftime meetup?",
        "Lost signal for a sec, I'm by the restrooms."
    ]
    zones = ["North Gate", "South Gate", "Concourse A", "Concourse B", "Food Court 1", "VIP Lounge"]
    
    # Initialize some mock coordinates (x: 0-100%, y: 0-100%)
    coords = {f: {"x": random.randint(10, 90), "y": random.randint(10, 90), "zone": random.choice(zones)} for f in friends}
    
    try:
        while True:
            await asyncio.sleep(2.5)
            
            # Wiggle coordinates slightly for authentic live tracking
            for f in friends:
                coords[f]["x"] = max(5, min(95, coords[f]["x"] + random.randint(-5, 5)))
                coords[f]["y"] = max(5, min(95, coords[f]["y"] + random.randint(-5, 5)))
            
            suggested_zone = random.choice(zones)
            density = random.randint(10, 40)
            
            payload = {
                "friends": coords,
                "chat": {
                    "sender": random.choice(friends),
                    "text": random.choice(chat_messages)
                } if random.random() > 0.6 else None,
                "ai_meetup": {
                    "suggestion": f"Optimal Meetup: {suggested_zone}",
                    "reasoning": f"Crowd density at {density}% with clear access paths.",
                    "zone_x": random.randint(20, 80),
                    "zone_y": random.randint(20, 80)
                } if random.random() > 0.8 else None
            }
            await websocket.send_text(json.dumps(payload))
    except Exception as e:
        pass
