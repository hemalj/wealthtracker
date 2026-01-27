#!/bin/bash
# Quick push to GitHub - Edit the username below

# EDIT THIS LINE - Put your GitHub username here:
GITHUB_USERNAME="hemalj"

# Rest of the script
if [ "$GITHUB_USERNAME" = "YOUR_GITHUB_USERNAME_HERE" ]; then
    echo "ERROR: Please edit this file and set your GitHub username on line 4"
    echo "Open PUSH_NOW.sh and change YOUR_GITHUB_USERNAME_HERE to your actual username"
    exit 1
fi

# Add remote
git remote add origin "https://github.com/${GITHUB_USERNAME}/wealthtracker.git" 2>/dev/null || echo "Remote already exists"

# Push
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Repository pushed to GitHub!"
    echo "View it at: https://github.com/${GITHUB_USERNAME}/wealthtracker"
else
    echo ""
    echo "❌ Push failed. You may need to authenticate."
    echo "Try running: git push -u origin main"
fi
