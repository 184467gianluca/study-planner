$target = "..\StudyPlanner_Portable"
New-Item -ItemType Directory -Force -Path $target

# Copy standalone output
Copy-Item -Path ".next\standalone\*" -Destination $target -Recurse -Force

# Copy public folder for static assets (images, icons)
Copy-Item -Path "public" -Destination $target -Recurse -Force

# Copy .next/static folder for built CSS/JS chunks
New-Item -ItemType Directory -Force -Path "$target\.next"
Copy-Item -Path ".next\static" -Destination "$target\.next" -Recurse -Force

# Download officially signed node.exe (LTS version 20.x)
echo "Downloading Official Node.js Portable binary..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.18.0/win-x64/node.exe" -OutFile "$target\node.exe"

echo "Portable Build Assembled at $target"
