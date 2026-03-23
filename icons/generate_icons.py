#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成PWA所需的各种尺寸的图标
"""

import os

def generate_svg_icon(size):
    """生成SVG图标"""
    # 计算文字大小
    font_size = size // 3
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" fill="url(#grad)" rx="{size//8}" ry="{size//8}"/>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="{font_size}" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">HS</text>
</svg>'''
    return svg

def main():
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        svg_content = generate_svg_icon(size)
        filename = f'icon-{size}x{size}.svg'
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        print(f'生成: {filename}')
    
    print('\n提示: 这些SVG图标可以直接使用，或者转换为PNG格式')
    print('如需转换为PNG，可以使用在线工具或ImageMagick')

if __name__ == '__main__':
    main()
