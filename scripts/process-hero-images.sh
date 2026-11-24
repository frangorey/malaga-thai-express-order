#!/usr/bin/env bash
# =====================================================================
# Thaii Express - Hero v2 - procesamiento de imagenes top-down
# 2026-11-24 - Claude
#
# Pipeline:
#   1. Lee cada PNG de scripts/hero-raw/ (renombrada como <slug>.png)
#   2. Aplica rembg para quitar fondo/sombras residuales
#   3. Valida que el PNG resultante tiene canal alpha real
#   4. Guarda en scripts/hero-processed/<slug>.png
#
# Slugs esperados (9): entrantes, arroz, tallarines, sopas, pokes,
#                      postres, ensaladas, otras, bebidas
#
# Requisitos: rembg (pipx install "rembg[cli]" && pipx inject rembg onnxruntime)
# =====================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW_DIR="$SCRIPT_DIR/hero-raw"
OUT_DIR="$SCRIPT_DIR/hero-processed"

EXPECTED_SLUGS=(entrantes arroz tallarines sopas pokes postres ensaladas otras bebidas)

# Resolver binario rembg (PATH o ~/.local/bin del venv de pipx)
REMBG_BIN="$(command -v rembg || true)"
if [[ -z "$REMBG_BIN" && -x "$HOME/.local/bin/rembg" ]]; then
  REMBG_BIN="$HOME/.local/bin/rembg"
fi
if [[ -z "$REMBG_BIN" ]]; then
  echo "ERROR: rembg no encontrado. Instala con: pipx install 'rembg[cli]' && pipx inject rembg onnxruntime"
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "=== Thaii Hero v2 - procesamiento rembg ==="
echo "raw:        $RAW_DIR"
echo "processed:  $OUT_DIR"
echo "rembg:      $REMBG_BIN"
echo ""

OK=0
MISSING=()
FAILED=()

for slug in "${EXPECTED_SLUGS[@]}"; do
  # Acepta .png, .jpg o .jpeg como entrada
  IN=""
  for ext in png jpg jpeg PNG JPG JPEG; do
    if [[ -f "$RAW_DIR/$slug.$ext" ]]; then
      IN="$RAW_DIR/$slug.$ext"
      break
    fi
  done
  OUT="$OUT_DIR/$slug.png"

  if [[ -z "$IN" ]]; then
    echo "[MISS]  $slug.{png,jpg,jpeg} no esta en hero-raw/"
    MISSING+=("$slug")
    continue
  fi

  echo "[WORK]  $(basename "$IN") -> rembg..."
  if "$REMBG_BIN" i "$IN" "$OUT" 2>/dev/null; then
    # Verificar canal alpha con python+PIL o con file
    if python3 -c "from PIL import Image; img=Image.open('$OUT'); exit(0 if img.mode=='RGBA' else 1)" 2>/dev/null; then
      BYTES=$(stat -f%z "$OUT" 2>/dev/null || stat -c%s "$OUT")
      echo "[OK]    $slug.png -> $OUT ($BYTES bytes, RGBA)"
      OK=$((OK+1))
    else
      echo "[WARN]  $slug.png sin canal alpha tras rembg"
      FAILED+=("$slug")
    fi
  else
    echo "[FAIL]  rembg fallo en $slug.png"
    FAILED+=("$slug")
  fi
done

echo ""
echo "=== Resumen ==="
echo "OK:      $OK / 9"
echo "Missing: ${#MISSING[@]} (${MISSING[*]:-ninguno})"
echo "Failed:  ${#FAILED[@]} (${FAILED[*]:-ninguno})"

if [[ $OK -eq 9 ]]; then
  echo ""
  echo "Siguiente: subir scripts/hero-processed/*.png a Supabase Storage (bucket Fotos_Thaii, path hero-v2/)"
fi
