#!/bin/bash
set -e

cd "$(dirname "$0")"

# Ensure Homebrew and the standard Node.js installer are on PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Install Node.js LTS from https://nodejs.org/ and try again."
    exit 1
fi

if [ ! -f scripts/test-server.cjs ]; then
    echo "[ERROR] Cannot find scripts/test-server.cjs."
    exit 1
fi

export PORT=5517
echo "=========================================="
echo "AUREL - Local web server"
echo "Admin: http://127.0.0.1:5517/index.html"
echo "Store: http://127.0.0.1:5517/home.html"
echo "Press Ctrl+C to stop the server."
echo "=========================================="

exec node scripts/test-server.cjs
