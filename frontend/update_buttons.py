import os
import glob
import re

def update_button_props(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Replace variant="primary" to nothing since default is default
    content = re.sub(r'variant="primary"', '', content)
    
    # Layout="horizontal" usually means just an icon + text left/right. Shadcn button uses flex-row by default.
    content = re.sub(r'layout="horizontal"', '', content)
    content = re.sub(r'layout="vertical"', '', content)
    
    # Handle isIcon
    # If isIcon is present, we should swap size to size="icon", and remove isIcon.
    # Note: this is a simple regex, might need to be refined. Let's just do a naive approach first.
    def replace_icon(m):
        btn = m.group(0)
        btn = re.sub(r'\bisIcon(?:=\{true\})?', '', btn)
        btn = re.sub(r'size="(?:sm|md|lg)"', 'size="icon"', btn)
        if 'size="icon"' not in btn:
            # if size wasn't specified but isIcon was, add size="icon"
            # we insert it before the closing angle bracket or slash
            btn = re.sub(r'(/?>)$', r' size="icon" \1', btn, count=1)
        return btn
    
    content = re.sub(r'<Button[^>]*isIcon[^>]*>', replace_icon, content)
    
    # Handle tooltips - Shadcn Button doesn't support tooltip prop directly. 
    # For now, we will map tooltip prop to native title attribute to preserve basic functionality without rewriting to TooltipProvider in every file.
    content = re.sub(r'tooltip="([^"]+)"', r'title="\1"', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    src_dir = os.path.join(os.getcwd(), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                update_button_props(os.path.join(root, file))
