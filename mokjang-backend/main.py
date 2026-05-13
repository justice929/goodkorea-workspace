from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from scraper import ReviewScraper
from dotenv import load_dotenv
import asyncio
import os

load_dotenv()

app = FastAPI()

BACKEND_API_KEY = os.getenv("BACKEND_API_KEY")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

def verify_api_key(x_api_key: str = Header(...)):
    if BACKEND_API_KEY and x_api_key != BACKEND_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/")
async def root():
    return {"status": "online", "message": "MokjangMoksai Backend is running!"}

scraper = ReviewScraper()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(scraper.start())

@app.on_event("shutdown")
async def shutdown_event():
    await scraper.stop()

ALLOWED_PLATFORMS = {"naver", "배달의민족", "쿠팡이츠", "요기요", "구글"}

class ScrapeRequest(BaseModel):
    platform: str
    target_id: str

    @field_validator("platform")
    @classmethod
    def platform_must_be_valid(cls, v: str) -> str:
        if v not in ALLOWED_PLATFORMS:
            raise ValueError(f"지원하지 않는 플랫폼: {v}")
        return v

    @field_validator("target_id")
    @classmethod
    def target_id_must_be_safe(cls, v: str) -> str:
        if len(v) > 200:
            raise ValueError("target_id가 너무 깁니다")
        return v.strip()

class ReplyRequest(BaseModel):
    platform: str
    place_id: str
    review_id: str
    reply_text: str
    credentials: str = ""  # "loginId|password" — 로그인이 필요한 플랫폼용

    @field_validator("reply_text")
    @classmethod
    def reply_text_length(cls, v: str) -> str:
        if len(v) > 1000:
            raise ValueError("답글은 1000자를 초과할 수 없습니다")
        return v.strip()

@app.post("/scrape", dependencies=[Depends(verify_api_key)])
async def scrape_reviews(req: ScrapeRequest):
    try:
        if req.platform == "naver":
            reviews = await scraper.scrape_naver_reviews(req.target_id)
        elif req.platform == "배달의민족":
            reviews = await scraper.scrape_baemin_reviews(req.target_id)
        elif req.platform == "쿠팡이츠":
            reviews = await scraper.scrape_coupang_reviews(req.target_id)
        elif req.platform == "요기요":
            reviews = await scraper.scrape_yogiyo_reviews(req.target_id)
        elif req.platform == "구글":
            reviews = await scraper.scrape_google_reviews(req.target_id)
        else:
            reviews = []
        return {"status": "success", "data": reviews}
    except Exception as e:
        print(f"[ERROR] Scrape endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="리뷰 조회 중 오류가 발생했습니다.")

@app.post("/reply", dependencies=[Depends(verify_api_key)])
async def post_reply(req: ReplyRequest):
    try:
        success = await scraper.post_reply(req.platform, req.review_id, req.reply_text, req.credentials)
        if success:
            return {"status": "success", "message": f"Reply posted to {req.platform}"}
        else:
            raise HTTPException(status_code=500, detail="답글 등록에 실패했습니다.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Reply endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="답글 등록 중 오류가 발생했습니다.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
