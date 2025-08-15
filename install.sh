#!/bin/bash

# GoTryke Transportation Management App - Installation Script
# This script installs all required dependencies and sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ASCII Art Banner
echo -e "${GREEN}"
cat << "EOF"
   ____     _____            _        
  / ___| __|_   _| __ _   _ | | _____ 
 | |  _ / _ \| || '__| | | || |/ / _ \
 | |_| | (_) | || |  | |_| ||   <  __/
  \____|\___/|_||_|   \__, ||_|\_\___|
                      |___/            
    Transportation Management System
EOF
echo -e "${NC}"

print_status "Starting GoTryke installation process..."

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        print_status "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required!"
        print_status "Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detected"
}

# Check npm version
check_npm_version() {
    print_status "Checking npm version..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_success "npm $(npm -v) detected"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Create package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found. Creating from template..."
        cat > package.json << 'EOJSON'
{
  "name": "gotryke",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 9002",
    "build": "next build",
    "start": "next start -p 9002",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "genkit:dev": "node --loader tsx/esm src/ai/dev.ts"
  },
  "dependencies": {
    "@genkit-ai/googleai": "^0.9.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.43.5",
    "@tanstack/react-table": "^8.19.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "firebase": "^10.12.2",
    "firebase-admin": "^12.0.0",
    "genkit": "^0.9.0",
    "jose": "^5.2.2",
    "lucide-react": "^0.475.0",
    "mapbox-gl": "^3.0.0",
    "next": "^15.3.3",
    "next-themes": "^0.4.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "twilio": "^4.19.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.0.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.32.0",
    "eslint-config-next": "^15.3.3",
    "postcss": "^8",
    "supabase": "^2.33.9",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.0",
    "typescript": "^5"
  }
}
EOJSON
        print_success "package.json created"
    fi
    
    # Install npm packages
    print_status "Running npm install..."
    npm install
    
    print_success "All npm dependencies installed successfully"
}

# Install global tools
install_global_tools() {
    print_status "Installing global development tools..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_status "Installing Firebase CLI..."
        npm install -g firebase-tools
        print_success "Firebase CLI installed"
    else
        print_success "Firebase CLI already installed"
    fi
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_status "Installing Supabase CLI..."
        
        # Detect OS and install accordingly
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install supabase/tap/supabase
            else
                print_warning "Homebrew not found. Installing via npm..."
                npm install -g supabase
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                # Debian/Ubuntu
                curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.deb -o supabase.deb
                sudo dpkg -i supabase.deb
                rm supabase.deb
            else
                # Other Linux - install via npm
                npm install -g supabase
            fi
        else
            # Windows or other - install via npm
            npm install -g supabase
        fi
        print_success "Supabase CLI installed"
    else
        print_success "Supabase CLI already installed"
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cat > .env << 'EOENV'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Semaphore SMS Configuration (Alternative)
SEMAPHORE_API_KEY=your-semaphore-api-key
SEMAPHORE_SENDER_NAME=GoTryke

# Google AI (Genkit/Gemini)
GOOGLE_GENAI_API_KEY=your-google-ai-api-key

# Anthropic (Optional)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development
EOENV
        print_success ".env file created"
        print_warning "Please update .env with your actual API keys and configuration"
    else
        print_success ".env file already exists"
    fi
    
    if [ ! -f ".env.local" ]; then
        cp .env .env.local
        print_success ".env.local created from .env"
    fi
}

# Setup configuration files
setup_config_files() {
    print_status "Checking configuration files..."
    
    # Create next.config.ts if not exists
    if [ ! -f "next.config.ts" ]; then
        print_status "Creating next.config.ts..."
        cat > next.config.ts << 'EOCONFIG'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'supabase.co'],
  },
};

export default nextConfig;
EOCONFIG
        print_success "next.config.ts created"
    fi
    
    # Create tsconfig.json if not exists
    if [ ! -f "tsconfig.json" ]; then
        print_status "Creating tsconfig.json..."
        cat > tsconfig.json << 'EOTSCONFIG'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOTSCONFIG
        print_success "tsconfig.json created"
    fi
    
    # Create tailwind.config.ts if not exists
    if [ ! -f "tailwind.config.ts" ]; then
        print_status "Creating tailwind.config.ts..."
        cat > tailwind.config.ts << 'EOTAILWIND'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOTAILWIND
        print_success "tailwind.config.ts created"
    fi
}

# Initialize Firebase
init_firebase() {
    print_status "Checking Firebase configuration..."
    
    if [ ! -f "firebase.json" ]; then
        print_status "Creating firebase.json..."
        cat > firebase.json << 'EOFIREBASE'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOFIREBASE
        print_success "firebase.json created"
    fi
    
    if [ ! -f "firestore.rules" ]; then
        print_status "Creating firestore.rules..."
        cat > firestore.rules << 'EORULES'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin rules
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // General authenticated access
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'dispatcher'];
    }
  }
}
EORULES
        print_success "firestore.rules created"
    fi
}

# Check and create project structure
check_project_structure() {
    print_status "Verifying project structure..."
    
    # Create necessary directories
    directories=(
        "src/app"
        "src/app/(app)/admin"
        "src/app/(app)/dashboard"
        "src/app/(app)/dispatcher"
        "src/app/(app)/passenger"
        "src/app/(app)/rider"
        "src/app/(app)/payments"
        "src/app/api"
        "src/app/signup"
        "src/components/ui"
        "src/components/auth"
        "src/contexts"
        "src/lib"
        "src/ai"
        "src/hooks"
        "public"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Run post-installation checks
post_install_checks() {
    print_status "Running post-installation checks..."
    
    # Check if all critical files exist
    critical_files=(
        "package.json"
        "next.config.ts"
        "tsconfig.json"
        "tailwind.config.ts"
        ".env"
    )
    
    all_good=true
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Missing critical file: $file"
            all_good=false
        fi
    done
    
    if [ "$all_good" = true ]; then
        print_success "All critical files are present"
    else
        print_error "Some critical files are missing. Please check the installation."
        exit 1
    fi
}

# Main installation flow
main() {
    print_status "Checking system requirements..."
    check_node_version
    check_npm_version
    
    print_status "Setting up project..."
    check_project_structure
    install_dependencies
    install_global_tools
    setup_environment
    setup_config_files
    init_firebase
    post_install_checks
    
    echo ""
    print_success "🎉 GoTryke installation completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Update the .env file with your API keys and configuration"
    echo "  2. Run 'npm run dev' to start the development server on port 9002"
    echo "  3. Run 'npm run genkit:dev' to start the AI development server"
    echo "  4. Visit http://localhost:9002 to view the application"
    echo ""
    print_status "Available commands:"
    echo "  npm run dev         - Start development server"
    echo "  npm run build       - Build for production"
    echo "  npm run start       - Start production server"
    echo "  npm run lint        - Run ESLint"
    echo "  npm run typecheck   - Run TypeScript type checking"
    echo "  npm run genkit:dev  - Start AI development server"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main