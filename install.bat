@echo off
REM GoTryke Transportation Management App - Windows Installation Script
REM This script installs all required dependencies and sets up the development environment

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM ASCII Art Banner
echo %GREEN%
echo    ____     _____            _        
echo   / ___^| __^|_   _^| __ _   _ ^| ^| _____ 
echo  ^| ^|  _ / _ \^| ^|^| '__^| ^| ^| ^|^| ^|/ / _ \
echo  ^| ^|_^| ^| (_) ^| ^|^| ^|  ^| ^|_^| ^|^|   ^<  __/
echo   \____^|\___/^|_^|^|_^|   \__, ^|^|_^|\_\___^|
echo                       ^|___/            
echo     Transportation Management System
echo %NC%

echo.
echo %BLUE%[INFO]%NC% Starting GoTryke installation process...
echo.

REM Check Node.js
echo %BLUE%[INFO]%NC% Checking Node.js version...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% Node.js is not installed!
    echo %BLUE%[INFO]%NC% Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
    set NODE_MAJOR=%%b
)

if !NODE_MAJOR! lss 18 (
    echo %RED%[ERROR]%NC% Node.js version 18 or higher is required!
    echo %BLUE%[INFO]%NC% Current version: 
    node --version
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% Node.js detected
node --version
echo.

REM Check npm
echo %BLUE%[INFO]%NC% Checking npm version...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% npm is not installed!
    pause
    exit /b 1
)

echo %GREEN%[SUCCESS]%NC% npm detected
npm --version
echo.

REM Create project structure
echo %BLUE%[INFO]%NC% Verifying project structure...

REM Create directories
for %%d in (
    "src\app"
    "src\app\(app)\admin"
    "src\app\(app)\dashboard"
    "src\app\(app)\dispatcher"
    "src\app\(app)\passenger"
    "src\app\(app)\rider"
    "src\app\(app)\payments"
    "src\app\api"
    "src\app\signup"
    "src\components\ui"
    "src\components\auth"
    "src\contexts"
    "src\lib"
    "src\ai"
    "src\hooks"
    "public"
) do (
    if not exist "%%~d" (
        mkdir "%%~d"
        echo %GREEN%[SUCCESS]%NC% Created directory: %%~d
    )
)

REM Check/Create package.json
if not exist package.json (
    echo %YELLOW%[WARNING]%NC% package.json not found. Creating from template...
    echo Creating package.json...
    
    REM Run the Node.js dependency update script
    node update-dependencies.js
    
    echo %GREEN%[SUCCESS]%NC% package.json created
) else (
    echo %GREEN%[SUCCESS]%NC% package.json exists
    
    REM Update dependencies
    echo %BLUE%[INFO]%NC% Updating dependencies...
    node update-dependencies.js
)

echo.

REM Install npm packages
echo %BLUE%[INFO]%NC% Installing npm dependencies...
echo This may take several minutes...
call npm install
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% Failed to install npm dependencies
    pause
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% All npm dependencies installed successfully
echo.

REM Install global tools
echo %BLUE%[INFO]%NC% Installing global development tools...

REM Check Firebase CLI
where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo %BLUE%[INFO]%NC% Installing Firebase CLI...
    call npm install -g firebase-tools
    echo %GREEN%[SUCCESS]%NC% Firebase CLI installed
) else (
    echo %GREEN%[SUCCESS]%NC% Firebase CLI already installed
)

REM Check Supabase CLI
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo %BLUE%[INFO]%NC% Installing Supabase CLI...
    call npm install -g supabase
    echo %GREEN%[SUCCESS]%NC% Supabase CLI installed
) else (
    echo %GREEN%[SUCCESS]%NC% Supabase CLI already installed
)

echo.

REM Setup environment files
echo %BLUE%[INFO]%NC% Setting up environment files...

if not exist .env (
    echo %BLUE%[INFO]%NC% Creating .env file...
    (
        echo # Firebase Configuration
        echo NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
        echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
        echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
        echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
        echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
        echo NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
        echo.
        echo # Firebase Admin SDK ^(Server-side^)
        echo FIREBASE_ADMIN_PROJECT_ID=your-project-id
        echo FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
        echo FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
        echo.
        echo # Supabase Configuration
        echo NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        echo SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
        echo.
        echo # Mapbox Configuration
        echo NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
        echo.
        echo # Twilio SMS Configuration
        echo TWILIO_ACCOUNT_SID=your-twilio-account-sid
        echo TWILIO_AUTH_TOKEN=your-twilio-auth-token
        echo TWILIO_PHONE_NUMBER=your-twilio-phone-number
        echo.
        echo # Semaphore SMS Configuration
        echo SEMAPHORE_API_KEY=your-semaphore-api-key
        echo SEMAPHORE_SENDER_NAME=GoTryke
        echo.
        echo # Google AI ^(Genkit/Gemini^)
        echo GOOGLE_GENAI_API_KEY=your-google-ai-api-key
        echo.
        echo # Anthropic ^(Optional^)
        echo ANTHROPIC_API_KEY=your-anthropic-api-key
        echo.
        echo # Application Settings
        echo NEXT_PUBLIC_APP_URL=http://localhost:9002
        echo NODE_ENV=development
    ) > .env
    echo %GREEN%[SUCCESS]%NC% .env file created
    echo %YELLOW%[WARNING]%NC% Please update .env with your actual API keys and configuration
) else (
    echo %GREEN%[SUCCESS]%NC% .env file already exists
)

