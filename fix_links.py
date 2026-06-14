import re
import os

files = [
    r"d:\Murad Sweets Website\murad-sweets-user-frontend\app\data\products.ts",
    r"d:\Murad Sweets Website\murad-sweets-user-frontend\app\checkout\page.tsx",
    r"d:\Murad Sweets Website\murad-sweets-user-backend\seed\seed_catalog.py"
]

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace any https://images.unsplash.com... with /murad-logo.jpg
    content = re.sub(r'https://images\.unsplash\.com/[^"\']+', '/murad-logo.jpg', content)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Replaced Unsplash links.")
