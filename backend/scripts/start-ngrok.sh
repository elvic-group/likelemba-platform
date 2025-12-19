#!/bin/bash
# Start ngrok tunnel for local webhook testing

echo "🌐 Starting ngrok tunnel for local webhook testing..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "📥 Install ngrok:"
    echo "   macOS: brew install ngrok/ngrok/ngrok"
    echo "   Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Server is not running on port 3000"
    echo "💡 Start server first: npm start"
    echo ""
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

echo "✅ Server detected on port 3000"
echo ""
echo "🚀 Starting ngrok tunnel..."
echo ""
echo "📋 Your webhook URLs will be:"
echo "   Green API: https://[your-ngrok-url].ngrok.io/webhooks/greenapi"
echo "   Stripe: https://[your-ngrok-url].ngrok.io/webhooks/stripe"
echo ""
echo "💡 Copy the HTTPS URL and use it in Green API console"
echo ""

# Start ngrok
ngrok http 3000

