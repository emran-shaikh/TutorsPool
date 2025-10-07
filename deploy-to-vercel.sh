#!/bin/bash

# 🚀 TutorsPool Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 TutorsPool Vercel Deployment"
echo "==============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Vercel CLI is installed
echo -e "${BLUE}📦 Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo -e "${YELLOW}Installing Vercel CLI globally...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi
echo ""

# Step 2: Type Check
echo -e "${BLUE}🔍 Running TypeScript type check...${NC}"
npm run type-check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi
echo ""

# Step 3: Lint Check
echo -e "${BLUE}🧹 Running ESLint...${NC}"
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${RED}❌ Lint check failed${NC}"
    echo -e "${YELLOW}Attempting to fix...${NC}"
    npm run lint:fix
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Lint issues fixed${NC}"
    else
        echo -e "${RED}❌ Could not fix all lint issues${NC}"
        exit 1
    fi
fi
echo ""

# Step 4: Security Check
echo -e "${BLUE}🔒 Running security check...${NC}"
npm run security:check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Security check passed${NC}"
else
    echo -e "${RED}❌ Security check failed - hardcoded secrets detected!${NC}"
    exit 1
fi
echo ""

# Step 5: Build Test
echo -e "${BLUE}🏗️  Testing production build...${NC}"
npm run build:production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 6: Confirmation
echo -e "${YELLOW}⚠️  Ready to deploy to Vercel Production${NC}"
echo ""
echo "Please confirm the following:"
echo "  1. All environment variables are set in Vercel Dashboard"
echo "  2. Firebase credentials are correct"
echo "  3. Stripe keys are LIVE (pk_live_, sk_live_)"
echo "  4. You have tested in preview/staging environment"
echo ""
read -p "Do you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Step 7: Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel Production...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Your application is now live!"
    echo ""
    echo "Next steps:"
    echo "  1. Test the live application thoroughly"
    echo "  2. Update Stripe webhooks with production URL"
    echo "  3. Add production domain to Firebase Authorized Domains"
    echo "  4. Monitor Vercel dashboard for errors"
    echo "  5. Enable Vercel Analytics"
    echo ""
    echo "📊 View deployment: https://vercel.com/dashboard"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above and try again"
    exit 1
fi

