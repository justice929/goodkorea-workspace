from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scraper import ReviewScraper
import asyncio

app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "MokjangMoksai Backend is running!"}

scraper = ReviewScraper()

@app.on_event("startup")
async def startup_event():
    await scraper.start()

@app.on_event("shutdown")
async def shutdown_event():
    await scraper.stop()

class LoginRequest(BaseModel):
    platform: str
    username: str
    password: str

class ScrapeRequest(BaseModel):
    platform: str
    target_id: str

@app.on_event("startup")
async def startup_event():
    await scraper.start()

@app.on_event("shutdown")
async def shutdown_event():
    await scraper.stop()

@app.post("/login")
async def login(req: LoginRequest):
    try:
        if req.platform == "naver":
            await scraper.login_naver(req.username, req.password)
            return {"status": "success", "message": "Logged into Naver"}
        else:
            raise HTTPException(status_code=400, detail="Platform not supported yet")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scrape")
async def scrape_reviews(req: ScrapeRequest):
    try:
        if req.platform == "naver":
            reviews = await scraper.scrape_naver_reviews(req.target_id)
            return {"status": "success", "data": reviews}
        else:
            return {"status": "success", "data": []} # Mock
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