if not exist .env.local (
    copy .env .env.local >nul
    echo %GREEN%[SUCCESS]%NC% .env.local created from .env
)

echo.

REM Setup configuration files
echo %BLUE%[INFO]%NC% Checking configuration files...

REM Create next.config.ts if not exists
if not exist next.config.ts (
    echo %BLUE%[INFO]%NC% Creating next.config.ts...
    (
        echo import type { NextConfig } from "next";
        echo.
        echo const nextConfig: NextConfig = {
        echo   eslint: {
        echo     ignoreDuringBuilds: true,
        echo   },
        echo   typescript: {
        echo     ignoreBuildErrors: true,
        echo   },
        echo   images: {
        echo     domains: ['firebasestorage.googleapis.com', 'supabase.co'],
        echo   },
        echo };
        echo.
        echo export default nextConfig;
    ) > next.config.ts
    echo %GREEN%[SUCCESS]%NC% next.config.ts created
)

REM Create tsconfig.json if not exists
if not exist tsconfig.json (
    echo %BLUE%[INFO]%NC% Creating tsconfig.json...
    (
        echo {
        echo   "compilerOptions": {
        echo     "target": "ES2017",
        echo     "lib": ["dom", "dom.iterable", "esnext"],
        echo     "allowJs": true,
        echo     "skipLibCheck": true,
        echo     "strict": true,
        echo     "noEmit": true,
        echo     "esModuleInterop": true,
        echo     "module": "esnext",
        echo     "moduleResolution": "bundler",
        echo     "resolveJsonModule": true,
        echo     "isolatedModules": true,
        echo     "jsx": "preserve",
        echo     "incremental": true,
        echo     "plugins": [
        echo       {
        echo         "name": "next"
        echo       }
        echo     ],
        echo     "paths": {
        echo       "@/*": ["./src/*"]
        echo     }
        echo   },
        echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        echo   "exclude": ["node_modules"]
        echo }
    ) > tsconfig.json
    echo %GREEN%[SUCCESS]%NC% tsconfig.json created
)

REM Create firebase.json if not exists
if not exist firebase.json (
    echo %BLUE%[INFO]%NC% Creating firebase.json...
    (
        echo {
        echo   "firestore": {
        echo     "rules": "firestore.rules",
        echo     "indexes": "firestore.indexes.json"
        echo   },
        echo   "storage": {
        echo     "rules": "storage.rules"
        echo   }
        echo }
    ) > firebase.json
    echo %GREEN%[SUCCESS]%NC% firebase.json created
)

REM Create firestore.rules if not exists
if not exist firestore.rules (
    echo %BLUE%[INFO]%NC% Creating firestore.rules...
    (
        echo rules_version = '2';
        echo service cloud.firestore {
        echo   match /databases/{database}/documents {
        echo     // Allow authenticated users to read/write their own data
        echo     match /users/{userId} {
        echo       allow read, write: if request.auth != null ^&^& request.auth.uid == userId;
        echo     }
        echo     
        echo     // Admin rules
        echo     match /admin/{document=**} {
        echo       allow read, write: if request.auth != null ^&^& 
        echo         get^(/databases/$^(database^)/documents/users/$^(request.auth.uid^)^).data.role == 'admin';
        echo     }
        echo     
        echo     // General authenticated access
        echo     match /{document=**} {
        echo       allow read: if request.auth != null;
        echo       allow write: if request.auth != null ^&^& 
        echo         get^(/databases/$^(database^)/documents/users/$^(request.auth.uid^)^).data.role in ['admin', 'dispatcher'];
        echo     }
        echo   }
        echo }
    ) > firestore.rules
    echo %GREEN%[SUCCESS]%NC% firestore.rules created
)

echo.

REM Final checks
echo %BLUE%[INFO]%NC% Running post-installation checks...

set all_good=1

if not exist package.json (
    echo %RED%[ERROR]%NC% Missing critical file: package.json
    set all_good=0
)

if not exist .env (
    echo %RED%[ERROR]%NC% Missing critical file: .env
    set all_good=0
)

if !all_good!==1 (
    echo %GREEN%[SUCCESS]%NC% All critical files are present
) else (
    echo %RED%[ERROR]%NC% Some critical files are missing. Please check the installation.
    pause
    exit /b 1
)

echo.
echo ========================================
echo.
echo %GREEN%[SUCCESS] GoTryke installation completed successfully!%NC%
echo.
echo %BLUE%Next steps:%NC%
echo   1. Update the .env file with your API keys and configuration
echo   2. Run 'npm run dev' to start the development server on port 9002
echo   3. Run 'npm run genkit:dev' to start the AI development server
echo   4. Visit http://localhost:9002 to view the application
echo.
echo %BLUE%Available commands:%NC%
echo   npm run dev         - Start development server
echo   npm run build       - Build for production
echo   npm run start       - Start production server
echo   npm run lint        - Run ESLint
echo   npm run typecheck   - Run TypeScript type checking
echo   npm run genkit:dev  - Start AI development server
echo.
echo %GREEN%Happy coding! 🚀%NC%
echo.
pause