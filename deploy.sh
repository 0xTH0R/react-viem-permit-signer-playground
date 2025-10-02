#!/bin/bash

# Build the project
npm run build

# Navigate to the build output directory
cd dist

# Initialize git if not already initialized
if [ ! -d .git ]; then
  git init
  git checkout -b gh-pages
fi

# Add all files
git add -A

# Commit
git commit -m 'Deploy to GitHub Pages'

# Push to gh-pages branch
git push -f git@github.com:0xTH0R/react-viem-permit-signer-playground.git gh-pages

cd ..
echo "Deployment complete!"
