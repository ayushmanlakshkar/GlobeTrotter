#!/bin/bash

# Admin Routes Test Script
# This script tests all admin routes using curl
# Make sure your server is running before executing this script

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api"
ADMIN_BASE="${API_BASE}/admin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_test() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to make authenticated requests
# Note: You'll need to replace TOKEN with actual admin JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZDkxZWI4NS0zOGFhLTQ2ZDAtOWE2OS02ZDk5ODNjMGVlMGEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU0OTM5NDIwLCJleHAiOjE3NTU1NDQyMjB9._rNTo_ikSp00Vd22a8ivr2mm_dW7PdbClMJRdLJpYCw"

if [ "$TOKEN" = "YOUR_ADMIN_JWT_TOKEN_HERE" ]; then
    print_warning "Please replace TOKEN variable with actual admin JWT token"
    echo "You can get admin token by:"
    echo "1. Creating an admin user"
    echo "2. Logging in with admin credentials"
    echo "3. Copying the JWT token from the response"
    echo ""
fi

echo -e "${YELLOW}🚀 Starting Admin Routes Test Suite${NC}"
echo "Base URL: $BASE_URL"
echo "Admin API Base: $ADMIN_BASE"
echo ""

# Test 1: Health Check
print_test "Health Check"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL/health")
if [ "$response" = "200" ]; then
    print_success "Server is running"
    cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
else
    print_error "Server is not responding (HTTP $response)"
    exit 1
fi
echo ""

# Test 2: Get All Users
print_test "GET /api/admin/users - Get All Users"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/users")

if [ "$response" = "200" ]; then
    print_success "Retrieved all users successfully"
else
    print_error "Failed to get users (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 3: Get User by ID
print_test "GET /api/admin/users/:id - Get User by ID"
USER_ID="7ae906aa-402b-40c4-be31-cfb64deaa30b"  # Jane Smith's ID from the users list
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/users/$USER_ID")

if [ "$response" = "200" ]; then
    print_success "Retrieved user by ID successfully"
elif [ "$response" = "404" ]; then
    print_warning "User not found (expected if using test ID)"
else
    print_error "Failed to get user by ID (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 4: Update User
print_test "PUT /api/admin/users/:id - Update User"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "first_name": "Updated",
        "last_name": "User",
        "email": "updated@example.com"
    }' \
    "$ADMIN_BASE/users/$USER_ID")

if [ "$response" = "200" ]; then
    print_success "Updated user successfully"
elif [ "$response" = "404" ]; then
    print_warning "User not found (expected if using test ID)"
else
    print_error "Failed to update user (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 5: Get User Statistics
print_test "GET /api/admin/stats - Get User Statistics"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/stats")

if [ "$response" = "200" ]; then
    print_success "Retrieved user statistics successfully"
else
    print_error "Failed to get user statistics (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 6: Get Popular Cities
print_test "GET /api/admin/popular-cities - Get Popular Cities"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/popular-cities")

if [ "$response" = "200" ]; then
    print_success "Retrieved popular cities successfully"
else
    print_error "Failed to get popular cities (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 7: Get Popular Activities
print_test "GET /api/admin/popular-activities - Get Popular Activities"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/popular-activities")

if [ "$response" = "200" ]; then
    print_success "Retrieved popular activities successfully"
else
    print_error "Failed to get popular activities (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 8: Get User Trends
print_test "GET /api/admin/user-trends - Get User Trends"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/user-trends")

if [ "$response" = "200" ]; then
    print_success "Retrieved user trends successfully"
else
    print_error "Failed to get user trends (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Test 9: Delete User (Warning: This will actually delete a user!)
print_test "DELETE /api/admin/users/:id - Delete User"
print_warning "Skipping delete test to avoid accidental data loss"
print_warning "To test delete functionality, uncomment the following lines:"
echo "# response=\$(curl -s -w \"%{http_code}\" -o /tmp/response.json \\"
echo "#     -X DELETE \\"
echo "#     -H \"Authorization: Bearer \$TOKEN\" \\"
echo "#     -H \"Content-Type: application/json\" \\"
echo "#     \"\$ADMIN_BASE/users/\$USER_ID\")"
echo ""

# Test 10: Unauthorized Access Test
print_test "Unauthorized Access Test"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
    -H "Content-Type: application/json" \
    "$ADMIN_BASE/users")

if [ "$response" = "401" ] || [ "$response" = "403" ]; then
    print_success "Unauthorized access properly blocked (HTTP $response)"
else
    print_error "Unauthorized access not properly blocked (HTTP $response)"
fi
echo "Response:"
cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
echo ""

# Cleanup
rm -f /tmp/response.json

echo -e "${YELLOW}🏁 Admin Routes Test Suite Completed${NC}"
echo ""
echo "Notes:"
echo "1. Replace TOKEN variable with actual admin JWT token"
echo "2. Replace USER_ID with actual user ID for user-specific tests"
echo "3. Ensure your server is running on the correct port"
echo "4. Install 'jq' for better JSON formatting: brew install jq (macOS) or apt-get install jq (Linux)"
