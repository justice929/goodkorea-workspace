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
        await page.goto('https://m.place.naver.com/restaurant/1078667259/review/visitor', wait_until='networkidle', timeout=40000)
        await asyncio.sleep(5)
        await page.evaluate('window.scrollTo(0, 600)')
        await asyncio.sleep(2)
        await page.screenshot(path='debug_naver2.png', full_page=True)

        # 모든 li 태그와 텍스트 내용 확인
        li_info = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('li');
                const results = [];
                items.forEach(li => {
                    const text = (li.innerText || '').trim().substring(0, 100);
                    if (text.length > 5) {
                        results.push({
                            cls: (li.className || '').substring(0, 50),
                            text: text
                        });
                    }
                });
                return results.slice(0, 30);
            }
        """)
        print('=== ALL LI WITH TEXT ===')
        for item in li_info:
            print(item)

        # ZNnFN 클래스 상세 분석
        znfn = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('li.ZNnFN, li.bspvy');
                const results = [];
                items.forEach(li => {
                    results.push({
                        cls: li.className,
                        html: li.innerHTML.substring(0, 500)
                    });
                });
                return results.slice(0, 3);
            }
        """)
        print('\n=== ZNnFN / bspvy LI HTML ===')
        for item in znfn:
            print('CLASS:', item['cls'])
            print('HTML:', item['html'][:500])
            print('---')

        # 모든 div 클래스 수집 (리뷰 텍스트 포함 가능성)
        div_with_long_text = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('div, span, p');
                const results = [];
                items.forEach(el => {
                    const text = (el.innerText || '').trim();
                    const children = el.children.length;
                    if (text.length > 15 && text.length < 200 && children <= 2) {
                        results.push({
                            tag: el.tagName,
                            cls: (el.className || '').substring(0, 50),
                            text: text.substring(0, 100)
                        });
                    }
                });
                return results.slice(0, 30);
            }
        """)
        print('\n=== DIV/SPAN WITH REVIEW-LENGTH TEXT ===')
        for item in div_with_long_text:
            print(item)

        await browser.close()

asyncio.run(debug())
