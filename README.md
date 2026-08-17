# Git & GitHub Complete Beginner Guide

## 1. Install and Configure Git (One-Time Setup)

Check Git version:

```bash
git --version
```

Set your username:

```bash
git config --global user.name "Your Name"
```

Set your email:

```bash
git config --global user.email "your@email.com"
```

Verify configuration:

```bash
git config --list
```

---

## 2. Create a New Project and Initialize Git

Create a project folder:

```bash
mkdir my-project
cd my-project
```

Initialize Git:

```bash
git init
```

Check repository status:

```bash
git status
```

---

## 3. Connect Local Repository to GitHub

Create a repository on GitHub and copy its URL.

Add remote repository:

```bash
git remote add origin https://github.com/username/repository-name.git
```

Verify remote:

```bash
git remote -v
```

---

## 4. Add and Commit Files

Check modified files:

```bash
git status
```

Add all files:

```bash
git add .
```

Add a specific file:

```bash
git add README.md
```

Commit changes:

```bash
git commit -m "Initial commit"
```

---

## 5. Push Code to GitHub

Rename current branch to main:

```bash
git branch -M main
```

Push for the first time:

```bash
git push -u origin main
```

Future pushes:

```bash
git push
```

---

## 6. Clone an Existing Repository

Clone repository:

```bash
git clone https://github.com/username/repository.git
```

Move into project directory:

```bash
cd repository
```

---

## 7. Pull Latest Changes

Download and merge updates:

```bash
git pull origin main
```

Or simply:

```bash
git pull
```

---

## 8. Daily Development Workflow

Pull latest code:

```bash
git pull
```

Make your code changes.

Check status:

```bash
git status
```

Stage files:

```bash
git add .
```

Commit changes:

```bash
git commit -m "Implemented new feature"
```

Push updates:

```bash
git push
```

---

## 9. Working with Branches

Create a branch:

```bash
git branch feature-auth
```

Create and switch:

```bash
git checkout -b feature-auth
```

Or:

```bash
git switch -c feature-auth
```

View branches:

```bash
git branch
```

Switch branch:

```bash
git checkout main
```

Or:

```bash
git switch main
```

---

## 10. Merge Branches

Switch to main:

```bash
git checkout main
```

Merge feature branch:

```bash
git merge feature-auth
```

Push merged code:

```bash
git push
```

Delete local branch:

```bash
git branch -d feature-auth
```

Delete remote branch:

```bash
git push origin --delete feature-auth
```

---

## 11. View Commit History

Show all commits:

```bash
git log
```

Compact version:

```bash
git log --oneline
```

---

## 12. Remote Repository Commands

View remotes:

```bash
git remote -v
```

Remove remote:

```bash
git remote remove origin
```

Change remote URL:

```bash
git remote set-url origin https://github.com/username/new-repo.git
```

---

## 13. Undo Changes

Undo last commit but keep changes:

```bash
git reset --soft HEAD~1
```

Unstage all files:

```bash
git restore --staged .
```

Discard changes in a file:

```bash
git restore filename
```

Discard all uncommitted changes:

```bash
git restore .
```

---

## 14. Fetch Changes Without Merging

Download remote changes:

```bash
git fetch
```

Check status:

```bash
git status
```

---

## 15. Create a .gitignore File

Create file:

```bash
touch .gitignore
```

Example:

```gitignore
node_modules/
.env
dist/
build/
*.log
```

---

## 16. Resolve Merge Conflicts

Check conflict status:

```bash
git status
```

Edit conflicting files manually.

After resolving:

```bash
git add .
git commit -m "Resolved merge conflict"
git push
```

---

## 17. Complete GitHub Workflow

### New Project

```bash
mkdir project-name
cd project-name
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Existing Project

```bash
git clone <repository-url>
cd project-name
git pull
```

### Daily Work

```bash
git pull
git add .
git commit -m "Describe changes"
git push
```

### Feature Development

```bash
git checkout -b feature-name
# Make changes
git add .
git commit -m "Implemented feature"
git push origin feature-name
```

### Merge Feature into Main

```bash
git checkout main
git pull
git merge feature-name
git push
```

---

## Git Cheat Sheet

```bash
git init
git clone <repo-url>
git status
git add .
git commit -m "message"
git push
git pull
git fetch
git branch
git checkout -b branch-name
git switch branch-name
git merge branch-name
git log --oneline
git remote -v
git restore .
git restore --staged .
git branch -d branch-name
```
