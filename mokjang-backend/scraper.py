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
                    # 실제 리뷰 ID 추출 시도
                    review_id = (
                        await el.get_attribute("data-review-id") or
                        await el.get_attribute("data-comment-id") or
                        await el.get_attribute("id") or ""
                    )
                    # 텍스트 추출
                    text_el = el.locator(".z_p_f_z, .z_38Y, .rvS7X, .x9v1A").first
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""

                    # 사용자
                    user_el = el.locator(".PwaS4, .P_p9P, .G89S1").first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"

                    # 별점/평점
                    star_el = el.locator(".hGSR3").first
                    star_text = await star_el.inner_text() if await star_el.count() > 0 else "5"
                    star_match = re.search(r'\d+(\.\d+)?', star_text)
                    star = float(star_match.group()) if star_match else 5

                    # 답글 여부
                    reply_el = el.locator(".pwa_reply")
                    has_reply = await reply_el.count() > 0

                    if text.strip() or user != "익명":
                        # 실제 ID가 있으면 사용, 없으면 해시 기반
                        rid = review_id.strip() if review_id.strip() else f"naver_{len(results)}_{abs(hash(text))}"
                        results.append({
                            "id": rid,
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
        if not self.context:
            print("[ERROR] Browser context not initialized.")
            return []

        # shop_id 형식: "loginId|password"
        parts = shop_id.split('|')
        if len(parts) < 2 or not parts[0] or not parts[1]:
            print("[WARNING] 쿠팡이츠 로그인 정보 없음. 연동관리에서 ID|비밀번호 형식으로 입력하세요.")
            return []

        login_id, password = parts[0].strip(), parts[1].strip()
        page = await self.context.new_page()

        try:
            # 1. 쿠팡이츠 파트너 포털 로그인
            await page.goto("https://store.coupangeats.com/", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)

            # 아이디/이메일 입력
            id_input = page.locator(
                'input[type="email"], input[type="tel"], input[name="username"], '
                'input[name="loginId"], input[placeholder*="아이디"], input[placeholder*="이메일"]'
            ).first
            if await id_input.count() == 0:
                print("[ERROR] 쿠팡이츠 로그인 폼을 찾을 수 없습니다.")
                return []
            await id_input.fill(login_id)

            pw_input = page.locator('input[type="password"]').first
            await pw_input.fill(password)

            await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("로그인하기")').first.click()
            await asyncio.sleep(3)

            # 로그인 실패 감지
            if await page.locator('text=비밀번호가 맞지 않습니다, text=존재하지 않는 계정, text=로그인에 실패').count() > 0:
                print("[ERROR] 쿠팡이츠 로그인 실패 — ID/비밀번호를 확인하세요.")
                return []

            print(f"[INFO] 쿠팡이츠 로그인 성공: {page.url}")

            # 2. 리뷰 관리 페이지 이동
            review_urls = [
                "https://store.coupangeats.com/review",
                "https://store.coupangeats.com/reviews",
                "https://store.coupangeats.com/manage/review",
                "https://store.coupangeats.com/store/review",
            ]
            for url in review_urls:
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                    await asyncio.sleep(2)
                    if await page.locator('[class*="review"], [class*="Review"]').count() > 0:
                        break
                except:
                    continue

            # 직접 URL이 안 될 경우 메뉴 클릭 시도
            if await page.locator('[class*="review"], [class*="Review"]').count() == 0:
                try:
                    menu = page.locator('a:has-text("리뷰"), button:has-text("리뷰"), a:has-text("후기")').first
                    if await menu.is_visible():
                        await menu.click()
                        await asyncio.sleep(2)
                except:
                    pass

            # 더보기 클릭
            for _ in range(3):
                try:
                    more = page.locator('button:has-text("더보기"), button:has-text("더 보기"), button:has-text("더 불러오기")').first
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
                '[class*="ReviewItem"]', '[class*="review-item"]', '[class*="reviewItem"]',
                '[data-testid*="review"]', 'li:has([class*="star"])', 'article:has([class*="star"])',
            ]
            items = []
            for sel in selectors:
                items = await page.locator(sel).all()
                if items:
                    print(f"[INFO] 쿠팡이츠 리뷰 셀렉터 적중: {sel} ({len(items)}개)")
                    break

            for el in items:
                try:
                    text_el = el.locator('[class*="content"], [class*="text"], [class*="comment"], [class*="body"], p').first
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""

                    user_el = el.locator('[class*="user"], [class*="nick"], [class*="name"], strong').first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"

                    star_el = el.locator('[class*="star"], [class*="rating"], [aria-label*="점"], [aria-label*="star"]').first
                    star_raw = await star_el.get_attribute("aria-label") or (await star_el.inner_text() if await star_el.count() > 0 else "5")
                    star_match = re.search(r'\d+', star_raw)
                    star = min(5, max(1, int(star_match.group()))) if star_match else 5

                    reply_el = el.locator('[class*="reply"], [class*="answer"], [class*="Response"], [class*="ceo"]')
                    has_reply = await reply_el.count() > 0

                    if text.strip():
                        results.append({
                            "id": f"coupang_{len(results)}_{abs(hash(text))}",
                            "platform": "쿠팡이츠",
                            "user": user.strip(),
                            "text": text.strip(),
                            "star": star,
                            "time": "최근",
                            "replied": has_reply
                        })
                except Exception as e:
                    print(f"[DEBUG] 쿠팡이츠 파싱 오류: {e}")
                    continue

            print(f"[INFO] 쿠팡이츠 리뷰 {len(results)}개 수집")
            return results[:25]

        except Exception as e:
            print(f"[ERROR] 쿠팡이츠 스크래핑 실패: {e}")
            return []
        finally:
            await page.close()

    async def scrape_yogiyo_reviews(self, shop_id):
        if not self.context:
            print("[ERROR] Browser context not initialized.")
            return []

        parts = shop_id.split('|')
        if len(parts) < 2 or not parts[0] or not parts[1]:
            print("[WARNING] 요기요 로그인 정보 없음. 연동관리에서 ID|비밀번호 형식으로 입력하세요.")
            return []

        login_id, password = parts[0].strip(), parts[1].strip()
        page = await self.context.new_page()

        try:
            # 1. 요기요 사장님 포털 로그인
            await page.goto("https://ceo.yogiyo.co.kr/", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)

            id_input = page.locator(
                'input[type="email"], input[type="tel"], input[name="username"], '
                'input[name="id"], input[placeholder*="아이디"], input[placeholder*="이메일"]'
            ).first
            if await id_input.count() == 0:
                print("[ERROR] 요기요 로그인 폼을 찾을 수 없습니다.")
                return []
            await id_input.fill(login_id)

            pw_input = page.locator('input[type="password"]').first
            await pw_input.fill(password)

            await page.locator('button[type="submit"], button:has-text("로그인"), input[type="submit"]').first.click()
            await asyncio.sleep(3)

            if await page.locator('text=비밀번호가 틀렸습니다, text=아이디 또는 비밀번호, text=로그인에 실패').count() > 0:
                print("[ERROR] 요기요 로그인 실패 — ID/비밀번호를 확인하세요.")
                return []

            print(f"[INFO] 요기요 로그인 성공: {page.url}")

            # 2. 리뷰 관리 페이지 이동
            review_urls = [
                "https://ceo.yogiyo.co.kr/review",
                "https://ceo.yogiyo.co.kr/reviews",
                "https://ceo.yogiyo.co.kr/manage/review",
            ]
            for url in review_urls:
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                    await asyncio.sleep(2)
                    if await page.locator('[class*="review"], [class*="Review"]').count() > 0:
                        break
                except:
                    continue

            if await page.locator('[class*="review"], [class*="Review"]').count() == 0:
                try:
                    menu = page.locator('a:has-text("리뷰"), button:has-text("리뷰"), a:has-text("후기")').first
                    if await menu.is_visible():
                        await menu.click()
                        await asyncio.sleep(2)
                except:
                    pass

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
                '[class*="ReviewItem"]', '[class*="review-item"]', '[class*="reviewItem"]',
                '[data-testid*="review"]', 'li:has([class*="star"])', 'article:has([class*="star"])',
            ]
            items = []
            for sel in selectors:
                items = await page.locator(sel).all()
                if items:
                    print(f"[INFO] 요기요 리뷰 셀렉터 적중: {sel} ({len(items)}개)")
                    break

            for el in items:
                try:
                    text_el = el.locator('[class*="content"], [class*="text"], [class*="comment"], [class*="body"], p').first
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""

                    user_el = el.locator('[class*="user"], [class*="nick"], [class*="name"], strong').first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"

                    star_el = el.locator('[class*="star"], [class*="rating"], [aria-label*="점"]').first
                    star_raw = await star_el.get_attribute("aria-label") or (await star_el.inner_text() if await star_el.count() > 0 else "5")
                    star_match = re.search(r'\d+', star_raw)
                    star = min(5, max(1, int(star_match.group()))) if star_match else 5

                    reply_el = el.locator('[class*="reply"], [class*="answer"], [class*="Response"], [class*="ceo"]')
                    has_reply = await reply_el.count() > 0

                    if text.strip():
                        results.append({
                            "id": f"yogiyo_{len(results)}_{abs(hash(text))}",
                            "platform": "요기요",
                            "user": user.strip(),
                            "text": text.strip(),
                            "star": star,
                            "time": "최근",
                            "replied": has_reply
                        })
                except Exception as e:
                    print(f"[DEBUG] 요기요 파싱 오류: {e}")
                    continue

            print(f"[INFO] 요기요 리뷰 {len(results)}개 수집")
            return results[:25]

        except Exception as e:
            print(f"[ERROR] 요기요 스크래핑 실패: {e}")
            return []
        finally:
            await page.close()

    async def scrape_google_reviews(self, place_id):
        if not self.context:
            print("[ERROR] Browser context not initialized.")
            return []

        if not place_id:
            print("[WARNING] 구글 Place ID 또는 지도 URL이 없습니다.")
            return []

        page = await self.context.new_page()
        try:
            # URL 또는 Place ID 처리
            if place_id.startswith("http"):
                url = place_id
            elif re.match(r'^ChIJ[A-Za-z0-9_-]+$', place_id):
                url = f"https://www.google.com/maps/place/?q=place_id:{place_id}&hl=ko"
            else:
                # 검색어로 처리
                from urllib.parse import quote
                url = f"https://www.google.com/maps/search/{quote(place_id)}/?hl=ko"

            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(3)

            # 검색 결과가 여러 개인 경우 첫 번째 항목 클릭
            first_result = page.locator('a[href*="/maps/place/"]').first
            if await first_result.count() > 0 and "place" not in page.url:
                await first_result.click()
                await asyncio.sleep(2)

            # 리뷰 탭 클릭
            review_tab = page.locator(
                'button[aria-label*="리뷰"], button[data-tab-index="1"], '
                'button:has-text("리뷰"), [role="tab"]:has-text("리뷰")'
            ).first
            if await review_tab.count() > 0 and await review_tab.is_visible():
                await review_tab.click()
                await asyncio.sleep(2)

            # 최신순 정렬
            try:
                sort_btn = page.locator('button[aria-label*="정렬"], button[data-value*="sort"]').first
                if await sort_btn.is_visible():
                    await sort_btn.click()
                    await asyncio.sleep(1)
                    newest = page.locator('[data-index="1"], [aria-label*="최신"], span:has-text("최신순")').first
                    if await newest.is_visible():
                        await newest.click()
                        await asyncio.sleep(2)
            except:
                pass

            # 리뷰 스크롤 (더 많이 로드)
            review_panel = page.locator('[aria-label*="리뷰에 대한"] [role="feed"], .m6QErb').first
            for _ in range(4):
                try:
                    if await review_panel.count() > 0:
                        await review_panel.evaluate("el => el.scrollTop += 1500")
                    else:
                        await page.evaluate("window.scrollBy(0, 1500)")
                    await asyncio.sleep(1.5)
                except:
                    break

            # "더보기" 텍스트 펼치기
            for expand_btn in await page.locator('button[aria-label*="더 보기"], button.w8nwRe').all():
                try:
                    await expand_btn.click()
                    await asyncio.sleep(0.3)
                except:
                    pass

            # 리뷰 추출
            results = []
            # Google Maps 리뷰 컨테이너 셀렉터
            items = await page.locator('[data-review-id], .jftiEf, [class*="gws-localreviews"]').all()

            if not items:
                # 범용 폴백
                items = await page.locator('div[aria-label][class*="review"], div:has(> [aria-label*="별점"])').all()

            print(f"[INFO] 구글 리뷰 항목 {len(items)}개 발견")

            for el in items:
                try:
                    # 별점: aria-label="별점 N점/5점" 패턴
                    star_el = el.locator('[aria-label*="별점"], [aria-label*="star"], [aria-label*="Stars"]').first
                    star_raw = await star_el.get_attribute("aria-label") if await star_el.count() > 0 else "5"
                    star_match = re.search(r'(\d+)', star_raw or "5")
                    star = min(5, max(1, int(star_match.group()))) if star_match else 5

                    # 작성자
                    user_el = el.locator('[class*="d4r55"], [class*="author"], button[aria-label]').first
                    user = await user_el.inner_text() if await user_el.count() > 0 else "익명"
                    # 버튼의 aria-label에서 이름 추출
                    if not user.strip():
                        user = await user_el.get_attribute("aria-label") or "익명"

                    # 리뷰 텍스트
                    text_el = el.locator('[class*="wiI7pd"], [class*="review-full-text"], span[jscontroller]').first
                    if await text_el.count() == 0:
                        text_el = el.locator('span, p').nth(1)
                    text = await text_el.inner_text() if await text_el.count() > 0 else ""

                    # 사장님 답글 여부
                    reply_el = el.locator('[class*="CDe7pd"], [aria-label*="답변"], [class*="owner"]')
                    has_reply = await reply_el.count() > 0

                    if text.strip() or star < 5:
                        results.append({
                            "id": f"google_{len(results)}_{abs(hash(text + user))}",
                            "platform": "구글",
                            "user": user.strip() or "익명",
                            "text": text.strip() or "(텍스트 없는 별점 리뷰)",
                            "star": star,
                            "time": "최근",
                            "replied": has_reply
                        })
                except Exception as e:
                    print(f"[DEBUG] 구글 파싱 오류: {e}")
                    continue

            print(f"[INFO] 구글 리뷰 {len(results)}개 수집")
            return results[:25]

        except Exception as e:
            print(f"[ERROR] 구글 스크래핑 실패: {e}")
            return []
        finally:
            await page.close()

    async def post_reply(self, platform, review_id, reply_text, credentials=""):
        """플랫폼별 답글 등록 통합 메서드"""
        if platform == 'naver':
            return await self.post_naver_reply(review_id, reply_text, credentials)
        print(f"[INFO] Post reply for {platform} — 미구현 플랫폼")
        return False

    async def post_naver_reply(self, review_id, reply_text, credentials=""):
        if not self.context:
            print("[ERROR] Browser context not initialized.")
            return False

        parts = credentials.split('|')
        if len(parts) < 2 or not parts[0] or not parts[1]:
            print("[ERROR] 네이버 SmartPlace 로그인 정보 없음. 연동관리에서 입력해주세요.")
            return False

        login_id, password = parts[0].strip(), parts[1].strip()
        page = await self.context.new_page()

        try:
            # 1. 네이버 로그인
            await page.goto(
                "https://nid.naver.com/nidlogin.login?url=https://smartplace.naver.com/",
                wait_until="domcontentloaded", timeout=30000
            )
            await asyncio.sleep(1)

            await page.locator('#id').fill(login_id)
            await page.locator('#pw').fill(password)
            await page.locator('#log\.login').click()
            await asyncio.sleep(3)

            # 2단계 인증 대기 (최대 60초)
            if "nid.naver.com" in page.url:
                print("[INFO] 네이버 2단계 인증 대기 중 (최대 60초)...")
                for _ in range(30):
                    await asyncio.sleep(2)
                    if "smartplace.naver.com" in page.url:
                        break
                if "nid.naver.com" in page.url:
                    print("[ERROR] 네이버 로그인 실패 또는 2단계 인증 시간 초과")
                    return False

            print(f"[INFO] 네이버 로그인 성공: {page.url}")

            # 2. SmartPlace 리뷰 관리 페이지 이동
            # place_id 없이도 대시보드에서 리뷰 접근
            review_page_urls = [
                "https://smartplace.naver.com/home",
                "https://smartplace.naver.com/",
            ]
            await page.goto(review_page_urls[0], wait_until="domcontentloaded", timeout=20000)
            await asyncio.sleep(2)

            # 리뷰 관리 메뉴 클릭
            try:
                review_menu = page.locator('a:has-text("리뷰"), a[href*="review"]').first
                if await review_menu.is_visible():
                    await review_menu.click()
                    await asyncio.sleep(2)
            except:
                pass

            # 3. 해당 리뷰 찾기 (review_id 기반)
            # 리뷰 ID가 실제 Naver ID인 경우 직접 링크 시도
            found = False
            if not review_id.startswith("naver_"):
                # 실제 리뷰 ID — 직접 요소 찾기 시도
                target = page.locator(f'[data-review-id="{review_id}"], [data-comment-id="{review_id}"], #{review_id}').first
                if await target.count() > 0:
                    await target.scroll_into_view_if_needed()
                    found = True

            if not found:
                # 미답변 리뷰 목록에서 첫 번째 항목에 답글 시도 (fallback)
                print(f"[INFO] review_id({review_id})로 직접 매칭 실패 — 미답변 리뷰 목록 상단에서 시도합니다.")

            # 4. 답글 버튼 클릭
            reply_btn = page.locator(
                'button:has-text("답글 달기"), button:has-text("답글쓰기"), '
                'button:has-text("사장님 댓글"), a:has-text("답글")'
            ).first
            if await reply_btn.count() == 0 or not await reply_btn.is_visible():
                print("[ERROR] 답글 버튼을 찾을 수 없습니다.")
                return False
            await reply_btn.click()
            await asyncio.sleep(1.5)

            # 5. 답글 입력
            textarea = page.locator('textarea[placeholder*="답글"], textarea[placeholder*="댓글"], textarea').first
            if await textarea.count() == 0:
                print("[ERROR] 답글 입력창을 찾을 수 없습니다.")
                return False
            await textarea.fill(reply_text)
            await asyncio.sleep(0.5)

            # 6. 제출
            submit_btn = page.locator(
                'button:has-text("등록"), button:has-text("완료"), button[type="submit"]'
            ).first
            await submit_btn.click()
            await asyncio.sleep(2)

            print("[INFO] 네이버 답글 등록 완료")
            return True

        except Exception as e:
            print(f"[ERROR] 네이버 답글 등록 실패: {e}")
            return False
        finally:
            await page.close()
