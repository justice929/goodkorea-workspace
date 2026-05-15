# -*- coding: utf-8 -*-
import asyncio
import sys
import io
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

        # 스크롤해서 리뷰 로딩 유도
        for _ in range(3):
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(1.5)

        await page.screenshot(path='debug_naver3.png', full_page=True)

        # 전체 HTML 저장
        html = await page.content()
        with open('debug_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"HTML saved: {len(html)} bytes")

        # 모든 li 클래스 + 텍스트
        li_info = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('li');
                const results = [];
                items.forEach(li => {
                    const text = (li.innerText || '').trim().substring(0, 80);
                    if (text.length > 5) {
                        results.push({ cls: (li.className||'').substring(0,50), text });
                    }
                });
                return results;
            }
        """)
        print(f"\n=== ALL LI ({len(li_info)} total) ===")
        for item in li_info:
            print(item['cls'], '|', item['text'][:60])

        # 15자 이상 텍스트를 가진 span/div (리뷰 본문 후보)
        spans = await page.evaluate("""
            () => {
                const results = [];
                document.querySelectorAll('span, div, p').forEach(el => {
                    if (el.children.length > 2) return;
                    const t = (el.innerText || '').trim();
                    if (t.length >= 15 && t.length <= 200) {
                        results.push({
                            tag: el.tagName,
                            cls: (el.className||'').substring(0,60),
                            text: t.substring(0,80)
                        });
                    }
                });
                return results.slice(0, 40);
            }
        """)
        print(f"\n=== TEXT NODES (15~200 chars) - {len(spans)} found ===")
        for s in spans:
            print(f"[{s['tag']}] .{s['cls']} => {s['text']}")

        await browser.close()

asyncio.run(debug())
