#!/bin/bash
set -e
API_KEY="AIzaSyCBjeL2QnPsPkPT3W4MDGpp4mGgz6Ck_jA"
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY"
OUT="/Users/smk/.openclaw/workspace-slack-coder/whiteout-survival/assets/svg"

generate() {
  local name="$1"
  local prompt="$2"
  echo "Generating $name..."
  local resp
  resp=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"contents\":[{\"parts\":[{\"text\":\"$prompt\"}]}]}")
  
  # Extract SVG from response
  local svg
  svg=$(echo "$resp" | python3 -c "
import sys, json, re
data = json.load(sys.stdin)
text = data['candidates'][0]['content']['parts'][0]['text']
# Find SVG block
m = re.search(r'(<svg[\s\S]*?</svg>)', text)
if m:
    print(m.group(1))
else:
    print(text)
" 2>/dev/null)
  
  if [ -n "$svg" ]; then
    echo "$svg" > "$OUT/$name"
    echo "  ✓ $name saved"
  else
    echo "  ✗ $name FAILED"
    echo "$resp" | head -5
  fi
  sleep 1
}

generate "player.svg" "Generate a simple 32x32 pixel art SVG of a polar explorer character with blue winter coat and red scarf. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "rabbit.svg" "Generate a simple 32x32 pixel art SVG of a cute white arctic rabbit. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "wolf.svg" "Generate a simple 32x32 pixel art SVG of a fierce gray wolf. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "bear.svg" "Generate a simple 48x48 pixel art SVG of a large polar bear with white and brown colors. Use rect elements for pixels. viewBox 0 0 48 48. Output ONLY the SVG code, nothing else."

generate "boss.svg" "Generate a simple 64x64 pixel art SVG of a glowing blue ice storm king boss monster with lightning effects. Use rect elements for pixels. viewBox 0 0 64 64. Output ONLY the SVG code, nothing else."

generate "campfire.svg" "Generate a simple 32x32 pixel art SVG of a campfire with orange flames and brown logs. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "tent.svg" "Generate a simple 32x32 pixel art SVG of a brown triangle tent shelter. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "storage.svg" "Generate a simple 32x32 pixel art SVG of a brown wooden storage box/crate. Use rect elements for pixels. viewBox 0 0 32 32. Output ONLY the SVG code, nothing else."

generate "meat.svg" "Generate a simple 16x16 pixel art SVG of a red meat drumstick item. Use rect elements for pixels. viewBox 0 0 16 16. Output ONLY the SVG code, nothing else."

generate "wood.svg" "Generate a simple 16x16 pixel art SVG of brown wooden logs. Use rect elements for pixels. viewBox 0 0 16 16. Output ONLY the SVG code, nothing else."

generate "stone.svg" "Generate a simple 16x16 pixel art SVG of a gray stone/rock. Use rect elements for pixels. viewBox 0 0 16 16. Output ONLY the SVG code, nothing else."

echo ""
echo "=== All done ==="
ls -la "$OUT"
