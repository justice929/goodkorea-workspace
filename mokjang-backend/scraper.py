import asyncio
from playwright.async_api import async_playwright
import json
import os

class ReviewScraper:
    def __init__(self):
        self.browser = None
        self.context = None

    async def start(self):
        self.playwright = await async_playwright().start()
        # headed=True for better anti-bot bypass on Naver/Coupang
        self.browser = await self.playwright.chromium.launch(headless=False) 
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def login_naver(self, username, password):
        page = await self.context.new_page()
        await page.goto("https://nid.naver.com/nidlogin.login")
        
        # Use clipboard-style login to bypass bot detection
        await page.evaluate(f'navigator.clipboard.writeText("{username}")')
        await page.focus("#id")
        await page.keyboard.press("Control+V")
        
        await page.evaluate(f'navigator.clipboard.writeText("{password}")')
        await page.focus("#pw")
        await page.keyboard.press("Control+V")
        
        await page.click(".btn_login")
        await page.wait_for_load_state("networkidle")
        return page

    async def scrape_naver_reviews(self, place_id):
        page = await self.context.new_page()
        # Visitor reviews page
        url = f"https://pcmap.place.naver.com/restaurant/{place_id}/review/visitor"
        await page.goto(url)
        await page.wait_for_load_state("domcontentloaded")
        
        # Scroll and click 'More' button
        for _ in range(2):
            try:
                more_button = page.get_by_role("button", name="더보기")
                if await more_button.is_visible():
                    await more_button.click()
                    await asyncio.sleep(1)
                else:
                    break
            except:
                break

        # More robust parsing
        results = []
        # li.ow9Yy is common, but let's try a broader search if needed
        items = await page.locator("li:has(.z_38Y), li:has(.P_p9P)").all()
        
        for el in items:
            try:
                # Text content - multiple possible selectors
                text_el = el.locator(".z_38Y, .rvS7X, .x9v1A")
                text = await text_el.first.inner_text()
                
                # User name
                user_el = el.locator(".P_p9P, .h069P, .G89S1")
                user = await user_el.first.inner_text()
                
                # Star/Rating (often not present in newer Naver UI, usually 'Visit count' instead)
                star = 5
                
                results.append({
                    "id": f"naver_{len(results)}",
                    "platform": "네이버",
                    "user": user.strip(),
                    "text": text.strip(),
                    "star": star,
                    "time": "최근"
                })
                if len(results) >= 10: break # Limit for MVP
            except:
                continue
        
        await page.close()
        return results

    async def scrape_baemin_reviews(self, shop_id):
        # Baemin CEO portal scraping logic
        # ...
        return []

async def test_scraper():
    scraper = ReviewScraper()
    await scraper.start()
    print("Scraper started...")
    # Add test calls here
    await scraper.stop()

if __name__ == "__main__":
    asyncio.run(test_scraper())
