import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        ctx = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        )
        page = await ctx.new_page()
        await page.goto('https://m.place.naver.com/restaurant/1078667259/review/visitor', wait_until='domcontentloaded', timeout=30000)
        await asyncio.sleep(6)
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        await asyncio.sleep(2)
        await page.screenshot(path='debug_naver.png', full_page=False)

        # li 태그 클래스 수집
        li_classes = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('li');
                const classes = new Set();
                items.forEach(li => {
                    if (li.className) classes.add(li.className.trim().substring(0, 80));
                });
                return Array.from(classes).slice(0, 40);
            }
        """)
        print('=== LI CLASSES ===')
        for c in li_classes:
            print(repr(c))

        # 리뷰처럼 보이는 텍스트 요소
        texts = await page.evaluate("""
            () => {
                const els = document.querySelectorAll('[class*=review], [class*=Review], [class*=text_], [class*=Text], [class*=body], [class*=comment]');
                const results = [];
                els.forEach(el => {
                    const t = (el.innerText || '').trim();
                    if (t && t.length > 10 && t.length < 300) {
                        results.push({
                            cls: el.className.substring(0, 60),
                            tag: el.tagName,
                            text: t.substring(0, 80)
                        });
                    }
                });
                return results.slice(0, 20);
            }
        """)
        print('\n=== REVIEW-LIKE ELEMENTS ===')
        for t in texts:
            print(t)

        # 전체 HTML 구조 일부
        html_snippet = await page.evaluate("""
            () => {
                const ul = document.querySelector('ul');
                return ul ? ul.innerHTML.substring(0, 3000) : 'No UL found';
            }
        """)
        print('\n=== FIRST UL HTML (3000 chars) ===')
        print(html_snippet[:3000])

        await browser.close()

asyncio.run(debug())
