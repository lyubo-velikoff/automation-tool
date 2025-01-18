#!/bin/bash

# Load environment variables
source "$(dirname "$0")/../../.env"

# Configuration
API_URL="http://localhost:4000"
SERVICE_KEY="$SUPABASE_SERVICE_KEY"

# Test user ID (this is a UUID that exists in your Supabase auth.users table)
TEST_USER_ID="61c465e8-0dfc-46c7-b35d-bea63c4b8926"  # This should be a real user ID from your auth.users table

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Workflow API Contract"
echo "==========================="

# Test 1: Save a new workflow
echo -e "\nTest 1: Save a new workflow"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -d '{
    "name": "Contract Test Workflow",
    "user_id": "'$TEST_USER_ID'",
    "nodes": [
      {
        "id": "1",
        "type": "default",
        "position": { "x": 100, "y": 100 },
        "data": { "label": "Test Node" }
      }
    ],
    "edges": []
  }')

# Get status code from last line
http_code=$(echo "$response" | tail -n1)
# Get response body without status code
body=$(echo "$response" | sed '$d')

# Check response
if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}✓ Successfully saved workflow${NC}"
  echo "Response: $body"
else
  echo -e "${RED}✗ Failed to save workflow${NC}"
  echo "Status Code: $http_code"
  echo "Response: $body"
  exit 1
fi

echo -e "\nAll tests completed!" 
