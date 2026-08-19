#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Installing dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Initializing CreditBridge Database & ML Models ==="
python init_system.py

echo "=== Render Build Finished Successfully ==="
