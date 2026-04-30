const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

function copyFile(name) {
  const from = path.join(root, name);
  const to = path.join(dist, name);
  if (fs.existsSync(from)) fs.copyFileSync(from, to);
}

function copyDir(name) {
  const from = path.join(root, name);
  const to = path.join(dist, name);
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

fs.mkdirSync(dist, { recursive: true });
copyFile("game.js");
copyFile("manifest.json");
copyDir("assets");
