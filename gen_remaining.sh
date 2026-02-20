#!/bin/bash
API_KEY="AIzaSyCBjeL2QnPsPkPT3W4MDGpp4mGgz6Ck_jA"
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY"
OUT="/Users/smk/.openclaw/workspace-slack-coder/whiteout-survival/assets/svg"

generate() {
  local name="$1"
  local prompt="$2"
  local resp
  resp=$(curl -s --max-time 120 -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"contents\":[{\"parts\":[{\"text\":\"$prompt\"}]}]}")
  
  local svg
  svg=$(echo "$resp" | python3 -c "
import sys, json, re
data = json.load(sys.stdin)
text = data['candidates'][0]['content']['parts'][0]['text']
m = re.search(r'(<svg[\s\S]*?</svg>)', text)
if m: print(m.group(1))
else: print(text)
" 2>/dev/null)
  
  if [ -n "$svg" ]; then
    echo "$svg" > "$OUT/$name"
    echo "✓ $name"
  else
    echo "✗ $name"
  fi
}

# Run all in parallel
generate "wolf.svg" "Generate a 32x32 pixel art SVG of a gray wolf. Use rect elements. viewBox 0 0 32 32. Output ONLY SVG code." &
generate "bear.svg" "Generate a 48x48 pixel art SVG of a polar bear, white and brown. Use rect elements. viewBox 0 0 48 48. Output ONLY SVG code." &
generate "boss.svg" "Generate a 64x64 pixel art SVG of a glowing blue ice storm king boss. Use rect elements. viewBox 0 0 64 64. Output ONLY SVG code." &
generate "campfire.svg" "Generate a 32x32 pixel art SVG of a campfire with orange flames. Use rect elements. viewBox 0 0 32 32. Output ONLY SVG code." &
generate "tent.svg" "Generate a 32x32 pixel art SVG of a brown triangle tent. Use rect elements. viewBox 0 0 32 32. Output ONLY SVG code." &

wait
echo "--- batch 1 done ---"

generate "storage.svg" "Generate a 32x32 pixel art SVG of a brown wooden crate. Use rect elements. viewBox 0 0 32 32. Output ONLY SVG code." &
generate "meat.svg" "Generate a 16x16 pixel art SVG of a red meat drumstick. Use rect elements. viewBox 0 0 16 16. Output ONLY SVG code." &
generate "wood.svg" "Generate a 16x16 pixel art SVG of brown wooden logs. Use rect elements. viewBox 0 0 16 16. Output ONLY SVG code." &
generate "stone.svg" "Generate a 16x16 pixel art SVG of a gray stone rock. Use rect elements. viewBox 0 0 16 16. Output ONLY SVG code." &

wait
echo "--- batch 2 done ---"
echo "=== Complete ==="
ls -la "$OUT"
