"""Render build/icon.png (1024px app icon) from inline SVG via headless Chromium."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

SVG = """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='#2fbf6c'/><stop offset='1' stop-color='#178a47'/></linearGradient></defs>
<rect x='100' y='100' width='824' height='824' rx='190' fill='url(#g)'/>
<rect x='210' y='330' width='604' height='364' rx='56' fill='#ffffff' opacity='0.28' transform='rotate(-8 512 512)'/>
<rect x='210' y='330' width='604' height='364' rx='56' fill='#ffffff'/>
<line x1='250' y1='512' x2='620' y2='512' stroke='#d9e6de' stroke-width='12'/>
<line x1='640' y1='330' x2='640' y2='694' stroke='#d9e6de' stroke-width='12'/>
<rect x='262' y='400' width='250' height='44' rx='22' fill='#16161a'/>
<rect x='262' y='580' width='170' height='36' rx='18' fill='#9a9aa4'/>
<path d='M672 518 l36 36 l62 -78' stroke='#1f9d55' stroke-width='30' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
</svg>"""

out = Path(sys.argv[1])
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1024, "height": 1024})
    pg.set_content(f"<body style='margin:0;background:transparent'>{SVG}</body>")
    pg.screenshot(path=str(out), omit_background=True)
    b.close()
