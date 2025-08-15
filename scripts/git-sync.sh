#!/bin/bash

# Git Sync Script - Robust git push with branch selection and logging
# Author: DevOps Engineer Agent
# Usage: ./scripts/git-sync.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="git-sync-$(date +%Y%m%d-%H%M%S).log"
SCRIPT_START_TIME=$(date +%s)

# Initialize log
echo "=== Git Sync Script Log ===" > "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"
echo "Working directory: $(pwd)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    local line_no=$1
    local error_code=$2
    echo -e "${RED}Error occurred on line $line_no: exit code $error_code${NC}" | tee -a "$LOG_FILE"
    echo "Check $LOG_FILE for details" | tee -a "$LOG_FILE"
    generate_summary "FAILED"
    exit $error_code
}

# Success message function
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Warning message function
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Info message function
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Generate summary function
generate_summary() {
    local status=$1
    local end_time=$(date +%s)
    local duration=$((end_time - SCRIPT_START_TIME))
    
    echo "" | tee -a "$LOG_FILE"
    echo "=== SYNC SUMMARY ===" | tee -a "$LOG_FILE"
    echo "Status: $status" | tee -a "$LOG_FILE"
    echo "Duration: ${duration}s" | tee -a "$LOG_FILE"
    echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
    
    if [ -n "${FILES_CHANGED:-}" ]; then
        echo "Files changed: $FILES_CHANGED" | tee -a "$LOG_FILE"
    fi
    
    if [ -n "${COMMIT_HASH:-}" ]; then
        echo "Commit hash: $COMMIT_HASH" | tee -a "$LOG_FILE"
    fi
    
    if [ -n "${TARGET_BRANCH:-}" ]; then
        echo "Target branch: $TARGET_BRANCH" | tee -a "$LOG_FILE"
    fi
    
    echo "Completed at: $(date)" | tee -a "$LOG_FILE"
    echo "===================" | tee -a "$LOG_FILE"
}

# Set up error trap
trap 'handle_error $LINENO $?' ERR

echo -e "${CYAN}🚀 Git Sync Script${NC}"
echo "==================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

log "Git repository detected"

# Check git status
echo -e "\n${BLUE}Checking repository status...${NC}"
git status --porcelain > /dev/null 2>&1 || {
    echo -e "${RED}Error: Failed to check git status${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Count changes
STAGED_CHANGES=$(git diff --cached --name-only | wc -l)
UNSTAGED_CHANGES=$(git diff --name-only | wc -l)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard | wc -l)
TOTAL_CHANGES=$((STAGED_CHANGES + UNSTAGED_CHANGES + UNTRACKED_FILES))

log "Repository status: Staged: $STAGED_CHANGES, Unstaged: $UNSTAGED_CHANGES, Untracked: $UNTRACKED_FILES"

if [ $TOTAL_CHANGES -eq 0 ]; then
    print_warning "No changes detected. Nothing to commit."
    generate_summary "NO_CHANGES"
    exit 0
fi

print_info "Found $TOTAL_CHANGES file(s) with changes"

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"
log "Current branch: $CURRENT_BRANCH"

# Get available branches
echo -e "\n${BLUE}Available branches:${NC}"
git branch -a | grep -v HEAD | sed 's/^[* ]*//' | sed 's/remotes\/origin\///' | sort -u > /tmp/branches.txt

# Display branches with numbers
BRANCHES=()
i=1
while IFS= read -r branch; do
    # Skip current branch indicator and clean up branch name
    clean_branch=$(echo "$branch" | sed 's/^[* ]*//' | sed 's/remotes\/origin\///')
    if [ ! -z "$clean_branch" ]; then
        BRANCHES+=("$clean_branch")
        if [ "$clean_branch" = "$CURRENT_BRANCH" ]; then
            echo -e "$i) $clean_branch ${GREEN}(current)${NC}"
        else
            echo "$i) $clean_branch"
        fi
        ((i++))
    fi
done < /tmp/branches.txt

# Add option to create new branch
echo "$i) Create new branch"
BRANCHES+=("NEW_BRANCH")

# Prompt for branch selection
echo ""
read -p "Select target branch (1-$i): " BRANCH_CHOICE

# Validate input
if ! [[ "$BRANCH_CHOICE" =~ ^[0-9]+$ ]] || [ "$BRANCH_CHOICE" -lt 1 ] || [ "$BRANCH_CHOICE" -gt $i ]; then
    echo -e "${RED}Invalid selection${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# Handle branch selection
SELECTED_INDEX=$((BRANCH_CHOICE - 1))

