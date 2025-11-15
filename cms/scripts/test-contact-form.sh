#!/bin/bash

# Contact Form API Test Script
# This script demonstrates the email queue functionality

GRAPHQL_URL="http://localhost:3000/api/graphql"

echo "=========================================="
echo "Contact Form API Test"
echo "=========================================="
echo ""

# Function to submit a contact form
submit_form() {
  local name="$1"
  local email="$2"
  local message="$3"

  echo "📝 Submitting form for: $name"

  response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"mutation { createContactForm(data: { name: \\\"$name\\\", email: \\\"$email\\\", message: \\\"$message\\\", companyName: \\\"Test Company\\\", whatsapp: \\\"+1234567890\\\", source: \\\"api-test\\\", locale: \\\"en\\\", ipAddress: \\\"127.0.0.1\\\" }) { id name email emailSent submittedAt } }\"
    }")

  # Extract ID from response
  id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  emailSent=$(echo "$response" | grep -o '"emailSent":[^,}]*' | cut -d':' -f2)

  if [ -n "$id" ]; then
    echo "✅ Form submitted successfully!"
    echo "   ID: $id"
    echo "   Email Queued: $emailSent"
    echo ""
  else
    echo "❌ Failed to submit form"
    echo "   Response: $response"
    echo ""
  fi
}

# Submit test forms
echo "Submitting test contact forms..."
echo ""

submit_form "John Doe" "pakholam599@gmail.com" "I'm interested in your glass door handles. Can you provide a quote for 50 units?"
sleep 1

submit_form "Jane Smith" "pakholam599@gmail.com" "Hello, I need information about your glass railing systems for a commercial building project."
sleep 1

submit_form "Bob Johnson" "pakholam599@gmail.com" "Do you ship internationally? I'm interested in ordering from Canada."
sleep 1

# Query recent submissions
echo "=========================================="
echo "Recent Contact Form Submissions"
echo "=========================================="
echo ""

recent=$(curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { contactFormSubmissions(orderBy: { submittedAt: desc }, take: 5) { id name email emailSent submittedAt status } }"}')

echo "$recent" | python3 -m json.tool 2>/dev/null || echo "$recent"

echo ""
echo "=========================================="
echo "Test Complete!"
echo "=========================================="
echo ""
echo "Check the Keystone server logs to see:"
echo "  📬 Email jobs being added to queue"
echo "  📧 Email jobs being processed"
echo "  ✅ Emails being sent"
echo "  🔄 Retry attempts (if SMTP is not configured)"
echo ""
