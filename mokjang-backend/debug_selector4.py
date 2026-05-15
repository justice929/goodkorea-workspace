# -*- coding: utf-8 -*-
import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
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
        await asyncio.sleep(6)
        for _ in range(4):
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(1.5)

        # li.place_apply_pui.EjjAW 상세 구조
        review_html = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('li.place_apply_pui.EjjAW');
                const results = [];
                items.forEach(li => {
                    results.push({
                        html: li.innerHTML.substring(0, 1500),
                        text: (li.innerText || '').substring(0, 200)
                    });
                });
                return results.slice(0, 3);
            }
        """)
        print(f"=== li.place_apply_pui.EjjAW ({len(review_html)} items) ===")
        for i, item in enumerate(review_html):
            print(f"\n--- ITEM {i} TEXT ---")
            print(item['text'])
            print(f"--- ITEM {i} HTML ---")
            print(item['html'])

        # pui__ 클래스 모두 수집
        pui_classes = await page.evaluate("""
            () => {
                const classes = new Set();
                document.querySelectorAll('[class*="pui__"]').forEach(el => {
                    (el.className || '').split(' ').forEach(c => {
                        if (c.startsWith('pui__')) classes.add(c);
                    });
                });
                return Array.from(classes);
            }
        """)
        print("\n=== ALL pui__ CLASSES ===")
        for c in pui_classes:
            print(c)

        await browser.close()

asyncio.run(debug())
