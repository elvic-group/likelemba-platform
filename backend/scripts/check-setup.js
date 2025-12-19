/**
 * Check Setup Status
 * Verifies server, ngrok, and webhook configuration
 */
const http = require("http");

async function checkServer() {
  return new Promise((resolve) => {
    http
      .get("http://localhost:3000/health", (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const health = JSON.parse(data);
            resolve({ running: true, status: health.status });
          } catch {
            resolve({ running: true, status: "unknown" });
          }
        });
      })
      .on("error", () => {
        resolve({ running: false });
      });
  });
}

async function checkNgrok() {
  return new Promise((resolve) => {
    http
      .get("http://localhost:4040/api/tunnels", (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            const tunnels = response.tunnels || [];
            const httpsTunnel = tunnels.find((t) => t.proto === "https");
            const httpTunnel = tunnels.find((t) => t.proto === "http");
            const url = httpsTunnel?.public_url || httpTunnel?.public_url;
            resolve({ running: !!url, url });
          } catch {
            resolve({ running: false });
          }
        });
      })
      .on("error", () => {
        resolve({ running: false });
      });
  });
}

async function main() {
  console.log("🔍 Checking setup status...\n");

  // Check server
  const server = await checkServer();
  console.log("📊 Server Status:");
  if (server.running) {
    console.log("   ✅ Running on port 3000");
    console.log(`   Status: ${server.status}`);
  } else {
    console.log("   ❌ Not running");
    console.log("   💡 Start with: npm start");
  }
  console.log("");

  // Check ngrok
  const ngrok = await checkNgrok();
  console.log("📊 ngrok Status:");
  if (ngrok.running) {
    console.log("   ✅ Running");
    console.log(`   URL: ${ngrok.url}`);
    console.log("");
    console.log("📋 Your Webhook URLs:");
    console.log(`   📱 Green API: ${ngrok.url}/webhooks/greenapi`);
    console.log(`   💳 Stripe: ${ngrok.url}/webhooks/stripe`);
  } else {
    console.log("   ❌ Not running");
    console.log("   💡 Start with: npm run webhook:tunnel");
    console.log("   Or manually: ngrok http 3000");
  }
  console.log("");

  // Summary
  if (server.running && ngrok.running) {
    console.log("✅ Everything is ready!");
    console.log("");
    console.log("📝 Next: Configure webhook in Green API console");
    console.log(`   URL: ${ngrok.url}/webhooks/greenapi`);
  } else {
    console.log("⚠️  Setup incomplete");
    if (!server.running) {
      console.log("   - Start server: npm start");
    }
    if (!ngrok.running) {
      console.log("   - Start ngrok: npm run webhook:tunnel");
    }
  }
}

main().catch(console.error);
