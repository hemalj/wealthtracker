#!/bin/bash

# WealthTracker - Push to GitHub Script
# Run this after creating your GitHub repository

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     WealthTracker - GitHub Push Script                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if git remote already exists
if git remote | grep -q 'origin'; then
    echo -e "${GREEN}✓ Git remote 'origin' already configured${NC}"
    git remote -v
    echo ""
    read -p "Do you want to push to this remote? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
else
    # Ask for GitHub username
    echo -e "${BLUE}Please enter your GitHub username:${NC}"
    read -r GITHUB_USERNAME

    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}Error: GitHub username cannot be empty${NC}"
        exit 1
    fi

    # Add remote
    REPO_URL="https://github.com/${GITHUB_USERNAME}/wealthtracker.git"
    echo ""
    echo -e "${BLUE}Adding remote: ${REPO_URL}${NC}"
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✓ Remote added successfully${NC}"
fi

# Show what will be pushed
echo ""
echo -e "${BLUE}Files to be pushed:${NC}"
git log --stat --oneline -1
echo ""

# Confirm push
read -p "Push to GitHub? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Push to GitHub
echo ""
echo -e "${BLUE}Pushing to GitHub...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              SUCCESS! 🎉                               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Your repository is now on GitHub!${NC}"
    echo ""
    echo -e "${BLUE}View it at:${NC}"
    echo "https://github.com/${GITHUB_USERNAME}/wealthtracker"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Add a nice README badge or logo (optional)"
    echo "2. Enable GitHub Pages for docs (optional)"
    echo "3. Invite collaborators (Settings > Collaborators)"
    echo "4. Start development following docs/03-implementation/quick-start-guide.md"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              PUSH FAILED                               ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Make sure you:${NC}"
    echo "1. Created the repository on GitHub (https://github.com/new)"
    echo "2. Named it exactly: wealthtracker"
    echo "3. Did NOT initialize it with README, .gitignore, or license"
    echo ""
    echo -e "${BLUE}If you're getting authentication errors:${NC}"
    echo "1. Make sure you're logged in to GitHub"
    echo "2. You may need to use a Personal Access Token instead of password"
    echo "3. Create one at: https://github.com/settings/tokens"
    echo "4. Use the token as your password when prompted"
    echo ""
fi
