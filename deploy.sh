#!/bin/bash

# ask for commit message
echo "Enter commit message:"
read message

# check if empty
if [ -z "$message" ]; then
  echo "❌ Commit message cannot be empty"
  exit 1
fi

# show files status
echo ""
git status
echo ""

# confirm push
echo "Do you want to commit and push? (y/n)"
read confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
  git add .

  echo ""
  echo "📦 Files and folders staged successfully."
  git status

  echo ""
  echo "📝 Committing changes..."
  git commit -m "$message"

  echo ""
  echo "🚀 Pushing code to remote repository..."
  git push

  echo ""
  echo "✅ Code pushed successfully. Keep building 💪"
  echo ""

else
  echo "❌ Commit cancelled"
fi