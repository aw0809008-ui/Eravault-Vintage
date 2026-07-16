#!/bin/bash

# Eravauly Vintage - GitHub Push Script
# Run this script in the project folder

echo "🚀 Pushing Eravauly Vintage to GitHub..."
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " USERNAME

# Get GitHub token (hidden input)
read -s -p "Enter your GitHub token: " TOKEN
echo ""

# Repository name
REPO="Eravault-inventory"

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    echo "✓ Git initialized"
fi

# Add all files
git add .
echo "✓ Files added"

# Commit
git commit -m "Eravauly Vintage v1.0 - Inventory Management System" 2>/dev/null || git commit --amend -m "Eravauly Vintage v1.0 - Inventory Management System"
echo "✓ Committed"

# Set remote
git remote remove origin 2>/dev/null
git remote add origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO}.git
echo "✓ Remote set"

# Push
git branch -M main
git push -u origin main --force
echo ""
echo "✅ Done! Check: https://github.com/${USERNAME}/${REPO}"
