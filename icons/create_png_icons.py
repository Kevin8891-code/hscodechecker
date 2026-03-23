#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用PIL创建PWA图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """创建指定尺寸的图标"""
    # 创建渐变背景
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变效果（简化版）
    for y in range(size):
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + 162 * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # 绘制圆角矩形背景
    corner_radius = size // 8
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
    
    # 应用圆角
    output = Image.new('RGB', (size, size), (0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    
    # 重新创建带透明度的图像
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(output, (0, 0), mask)
    
    # 绘制文字
    draw = ImageDraw.Draw(final)
    text = "HS"
    
    # 尝试使用系统字体
    font_size = size // 3
    try:
        # Windows系统字体
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", font_size)
        except:
            font = ImageFont.load_default()
    
    # 计算文字位置（居中）
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - text_height // 4
    
    # 绘制白色文字
    draw.text((x, y), text, fill='white', font=font)
    
    return final

def main():
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for size in sizes:
        img = create_icon(size)
        filename = f'icon-{size}x{size}.png'
        filepath = os.path.join(script_dir, filename)
        img.save(filepath, 'PNG')
        print(f'创建: {filename}')
    
    print('\n所有图标创建完成！')

if __name__ == '__main__':
    main()
