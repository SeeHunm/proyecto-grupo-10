#!/usr/bin/env bash
set -u
BASE_URL="${1:-http://localhost:3000}"
API_KEY="${2:-AGRISMART-DEMO-1234}"
OUT="${3:-./auditoria/fase1}"
OLD_KEY="AGRISMART-DEMO-1234"
mkdir -p "$OUT"

run_test() {
  local name="$1"; shift
  {
    echo "Prueba $name"
    echo "Fecha: $(date -Iseconds)"
    echo "Comando: curl $*"
    echo
    curl "$@"
    echo
  } > "$OUT/$name.txt" 2>&1
}

run_test A01 -i -X PUT "$BASE_URL/api/zones/2/irrigation" -H "x-api-key: $API_KEY" -H "x-user-id: 1" -H "Content-Type: application/json" --data '{"enabled":false}'
run_test A03 -i --get "$BASE_URL/api/history" -H "x-api-key: $API_KEY" -H "x-user-id: 1" --data-urlencode 'zone_id=1 OR 1=1'
run_test A04 -i -X PUT "$BASE_URL/api/zones/1/settings" -H "x-api-key: $API_KEY" -H "x-user-id: 1" -H "Content-Type: application/json" --data '{"moisture_threshold":9999,"irrigation_minutes":9999}'
run_test A05 -i "$BASE_URL/admin/sensors"
run_test A07 -i "$BASE_URL/api/sensors" -H "x-api-key: $OLD_KEY" -H "x-user-id: 1"

echo "Evidencias guardadas en $OUT"
