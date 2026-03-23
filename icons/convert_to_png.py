#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将SVG图标转换为PNG格式
需要安装: pip install cairosvg
"""

import os
import sys

def convert_svg_to_png():
    try:
        import cairosvg
    except ImportError:
        print("请先安装 cairosvg: pip install cairosvg")
        print("或者使用在线转换工具将SVG转换为PNG")
        return False
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for size in sizes:
        svg_file = os.path.join(script_dir, f'icon-{size}x{size}.svg')
        png_file = os.path.join(script_dir, f'icon-{size}x{size}.png')
        
        if os.path.exists(svg_file):
            try:
                cairosvg.svg2png(url=svg_file, write_to=png_file, output_width=size, output_height=size)
                print(f'转换成功: icon-{size}x{size}.png')
            except Exception as e:
                print(f'转换失败 {size}x{size}: {e}')
        else:
            print(f'找不到文件: {svg_file}')
    
    return True

if __name__ == '__main__':
    convert_svg_to_png()
