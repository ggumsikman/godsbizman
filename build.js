const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

const dist = path.join(__dirname, 'dist');
if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
fs.mkdirSync(dist);

// Copy static files
fs.copyFileSync('index.html', path.join(dist, 'index.html'));
fs.copyFileSync('style.css',  path.join(dist, 'style.css'));
fs.copyFileSync('main.js',    path.join(dist, 'main.js'));
if (fs.existsSync('assets')) copyDir('assets', path.join(dist, 'assets'));

// Generate config.js from Vercel environment variables
const config = `window.__ENV__ = {
  SUPABASE_URL:      "${process.env.SUPABASE_URL      || ''}",
  SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY || ''}",
  ADMIN_PW:          "${process.env.ADMIN_PW          || ''}"
};`;
fs.writeFileSync(path.join(dist, 'config.js'), config);

console.log('Build complete -> dist/');
