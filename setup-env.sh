#!/bin/bash

# GoTryke Environment Setup Script
# This script helps set up and validate environment variables

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$(echo -e ${BLUE}$prompt ${YELLOW}[$default]${NC}: )" value
        value="${value:-$default}"
    else
        read -p "$(echo -e ${BLUE}$prompt${NC}: )" value
    fi
    
    eval "$var_name='$value'"
}

# Function to prompt for secret input
prompt_secret() {
    local prompt="$1"
    local var_name="$2"
    
    echo -e "${BLUE}$prompt${NC}: "
    read -s value
    echo
    eval "$var_name='$value'"
}

# Check if .env exists and backup
backup_env() {
    if [ -f ".env" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp .env ".env.backup.$timestamp"
        print_success "Backed up existing .env to .env.backup.$timestamp"
    fi
}

# Interactive setup
interactive_setup() {
    print_header "GoTryke Environment Configuration"
    echo ""
    print_status "This wizard will help you configure your environment variables."
    print_status "Press Enter to use default values where available."
    echo ""
    
    # Application Settings
    print_header "Application Settings"
    prompt_with_default "Application URL" "http://localhost:9002" APP_URL
    prompt_with_default "Node Environment (development/production)" "development" NODE_ENV
    echo ""
    
    # Firebase Configuration
    print_header "Firebase Configuration"
    print_status "Get these from Firebase Console > Project Settings"
    prompt_with_default "Firebase API Key" "" FIREBASE_API_KEY
    prompt_with_default "Firebase Auth Domain" "" FIREBASE_AUTH_DOMAIN
    prompt_with_default "Firebase Project ID" "" FIREBASE_PROJECT_ID
    prompt_with_default "Firebase Storage Bucket" "" FIREBASE_STORAGE_BUCKET
    prompt_with_default "Firebase Messaging Sender ID" "" FIREBASE_MESSAGING_SENDER_ID
    prompt_with_default "Firebase App ID" "" FIREBASE_APP_ID
    echo ""
    
    # Firebase Admin SDK
    print_status "For server-side operations (optional)"
    prompt_with_default "Firebase Admin Client Email" "" FIREBASE_ADMIN_CLIENT_EMAIL
    if [ -n "$FIREBASE_ADMIN_CLIENT_EMAIL" ]; then
        prompt_secret "Firebase Admin Private Key (paste the entire key)" FIREBASE_ADMIN_PRIVATE_KEY
    fi
    echo ""
    
    # Supabase Configuration
    print_header "Supabase Configuration (Optional)"
    print_status "Leave blank if not using Supabase"
    prompt_with_default "Supabase URL" "" SUPABASE_URL
    if [ -n "$SUPABASE_URL" ]; then
        prompt_with_default "Supabase Anon Key" "" SUPABASE_ANON_KEY
        prompt_secret "Supabase Service Role Key" SUPABASE_SERVICE_KEY
    fi
    echo ""
    
    # Mapbox Configuration
    print_header "Mapbox Configuration"
    print_status "Get from https://account.mapbox.com/"
    prompt_with_default "Mapbox Access Token" "" MAPBOX_TOKEN
    echo ""
    
    # Twilio SMS Configuration
    print_header "Twilio SMS Configuration (Optional)"
    print_status "Get from https://console.twilio.com/"
    prompt_with_default "Twilio Account SID" "" TWILIO_SID
    if [ -n "$TWILIO_SID" ]; then
        prompt_secret "Twilio Auth Token" TWILIO_TOKEN
        prompt_with_default "Twilio Phone Number" "" TWILIO_PHONE
    fi
    echo ""
    
    # Semaphore SMS Configuration
    print_header "Semaphore SMS Configuration (Optional - Philippines)"
    prompt_with_default "Semaphore API Key" "" SEMAPHORE_KEY
    if [ -n "$SEMAPHORE_KEY" ]; then
        prompt_with_default "Semaphore Sender Name" "GoTryke" SEMAPHORE_SENDER
    fi
    echo ""
    
    # Google AI Configuration
    print_header "Google AI Configuration (Genkit/Gemini)"
    print_status "Get from https://makersuite.google.com/app/apikey"
    prompt_with_default "Google AI API Key" "" GOOGLE_AI_KEY
    echo ""
    
    # Write to .env file
    cat > .env << EOF
# GoTryke Environment Configuration
# Generated on $(date)

# Application Settings
NEXT_PUBLIC_APP_URL=$APP_URL
NODE_ENV=$NODE_ENV

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=$FIREBASE_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL=$FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY="$FIREBASE_ADMIN_PRIVATE_KEY"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$MAPBOX_TOKEN

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=$TWILIO_SID
TWILIO_AUTH_TOKEN=$TWILIO_TOKEN
TWILIO_PHONE_NUMBER=$TWILIO_PHONE

# Semaphore SMS Configuration
SEMAPHORE_API_KEY=$SEMAPHORE_KEY
SEMAPHORE_SENDER_NAME=$SEMAPHORE_SENDER

# Google AI (Genkit/Gemini)
GOOGLE_GENAI_API_KEY=$GOOGLE_AI_KEY

# Additional API Keys (Optional)
ANTHROPIC_API_KEY=
EOF
    
    print_success ".env file created successfully!"
    
    # Create .env.local
    cp .env .env.local
    print_success ".env.local created from .env"
}

# Validate environment
validate_env() {
    print_header "Validating Environment Configuration"
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        return 1
    fi
    
    # Source the .env file
    export $(cat .env | grep -v '^#' | xargs)
    
    local has_errors=false
    
    # Check required variables
    print_status "Checking required variables..."
    
    if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
        print_warning "NEXT_PUBLIC_APP_URL is not set"
    else
        print_success "App URL: $NEXT_PUBLIC_APP_URL"
    fi
    
    # Check Firebase
    if [ -n "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
        print_success "Firebase configuration detected"
    else
        print_warning "Firebase not configured"
    fi
    
    # Check Supabase
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_success "Supabase configuration detected"
    else
        print_warning "Supabase not configured"
    fi
    
    # Check at least one backend
    if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_error "No backend configured! You need either Firebase or Supabase"
        has_errors=true
    fi
    
    # Check Mapbox
    if [ -n "$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN" ]; then
        print_success "Mapbox configuration detected"
    else
        print_warning "Mapbox not configured (maps won't work)"
    fi
    
    # Check SMS
    if [ -n "$TWILIO_ACCOUNT_SID" ] || [ -n "$SEMAPHORE_API_KEY" ]; then
        print_success "SMS service configured"
    else
        print_warning "No SMS service configured"
    fi
    
    # Check AI
    if [ -n "$GOOGLE_GENAI_API_KEY" ]; then
        print_success "Google AI configured"
    else
        print_warning "Google AI not configured"
    fi
    
    if [ "$has_errors" = true ]; then
        return 1
    fi
    
    return 0
}

# Generate example .env
generate_example() {
    cat > .env.example << 'EOF'
# GoTryke Environment Configuration Example
# Copy this file to .env and fill in your actual values

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development

# Firebase Configuration
# Get these from Firebase Console > Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin SDK (Server-side)
# Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Supabase Configuration (Optional - Alternative to Firebase)
# Get from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mapbox Configuration
# Get from https://account.mapbox.com/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Twilio SMS Configuration
# Get from https://console.twilio.com/
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Semaphore SMS Configuration (Philippines)
# Get from https://semaphore.co/
SEMAPHORE_API_KEY=your-semaphore-api-key
SEMAPHORE_SENDER_NAME=GoTryke

# Google AI (Genkit/Gemini)
# Get from https://makersuite.google.com/app/apikey
GOOGLE_GENAI_API_KEY=your-google-ai-api-key

# Anthropic (Optional)
# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=your-anthropic-api-key
EOF
    
    print_success ".env.example created"
}

# Main menu
show_menu() {
    print_header "GoTryke Environment Setup"
    echo ""
    echo "1) Interactive Setup - Configure environment step by step"
    echo "2) Validate Environment - Check current .env configuration"
    echo "3) Generate Example - Create .env.example template"
    echo "4) Backup Current - Backup existing .env file"
    echo "5) Exit"
    echo ""
    prompt_with_default "Select option" "1" choice
    
    case $choice in
        1)
            backup_env
            interactive_setup
            validate_env
            ;;
        2)
            validate_env
            ;;
        3)
            generate_example
            ;;
        4)
            backup_env
            ;;
        5)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Run if no arguments
if [ $# -eq 0 ]; then
    show_menu
else
    case "$1" in
        --setup)
            backup_env
            interactive_setup
            validate_env
            ;;
        --validate)
            validate_env
            ;;
        --example)
            generate_example
            ;;
        --backup)
            backup_env
            ;;
        --help)
            echo "Usage: $0 [OPTION]"
            echo "Setup environment variables for GoTryke"
            echo ""
            echo "Options:"
            echo "  --setup     Run interactive setup"
            echo "  --validate  Validate current configuration"
            echo "  --example   Generate .env.example file"
            echo "  --backup    Backup current .env file"
            echo "  --help      Show this help message"
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
fi