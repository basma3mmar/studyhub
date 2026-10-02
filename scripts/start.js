const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = process.cwd();
const localDbPath = path.join(projectRoot, "studyhub.db");
const railwayDataDir = "/data";
const railwayDbPath = path.join(railwayDataDir, "studyhub.db");

function setupRailwayDatabase() {
  // Local development: don't change anything.
  if (!fs.existsSync(railwayDataDir)) {
    return;
  }

  fs.mkdirSync(railwayDataDir, { recursive: true });

  // If the database already exists in the project root
  // and the persistent database doesn't exist yet,
  // copy it to the Railway Volume.
  if (
    fs.existsSync(localDbPath) &&
    !fs.existsSync(railwayDbPath)
  ) {
    fs.copyFileSync(localDbPath, railwayDbPath);
  }

  // If the root database is already a symlink, we're done.
  if (fs.existsSync(localDbPath)) {
    const stats = fs.lstatSync(localDbPath);

    if (stats.isSymbolicLink()) {
      return;
    }

    fs.unlinkSync(localDbPath);
  }

  // Make all existing API routes that use
  // "studyhub.db" automatically use /data/studyhub.db.
  fs.symlinkSync(
    railwayDbPath,
    localDbPath,
    "file"
  );
}

setupRailwayDatabase();

const nextProcess = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "start"],
  {
    stdio: "inherit",
    shell: false,
    env: process.env,
  }
);

nextProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

nextProcess.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});