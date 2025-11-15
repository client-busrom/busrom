#!/bin/bash

# SMTP Connection Test Script
# This helps diagnose SMTP connection issues

echo "=========================================="
echo "SMTP Connection Diagnostic Tool"
echo "=========================================="
echo ""

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"

echo "Testing SMTP connection to $SMTP_HOST:$SMTP_PORT"
echo ""

# Test 1: Check if port is reachable
echo "📡 Test 1: Network connectivity"
echo "   Testing connection to $SMTP_HOST:$SMTP_PORT..."

if command -v nc &> /dev/null; then
    timeout 5 nc -zv $SMTP_HOST $SMTP_PORT 2>&1
    if [ $? -eq 0 ]; then
        echo "   ✅ Port $SMTP_PORT is reachable"
    else
        echo "   ❌ Port $SMTP_PORT is NOT reachable"
        echo "   Possible reasons:"
        echo "      - Firewall blocking the connection"
        echo "      - Network issue"
        echo "      - Wrong port number"
    fi
else
    echo "   ⚠️  'nc' command not found, skipping network test"
fi

echo ""

# Test 2: Try to connect with OpenSSL
echo "📡 Test 2: SMTP handshake"
echo "   Testing SMTP handshake with $SMTP_HOST:$SMTP_PORT..."

if command -v openssl &> /dev/null; then
    timeout 10 openssl s_client -starttls smtp -connect $SMTP_HOST:$SMTP_PORT -crlf -quiet </dev/null 2>&1 | head -20

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "   ✅ SMTP handshake successful"
    else
        echo "   ❌ SMTP handshake failed"
    fi
else
    echo "   ⚠️  'openssl' command not found, skipping handshake test"
fi

echo ""
echo "=========================================="
echo "Diagnosis Complete"
echo "=========================================="
echo ""
echo "📝 Common Gmail SMTP Issues:"
echo ""
echo "1. ❌ Using normal Gmail password"
echo "   ✅ Solution: Generate and use App-Specific Password"
echo "   📖 Guide: https://support.google.com/accounts/answer/185833"
echo ""
echo "2. ❌ Two-Step Verification not enabled"
echo "   ✅ Solution: Enable 2FA first, then create App Password"
echo ""
echo "3. ❌ 'Less secure apps' access disabled"
echo "   ✅ Solution: Use App-Specific Password instead"
echo ""
echo "4. ❌ Firewall blocking SMTP port"
echo "   ✅ Solution: Check firewall settings for port 587"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Generate Gmail App-Specific Password:"
echo "   https://myaccount.google.com/apppasswords"
echo ""
echo "2. Update password in CMS Site Config"
echo ""
echo "3. Restart Keystone server"
echo ""
echo "4. Submit test form:"
echo "   bash scripts/test-contact-form.sh"
echo ""
