#!/bin/bash
# Route Testing Script
# Tests all application routes and API endpoints

BASE_URL="http://localhost:5173"

echo "========================================="
echo "ROUTE TESTING PROTOCOL"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Base URL: $BASE_URL"
echo "========================================="
echo ""

echo "## PAGE ROUTES ##"
echo ""

# Array of page routes
declare -a PAGE_ROUTES=(
  "/"
  "/booking"
  "/invoice"
  "/estimate"
  "/ledgers"
  "/creditors"
  "/debtors"
  "/rates"
  "/stammdaten"
  "/demo/booking-form"
  "/demo/invoice"
  "/demo/primanota-table"
)

# Test each page route
for route in "${PAGE_ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}")
  if [ "$status" = "200" ]; then
    echo "✅ $route - $status OK"
  elif [ "$status" = "404" ]; then
    echo "❌ $route - $status NOT FOUND"
  elif [ "$status" = "500" ]; then
    echo "⚠️  $route - $status SERVER ERROR"
  else
    echo "⚠️  $route - $status UNKNOWN"
  fi
done

echo ""
echo "## API ROUTES (GET) ##"
echo ""

# Array of GET API routes
declare -a API_GET_ROUTES=(
  "/api/booking/accounts"
  "/api/booking/allaccounts"
  "/api/booking/companycodes"
  "/api/booking/taxgroups"
  "/api/booking/op-accounts"
  "/api/booking/primanota"
  "/api/ledgers/accounts"
  "/api/ledgers/companycodes"
  "/api/tooltips"
  "/api/tooltips/categories"
  "/api/tooltips/keys"
  "/api/rules"
  "/booking"
)

# Test each GET API route
for route in "${API_GET_ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}")
  if [ "$status" = "200" ]; then
    echo "✅ $route - $status OK"
  elif [ "$status" = "404" ]; then
    echo "❌ $route - $status NOT FOUND"
  elif [ "$status" = "500" ]; then
    echo "⚠️  $route - $status SERVER ERROR"
  else
    echo "⚠️  $route - $status (STATUS: $status)"
  fi
done

echo ""
echo "## API ROUTES (POST - require body) ##"
echo ""

declare -a API_POST_ROUTES=(
  "/api/booking/account-details"
  "/api/booking/account-taxgroup"
  "/api/booking/account-totals"
  "/api/booking/allowed-accounts"
  "/api/booking/attach-pdf"
  "/api/booking/balance-open"
  "/api/booking/cancel"
  "/api/booking/check-duplicate"
  "/api/booking/delete"
  "/api/booking/delete-pdf"
  "/api/booking/pdf"
  "/api/booking/reconcile"
  "/api/booking/unreconcile"
  "/api/booking/split-debitor"
  "/api/booking/split-kreditor"
  "/api/invoice/handover-to-booking"
  "/api/invoice/pdf"
)

# Test POST routes (expect 405 Method Not Allowed for GET)
for route in "${API_POST_ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}")
  if [ "$status" = "405" ]; then
    echo "✅ $route - $status (POST only, as expected)"
  elif [ "$status" = "400" ]; then
    echo "✅ $route - $status (Bad Request - route exists)"
  elif [ "$status" = "404" ]; then
    echo "❌ $route - $status NOT FOUND"
  elif [ "$status" = "500" ]; then
    echo "⚠️  $route - $status SERVER ERROR"
  else
    echo "⚠️  $route - $status (STATUS: $status)"
  fi
done

echo ""
echo "========================================="
echo "TESTING COMPLETE"
echo "========================================="
