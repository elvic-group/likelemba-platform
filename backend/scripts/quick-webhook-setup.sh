#!/bin/bash
# Quick Webhook Setup Script
# Checks everything and provides webhook URL

echo "🌐 Likelemba - Local Webhook Setup"
echo "=================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "📥 Install ngrok:"
    echo "   macOS: brew install ngrok/ngrok/ngrok"
    echo "   Or: https://ngrok.com/download"
    echo ""
    exit 1
fi

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 3000"
else
    echo "⚠️  Server is not running"
    echo "💡 Start server: npm start"
    echo ""
    exit 1
fi

# Check if ngrok is running
echo "🔍 Checking ngrok status..."
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "✅ ngrok is running"
    echo ""
    
    # Get webhook URL
    WEBHOOK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$WEBHOOK_URL" ]; then
        WEBHOOK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"http://[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -n "$WEBHOOK_URL" ]; then
        echo "📋 Your Webhook URLs:"
        echo ""
        echo "   🌐 Base URL: $WEBHOOK_URL"
        echo ""
        echo "   📱 Green API:"
        echo "      $WEBHOOK_URL/webhooks/greenapi"
        echo ""
        echo "   💳 Stripe:"
        echo "      $WEBHOOK_URL/webhooks/stripe"
        echo ""
        echo "📝 Configure in Green API Console:"
        echo "   https://console.green-api.com/"
        echo "   Instance: 7700330457"
        echo "   Webhook URL: $WEBHOOK_URL/webhooks/greenapi"
        echo ""
    else
        echo "⚠️  Could not get webhook URL"
        echo "💡 Make sure ngrok is running: npm run webhook:tunnel"
    fi
else
    echo "❌ ngrok is not running"
    echo ""
    echo "🚀 Start ngrok tunnel:"
    echo "   npm run webhook:tunnel"
    echo ""
    echo "Or manually:"
    echo "   ngrok http 3000"
    echo ""
fi

