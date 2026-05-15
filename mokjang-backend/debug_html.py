# -*- coding: utf-8 -*-
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('debug_page.html', encoding='utf-8') as f:
    html = f.read()

# EjjAW li 블록 추출
blocks = re.findall(r'<li class="place_apply_pui EjjAW".*?</li>', html, re.DOTALL)
print(f'Found {len(blocks)} review blocks')

if blocks:
    classes = re.findall(r'class="([^"]+)"', blocks[0])
    print('\nClasses in first review:')
    for c in sorted(set(classes)):
        print(' ', c)

    # 리뷰 텍스트가 있을 법한 div/span 추출
    text_tags = re.findall(r'<(span|div)[^>]*class="([^"]*pui__[^"]*)"[^>]*>(.*?)</', blocks[0], re.DOTALL)
    print('\nText content by pui__ class:')
    for tag, cls, content in text_tags:
        clean = re.sub(r'<[^>]+>', '', content).strip()
        if clean and len(clean) > 5:
            print(f'  [{tag}] .{cls[:50]} => {clean[:100]}')
