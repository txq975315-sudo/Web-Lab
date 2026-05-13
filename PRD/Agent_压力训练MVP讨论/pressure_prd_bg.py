#!/usr/bin/env python3
"""
Pressure Engine PRD — Deep Blue & Coral Accent
Geometric blocks with precise grid, professional tech document feel.
"""
import os, sys

PAGE_W, PAGE_H = 794, 1123
C = {
    'bg': '#f8f9fa',
    'primary': '#1B2A4A',
    'secondary': '#3D5A80',
    'accent': '#EE6C4D',
    'light': '#98C1D9',
    'pale': '#e8eef4',
    'dark': '#293241'
}

GRAIN = '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="n"/><feColorMatrix type="saturate" values="0" in="n" result="m"/><feBlend in="SourceGraphic" in2="m" mode="multiply"/></filter>'
SVG = lambda body: f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{{margin:0;padding:0}}body{{width:{PAGE_W}px;height:{PAGE_H}px;background:{C["bg"]}}}</style></head><body><svg width="{PAGE_W}" height="{PAGE_H}" xmlns="http://www.w3.org/2000/svg">{GRAIN}<rect width="100%" height="100%" fill="{C["bg"]}"/>{body}<rect width="100%" height="100%" filter="url(#g)" opacity="0.02"/></svg></body></html>'

# Cover: large geometric blocks + accent line
COVER = SVG(f'''
<!-- Left side: large primary block -->
<rect x="0" y="0" width="320" height="1123" fill="{C['primary']}" opacity="0.95"/>
<!-- Top-right: secondary accent block -->
<rect x="520" y="0" width="274" height="280" fill="{C['secondary']}" opacity="0.08"/>
<!-- Bottom accent strip -->
<rect x="320" y="980" width="474" height="143" fill="{C['pale']}" opacity="0.5"/>
<!-- Coral accent line -->
<line x1="360" y1="340" x2="520" y2="340" stroke="{C['accent']}" stroke-width="3"/>
<!-- Small geometric dots -->
<circle cx="380" cy="380" r="4" fill="{C['accent']}" opacity="0.6"/>
<circle cx="410" cy="380" r="4" fill="{C['light']}" opacity="0.4"/>
<circle cx="440" cy="380" r="4" fill="{C['secondary']}" opacity="0.3"/>
<!-- Thin grid lines on right -->
<line x1="560" y1="320" x2="560" y2="480" stroke="{C['light']}" stroke-width="0.5" opacity="0.3"/>
<line x1="640" y1="320" x2="640" y2="440" stroke="{C['light']}" stroke-width="0.5" opacity="0.3"/>
<line x1="560" y1="400" x2="720" y2="400" stroke="{C['light']}" stroke-width="0.5" opacity="0.3"/>
<!-- Bottom rule -->
<line x1="360" y1="1020" x2="720" y2="1020" stroke="{C['primary']}" stroke-width="0.8" opacity="0.4"/>
''')

# Backcover: mirrored geometry, lighter
BACK = SVG(f'''
<!-- Right side: large primary block -->
<rect x="474" y="0" width="320" height="1123" fill="{C['primary']}" opacity="0.95"/>
<!-- Top-left: pale block -->
<rect x="0" y="0" width="280" height="250" fill="{C['pale']}" opacity="0.4"/>
<!-- Coral accent line -->
<line x1="72" y1="780" x2="240" y2="780" stroke="{C['accent']}" stroke-width="2.5"/>
<!-- Geometric dots -->
<circle cx="100" cy="820" r="3" fill="{C['accent']}" opacity="0.5"/>
<circle cx="130" cy="820" r="3" fill="{C['light']}" opacity="0.4"/>
<!-- Grid lines -->
<line x1="72" y1="300" x2="72" y2="450" stroke="{C['light']}" stroke-width="0.5" opacity="0.3"/>
<line x1="150" y1="300" x2="150" y2="400" stroke="{C['light']}" stroke-width="0.5" opacity="0.3"/>
<!-- Bottom rule -->
<line x1="72" y1="900" x2="400" y2="900" stroke="{C['primary']}" stroke-width="0.8" opacity="0.3"/>
''')

def _render(tpl, out):
    from playwright.sync_api import sync_playwright
    os.makedirs(out, exist_ok=True)
    pairs = list(tpl.items())
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': PAGE_W, 'height': PAGE_H}, device_scale_factor=2)
        for n, h in pairs:
            pg.set_content(h)
            pg.screenshot(path=os.path.join(out, n), type='png')
            print(n)
        b.close()

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '/mnt/agents/output'
    _render({'cover_bg.png': COVER, 'backcover_bg.png': BACK}, out)
    print("Done - Pressure Engine PRD Backgrounds")