if [ "${BRANCHES[$SELECTED_INDEX]}" = "NEW_BRANCH" ]; then
    read -p "Enter new branch name: " NEW_BRANCH_NAME
    
    # Validate branch name
    if ! [[ "$NEW_BRANCH_NAME" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
        echo -e "${RED}Invalid branch name. Use only letters, numbers, /, _, and -${NC}" | tee -a "$LOG_FILE"
        exit 1
    fi
    
    print_info "Creating new branch: $NEW_BRANCH_NAME"
    git checkout -b "$NEW_BRANCH_NAME" 2>&1 | tee -a "$LOG_FILE" || {
        echo -e "${RED}Failed to create branch: $NEW_BRANCH_NAME${NC}" | tee -a "$LOG_FILE"
        exit 1
    }
    TARGET_BRANCH="$NEW_BRANCH_NAME"
    log "Created new branch: $NEW_BRANCH_NAME"
else
    TARGET_BRANCH="${BRANCHES[$SELECTED_INDEX]}"
    
    # Switch to target branch if different from current
    if [ "$TARGET_BRANCH" != "$CURRENT_BRANCH" ]; then
        print_info "Switching to branch: $TARGET_BRANCH"
        git checkout "$TARGET_BRANCH" 2>&1 | tee -a "$LOG_FILE" || {
            echo -e "${RED}Failed to checkout branch: $TARGET_BRANCH${NC}" | tee -a "$LOG_FILE"
            exit 1
        }
        log "Switched to branch: $TARGET_BRANCH"
    fi
fi

# Stage changes
if [ $UNSTAGED_CHANGES -gt 0 ] || [ $UNTRACKED_FILES -gt 0 ]; then
    echo -e "\n${BLUE}Staging changes...${NC}"
    
    # Show what will be staged
    echo "Files to be staged:"
    git status --porcelain | while read -r line; do
        echo "  $line"
    done | tee -a "$LOG_FILE"
    
    # Confirm staging
    read -p "Stage all changes? (y/N): " CONFIRM_STAGE
    if [[ "$CONFIRM_STAGE" =~ ^[Yy]$ ]]; then
        git add . 2>&1 | tee -a "$LOG_FILE"
        print_success "Changes staged"
        log "All changes staged successfully"
    else
        echo -e "${YELLOW}Staging cancelled${NC}" | tee -a "$LOG_FILE"
        exit 0
    fi
fi

# Get list of changed files for summary
FILES_CHANGED=$(git diff --cached --name-only | tr '\n' ', ' | sed 's/,$//')

# Prompt for commit message
echo -e "\n${BLUE}Preparing commit...${NC}"
read -p "Enter commit message (or press Enter for auto-generated): " COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
    # Generate automatic commit message based on changes
    COMMIT_MESSAGE="Auto-commit: Update $(echo "$FILES_CHANGED" | tr ',' '\n' | wc -l) file(s)

Files changed:
$(echo "$FILES_CHANGED" | tr ',' '\n' | sed 's/^/- /')

🤖 Generated with Claude Code Git Sync Script
$(date '+%Y-%m-%d %H:%M:%S')"
fi

log "Commit message prepared: ${COMMIT_MESSAGE:0:100}..."

# Create commit
echo -e "\n${BLUE}Creating commit...${NC}"
git commit -m "$COMMIT_MESSAGE" 2>&1 | tee -a "$LOG_FILE" || {
    echo -e "${RED}Failed to create commit${NC}" | tee -a "$LOG_FILE"
    exit 1
}

COMMIT_HASH=$(git rev-parse --short HEAD)
print_success "Commit created: $COMMIT_HASH"
log "Commit created successfully: $COMMIT_HASH"

# Push to remote
echo -e "\n${BLUE}Pushing to remote...${NC}"
print_info "Pushing branch '$TARGET_BRANCH' to origin"

# Check if remote branch exists
if git ls-remote --heads origin "$TARGET_BRANCH" | grep -q "$TARGET_BRANCH"; then
    # Branch exists, normal push
    git push origin "$TARGET_BRANCH" 2>&1 | tee -a "$LOG_FILE" || {
        echo -e "${RED}Failed to push to remote${NC}" | tee -a "$LOG_FILE"
        exit 1
    }
else
    # New branch, push with upstream
    git push -u origin "$TARGET_BRANCH" 2>&1 | tee -a "$LOG_FILE" || {
        echo -e "${RED}Failed to push new branch to remote${NC}" | tee -a "$LOG_FILE"
        exit 1
    }
fi

print_success "Successfully pushed to origin/$TARGET_BRANCH"
log "Push completed successfully"

# Final status check
echo -e "\n${BLUE}Final repository status:${NC}"
git status --short | tee -a "$LOG_FILE"

print_success "Git sync completed successfully!"
generate_summary "SUCCESS"

# Clean up
rm -f /tmp/branches.txt

echo -e "\n${GREEN}📋 Summary log saved to: $LOG_FILE${NC}"