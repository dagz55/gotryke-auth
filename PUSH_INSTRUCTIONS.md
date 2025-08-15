# Instructions to Push GoTryke to GitHub

GitHub is blocking the push because of secrets detected in the commit history. The Twilio Account SID was found in the .env file.

## Option 1: Allow the secret through GitHub UI
1. Visit: https://github.com/dagz55/gotryke-auth/security/secret-scanning/unblock-secret/31JqskVsmt3nh9uHjFF1ilEVSXZ
2. Click "Allow secret" if you have permission
3. Then run: `git push gotryke-auth clean-main:main --force`

## Option 2: Create a completely clean repository
1. Create a new GitHub repository
2. Clone this code without .env files
3. Push to the new repository

## Option 3: Use BFG Repo-Cleaner
1. Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/
2. Run: `java -jar bfg.jar --delete-files .env gotryke-auth.git`
3. Follow BFG instructions to clean the history

## Important Notes
- The .env file has been removed from tracking and added to .gitignore
- Use .env.example as a template for environment variables
- Never commit real API keys or secrets to the repository

## Current Status
- All code is ready in the `clean-main` branch
- The only blocker is the historical .env file in the commit history
- Once the secret is allowed or history is cleaned, the push will succeed