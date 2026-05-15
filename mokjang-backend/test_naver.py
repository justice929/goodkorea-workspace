import asyncio
from scraper_v2 import ReviewScraper
import sys

# 인코딩 문제 방지
sys.stdout.reconfigure(encoding='utf-8')

async def test():
    scraper = ReviewScraper()
    print("--- Naver Scraper Test Start ---")
    # '락희차이나' (Place ID: 1078667259)
    try:
        results = await scraper.scrape_naver_reviews("1078667259")
        
        if results:
            print(f"Success! Found {len(results)} reviews.")
            for i, r in enumerate(results[:3]):
                print(f"[{i+1}] User: {r['user']}")
                print(f"    Text: {r['text'][:100]}...")
                print(f"    Images: {len(r['images'])}")
                print("-" * 30)
        else:
            print("Failed. No reviews found.")
    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        await scraper.stop()

if __name__ == "__main__":
    asyncio.run(test())
