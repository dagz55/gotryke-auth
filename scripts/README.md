# Git Sync Script

A robust bash script for synchronizing changes to your GitHub repository with branch selection and comprehensive logging.

## Features

- 🌿 **Branch Selection**: Choose from existing branches or create a new one
- ⚡ **Error Handling**: Comprehensive error handling with detailed logging
- 📊 **Summary Reports**: Detailed execution summary with timing and file changes
- 🎨 **Colored Output**: User-friendly colored terminal output
- 📝 **Auto-Commit Messages**: Generate commit messages automatically if not provided
- 🔍 **Status Validation**: Pre-flight checks for repository status

## Usage

```bash
# Run from project root
./scripts/git-sync.sh
```

## What it does

1. **Repository Check**: Validates you're in a git repository
2. **Status Analysis**: Counts staged, unstaged, and untracked files
3. **Branch Selection**: Interactive menu to choose or create branch
4. **Change Staging**: Shows changes and confirms staging
5. **Commit Creation**: Creates commit with custom or auto-generated message
6. **Remote Push**: Pushes changes to origin with proper upstream setup
7. **Summary Generation**: Creates detailed log file with execution summary

## Example Output

```
🚀 Git Sync Script
===================
ℹ Found 3 file(s) with changes
ℹ Current branch: main

Available branches:
1) main (current)
2) feature/auth-fix
3) development
4) Create new branch

Select target branch (1-4): 1
✓ Changes staged
✓ Commit created: a1b2c3d
✓ Successfully pushed to origin/main

=== SYNC SUMMARY ===
Status: SUCCESS
Duration: 45s
Files changed: package.json, src/lib/auth.ts, CLAUDE.md
Commit hash: a1b2c3d
Target branch: main
```

## Log Files

Each execution creates a timestamped log file: `git-sync-YYYYMMDD-HHMMSS.log`

Log files contain:
- Execution timeline
- Git command outputs
- Error details (if any)
- Final summary

## Error Handling

The script includes robust error handling for:
- Invalid repository states
- Git command failures
- Network connectivity issues
- Permission problems
- Invalid branch names

All errors are logged with line numbers and exit codes for debugging.