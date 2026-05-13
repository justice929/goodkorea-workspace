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
        if not self.context:
            print("[ERROR] Browser context not initialized.")
            return []

        # shop_id 형식: "loginId|password"
        parts = shop_id.split('|')
        if len(parts) < 2 or not parts[0] or not parts[1]:
            print("[WARNING] 배달의민족 로그인 정보 없음. 연동관리에서 ID|비밀번호 형식으로 입력하세요.")
            return []

        login_id, password = parts[0].strip(), parts[1].strip()
        page = await self.context.new_page()

        try:
            # 1. CEO 포털 로그인
            await page.goto("https://ceo.baemin.com/", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)

            # 아이디 입력
            id_input = page.locator('input[type="tel"], input[name="loginId"], input[placeholder*="아이디"], input[placeholder*="전화번호"]').first
            if await id_input.count() == 0:
                print("[ERROR] 배달의민족 로그인 폼을 찾을 수 없습니다.")
                return []
            await id_input.fill(login_id)

            # 비밀번호 입력
            pw_input = page.locator('input[type="password"]').first
            await pw_input.fill(password)

            # 로그인 버튼 클릭
            await page.locator('button[type="submit"], button:has-text("로그인")').first.click()
            await asyncio.sleep(3)

            # 로그인 실패 감지
            if "ceo.baemin.com" not in page.url or await page.locator('text=비밀번호가 틀렸습니다, text=아이디 또는 비밀번호').count() > 0:
                print("[ERROR] 배달의민족 로그인 실패 — ID/비밀번호를 확인하세요.")
                return []

            print(f"[INFO] 배달의민족 로그인 성공: {page.url}")

            # 2. 리뷰 관리 페이지 이동
            review_urls = [
                "https://ceo.baemin.com/review",
                "https://ceo.baemin.com/reviews",
                "https://ceo.baemin.com/store/review",
            ]
            for url in review_urls:
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                    await asyncio.sleep(2)
                    if await page.locator('[class*="review"], [class*="Review"]').count() > 0:
                        break
                except:
                    continue

            # 리뷰 메뉴 클릭 시도 (직접 URL이 안 될 경우)
            if await page.locator('[class*="review"], [class*="Review"]').count() == 0:
                try:
                    menu = page.locator('a:has-text("리뷰"), button:has-text("리뷰")').first
                    if await menu.is_visible():
                        await menu.click()
                        await asyncio.sleep(2)
                except:
                    pass

            # 더보기 클릭
            for _ in range(3):
                try:
                    more = page.locator('button:has-text("더보기"), button:has-text("더 보기")').first
                    if await more.is_visible():
                        await more.click()
                        await asyncio.sleep(1.5)
                    else:
                        break
                except:
                    break

            # 3. 리뷰 추출
            results = []
            selectors = [
                '[class*="ReviewItem"]', '[class*="review-item"]',
                '[data-testid*="review"]', 'li:has([class*="review"])',
                'article:has([class*="star"])',
            ]
            items = []
            for sel in selectors:
                items = await page.locator(sel).all()
                if items:
                    print(f"[INFO] 배달의민족 리뷰 셀렉터 적중: {sel} ({len(items)}개)")
                    break

            for el in items:
                try:
                    text_el = el.locator('[class*="content"], [class*="text"], [class*="comment"], p').first
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""

                    user_el = el.locator('[class*="user"], [class*="nick"], [class*="name"], strong').first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"

                    star_el = el.locator('[class*="star"], [class*="rating"], [aria-label*="점"]').first
                    star_text = await star_el.get_attribute("aria-label") or await star_el.inner_text() if await star_el.count() > 0 else "5"
                    star_match = re.search(r'\d+', star_text)
                    star = min(5, max(1, int(star_match.group()))) if star_match else 5

                    reply_el = el.locator('[class*="reply"], [class*="answer"], [class*="Response"]')
                    has_reply = await reply_el.count() > 0

                    if text.strip():
                        results.append({
                            "id": f"baemin_{len(results)}_{abs(hash(text))}",
                            "platform": "배달의민족",
                            "user": user.strip(),
                            "text": text.strip(),
                            "star": star,
                            "time": "최근",
                            "replied": has_reply
                        })
                except Exception as e:
                    print(f"[DEBUG] 배달의민족 파싱 오류: {e}")
                    continue

            print(f"[INFO] 배달의민족 리뷰 {len(results)}개 수집")
            return results[:25]

        except Exception as e:
            print(f"[ERROR] 배달의민족 스크래핑 실패: {e}")
            return []
        finally:
            await page.close()

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
