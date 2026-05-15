from fastapi import FastAPI, HTTPException, Header, Depends, Response, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from scraper_v2 import ReviewScraper
from dotenv import load_dotenv
import asyncio
import os
import sys

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"\n[DEBUG] >>> {request.method} {request.url}")
    return await call_next(request)

scraper = ReviewScraper()

@app.on_event("startup")
async def startup_event():
    print("[INFO] Starting application...")
    try:
        await scraper.start() # create_task 대신 직접 await 하여 에러 확인
        print("[INFO] Application startup complete")
    except Exception as e:
        print(f"[CRITICAL] Startup failed: {e}")
        sys.exit(1)

@app.on_event("shutdown")
async def shutdown_event():
    print("[INFO] Shutting down application...")
    await scraper.stop()

@app.get("/")
async def root():
    return {"status": "online"}

@app.post("/scrape")
async def scrape_reviews(request: Request):
    try:
        body = await request.json()
        platform = body.get("platform")
        target_id = body.get("target_id")
        
        print(f"[DEBUG] SCRAPE REQUEST: {platform} | ID: {target_id}")
        
        if platform in ["naver", "네이버"]:
            reviews = await scraper.scrape_naver_reviews(target_id)
        else:
            reviews = []
            
        return {"status": "success", "data": reviews}
    except Exception as e:
        print(f"[ERROR] Scrape Endpoint: {e}")
        return {"status": "error", "detail": str(e)}

@app.post("/reply")
async def post_reply(request: Request):
    try:
        body = await request.json()
        success = await scraper.post_reply(
            body.get("platform"), 
            body.get("review_id"), 
            body.get("reply_text"), 
            body.get("credentials")
        )
        return {"status": "success" if success else "error"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    print("[INFO] Running uvicorn server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
