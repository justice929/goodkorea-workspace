import asyncio
from playwright.async_api import async_playwright
import re

class ReviewScraper:
    def __init__(self):
        self.browser = None
        self.context = None
        self.playwright = None

    async def start(self):
        try:
            if not self.playwright:
                self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self.context = await self.browser.new_context(
                viewport={'width': 390, 'height': 844},
                user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
            )
            print("[INFO] Browser started in background mode")
        except Exception as e:
            print(f"[ERROR] Browser start failed: {e}")
            raise

    async def stop(self):
        try:
            if self.browser: await self.browser.close()
            if self.playwright: await self.playwright.stop()
        except: pass

    async def scrape_naver_reviews(self, input_id):
        if not self.context: await self.start()

        place_id = input_id
        if not str(input_id).isdigit():
            print(f"[INFO] Searching for place: {input_id}")
            page = await self.context.new_page()
            try:
                await page.goto(f"https://map.naver.com/v5/search/{input_id}", wait_until="domcontentloaded")
                await asyncio.sleep(3)
                match = re.search(r'place/(\d+)', page.url)
                if match:
                    place_id = match.group(1)
                else:
                    content = await page.content()
                    id_match = re.search(r'place/(\d+)', content)
                    if id_match: place_id = id_match.group(1)
            except: pass
            finally: await page.close()

        page = await self.context.new_page()
        url = f"https://m.place.naver.com/restaurant/{place_id}/review/visitor"
        results = []

        try:
            print(f"[INFO] Scraping: {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=40000)

            # 리뷰 아이템이 DOM에 나타날 때까지 대기
            try:
                await page.wait_for_selector("li.place_apply_pui.EjjAW", timeout=20000)
            except:
                await asyncio.sleep(8)

            # 스크롤로 추가 리뷰 로딩
            for _ in range(3):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(2)

            # 리뷰 아이템 수집
            items = await page.locator("li.place_apply_pui.EjjAW").all()
            print(f"[DEBUG] Found {len(items)} review items")

            for el in items:
                try:
                    # 본문
                    text_el = el.locator(".pui__vn15t2").first
                    text = (await text_el.inner_text()).strip() if await text_el.count() > 0 else ""
                    if not text: continue

                    # 유저명
                    user_el = el.locator(".pui__NMi-Dp").first
                    user = (await user_el.inner_text()).strip() if await user_el.count() > 0 else "익명 손님"

                    # 날짜
                    date_el = el.locator(".pui__4APmFd").first
                    date = (await date_el.inner_text()).strip() if await date_el.count() > 0 else "최근"

                    # 사장님 답글 여부
                    has_reply = await el.locator(".pui__J0tczd").count() > 0

                    # 리뷰 이미지
                    images = []
                    img_els = await el.locator("img[src*='pstatic.net']:not([src*='profile']):not([src*='avatar']):not([src*='sticker']):not([src*='static/image/emoji'])").all()
                    for img in img_els:
                        src = await img.get_attribute("src")
                        # 가로세로 크기가 너무 작은 것(아이콘 등)은 제외 (선택 사항이나 속성으로 필터링)
                        if src and "type=f" in src: # 네이버 리뷰 사진은 보통 f타입 썸네일을 씀
                            images.append(src)
                        elif src and ("sticker" not in src.lower() and "emoji" not in src.lower()):
                            images.append(src)

                    results.append({
                        "id": f"naver_{len(results)}_{abs(hash(text))}",
                        "platform": "네이버",
                        "user": user,
                        "text": text,
                        "star": 5,
                        "time": date,
                        "replied": has_reply,
                        "images": list(set(images))
                    })
                except: continue

            print(f"[INFO] Total {len(results)} reviews scraped")

        except Exception as e:
            print(f"[ERROR] Scrape Error: {e}")
        finally:
            await page.close()

        return results[:30]

    async def post_reply(self, platform, review_id, reply_text, credentials=""):
        return False
