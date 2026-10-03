#!/usr/bin/env bash
# Generates an instant, free, secure HTTPS public tunnel using Cloudflare
# No login or account required.

echo "=========================================================="
echo "   🎾 PICKLEBALL PRO - INSTANT FREE PUBLIC TUNNEL 🎾     "
echo "=========================================================="
echo "Routing local server (http://localhost:8001) to public HTTPS..."
echo "Share the generated https://*.trycloudflare.com link with players!"
echo "=========================================================="

cloudflared tunnel --url http://localhost:8001
