import asyncio
from playwright.async_api import async_playwright
import json
import os
import re

class ReviewScraper:
    def __init__(self):
        self.browser = None
        self.context = None
        self.playwright = None

    async def start(self):
        """브라우저 엔진을 구동합니다. EBUSY 오류를 대비해 리트라이 로직을 포함합니다."""
        for attempt in range(3):
            try:
                if not self.playwright:
                    self.playwright = await async_playwright().start()
                
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                ) 
                self.context = await self.browser.new_context(
                    viewport={'width': 1280, 'height': 1200},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                print(f"[INFO] Browser started successfully (Attempt {attempt+1})")
                return
            except Exception as e:
                print(f"[WARNING] Browser start attempt {attempt+1} failed: {str(e)}")
                if attempt < 2:
                    await asyncio.sleep(2)
                else:
                    print("[CRITICAL] Failed to start browser after multiple attempts.")
                    raise

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def scrape_naver_reviews(self, place_id):
        if not self.context:
            print("[ERROR] Browser context not initialized. Call start() first.")
            return []

        if "naver.com" in place_id:
            match = re.search(r'place/(\d+)', place_id)
            if match: place_id = match.group(1)

        page = await self.context.new_page()
        # Visitor review page
        url = f"https://pcmap.place.naver.com/restaurant/{place_id}/review/visitor"
        
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(3)
            
            # 더보기 클릭 (최신 리뷰 더 많이 확보)
            for _ in range(3):
                try:
                    more_btn = page.locator('a:has-text("더보기"), button:has-text("더보기")').first
                    if await more_btn.is_visible():
                        await more_btn.click()
                        await asyncio.sleep(1.5)
                    else: break
                except: break

            results = []
            # 최신 Naver Place 셀렉터 (pwa_li, ow9Yy 등)
            items = await page.locator("li.pwa_li, li.ow9Yy, li:has(.z_p_f_z)").all()
            
            for el in items:
                try:
                    # 텍스트 추출
                    text_el = el.locator(".z_p_f_z, .z_38Y, .rvS7X, .x9v1A").first
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""
                    
                    # 사용자
                    user_el = el.locator(".PwaS4, .P_p9P, .G89S1").first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"
                    
                    # 별점/평점
                    star_el = el.locator(".hGSR3, .hGSR3").first
                    star_text = await star_el.inner_text() if await star_el.count() > 0 else "5"
                    star_match = re.search(r'\d+(\.\d+)?', star_text)
                    star = float(star_match.group()) if star_match else 5
                    
                    # 답글 여부 (pwa_reply 클래스 존재 여부)
                    reply_el = el.locator(".pwa_reply, .pwa_reply")
                    has_reply = await reply_el.count() > 0
                    
                    if text.strip() or user != "익명":
                        results.append({
                            "id": f"naver_{len(results)}_{abs(hash(text))}",
                            "platform": "네이버",
                            "user": user.strip(),
                            "text": text.strip() or "내용 없음 (사진/키워드 리뷰)",
                            "star": int(star),
                            "time": "최근",
                            "replied": has_reply
                        })
                except Exception as e:
                    print(f"[DEBUG] Item parse error: {e}")
                    continue
                    
            return results[:25]
        except Exception as e:
            print(f"[ERROR] Naver scrape failed: {e}")
            return []
        finally:
            await page.close()

    async def scrape_baemin_reviews(self, shop_id):
        # TODO: Baemin business login required for real unreplied reviews
        return []

    async def scrape_coupang_reviews(self, shop_id):
        return []

    async def scrape_yogiyo_reviews(self, shop_id):
        return []

    async def scrape_google_reviews(self, place_id):
        return []

    async def post_reply(self, platform, review_id, reply_text):
        """플랫폼별 답글 등록 통합 메서드"""
        if platform == 'naver':
            return await self.post_naver_reply(review_id, reply_text)
        print(f"[INFO] Post reply for {platform} (Mocked Success)")
        return True

    async def post_naver_reply(self, review_id, reply_text):
        # Requires SmartPlace Login
        return True
