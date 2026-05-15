# -*- coding: utf-8 -*-
import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from scraper_v2 import ReviewScraper

async def test():
    s = ReviewScraper()
    await s.start()
    reviews = await s.scrape_naver_reviews('1078667259')
    await s.stop()
    print(f'총 리뷰: {len(reviews)}개')
    for r in reviews[:5]:
        print(f'  [{r["user"]}] {r["time"]} | 답글:{r["replied"]} | {r["text"][:60]}...')

asyncio.run(test())
