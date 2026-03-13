import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import https from "https";

const distDir = path.resolve("./dist-portable");
const standaloneDir = path.resolve("./.next/standalone");
const staticDir = path.resolve("./.next/static");
const publicDir = path.resolve("./public");

const nodeUrl = "https://nodejs.org/dist/v20.11.1/win-x64/node.exe";

console.log("🚀 Starting Portable Build Process...");

// 1. Run Next.js Build
try {
  console.log("📦 Running npm run build (this might take a minute)...");
  execSync("npm run build", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Build failed!", error);
  process.exit(1);
}

// 2. Prepare Dist Directory
if (fs.existsSync(distDir)) {
  console.log("🧹 Cleaning old dist-portable folder...");
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Copy Standalone Files
console.log("📂 Copying standalone Next.js server files...");
fs.cpSync(standaloneDir, distDir, { recursive: true });

// 4. Copy Static & Public Assets (Next.js requires these inside the standalone folder manually)
console.log("📂 Copying .next/static and /public assets...");
fs.cpSync(staticDir, path.join(distDir, ".next", "static"), { recursive: true });
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, path.join(distDir, "public"), { recursive: true });
}

// 5. Download Portable Node.js Executable
console.log("🌐 Downloading portable node.exe (v20.11.1)...");
const downloadNode = new Promise((resolve, reject) => {
  const file = fs.createWriteStream(path.join(distDir, "node.exe"));
  https.get(nodeUrl, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      resolve(true);
    });
  }).on("error", (err) => {
    fs.unlinkSync(path.join(distDir, "node.exe"));
    reject(err);
  });
});

await downloadNode;
console.log("✅ Verified node.exe downloaded.");

// 6. Create Start.bat Scripts
console.log("📝 Generating Start.bat launcher...");

const batContent = `@echo off
title Study Planner Server
echo ===================================================
echo     Starting Local Study Planner Server (Portable)
echo ===================================================
echo.
echo Please leave this window open while using the app.
echo You can safely close it when you are done.
echo.
echo Starting server on port 3000...
set NODE_ENV=production
set PORT=3000
set HOSTNAME=localhost

:: Give the server 3 seconds to boot before launching browser
start "" /B cmd /c "ping localhost -n 3 > nul && start http://localhost:3000"

.\\node.exe server.js
pause
`;

fs.writeFileSync(path.join(distDir, "Start Study Planner.bat"), batContent);

console.log("🎉 Portable Build Complete!");
console.log("👉 You can now zip the 'dist-portable' folder and send it to any Windows PC.");
console.log("👉 Users just need to double click 'Start Study Planner.bat' inside the folder.");
