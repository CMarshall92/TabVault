const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const outDir = path.join(__dirname, '../out');

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 10);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Rename _next to next in content
  // We do this for both HTML and JS files to cover chunks loading chunks
  if (content.includes('/_next/')) {
    content = content.replace(/\/_next\//g, '/next/');
    changed = true;
  }

  // 2. Extract inline scripts (HTML only)
  if (filePath.endsWith('.html')) {
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gmi;
    
    // We need to run replace and update content
    const originalContent = content;
    content = content.replace(scriptRegex, (match, scriptContent) => {
      const openTag = match.substring(0, match.indexOf('>') + 1);
      
      // Skip if src attribute exists
      if (openTag.includes('src=')) return match;
      
      // Skip non-executable scripts (json data)
      if (openTag.includes('type="application/json"') || 
          openTag.includes("type='application/json'") ||
          openTag.includes('type="application/ld+json"')) {
        return match;
      }

      // It's an executable inline script. Extract it.
      const combinedHash = hashContent(scriptContent);
      const scriptFilename = `script-${combinedHash}.js`;
      // Save next to the html file
      const scriptPath = path.join(path.dirname(filePath), scriptFilename);
      
      fs.writeFileSync(scriptPath, scriptContent);
      console.log(`Extracted inline script to ${scriptFilename}`);
      
      // Return new script tag
      // We assume it's a module or standard script based on content? 
      // Next.js usually emits standard scripts for these inline bits or specifically handles them.
      // Safest is to copy the type if present, or default.
      // Usually Next.js inline scripts are just code.
      return `<script src="./${scriptFilename}"></script>`;
    });

    if (content !== originalContent) changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting extension post-build script...');

// 1. Rename _next folder to next
const nextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next');

if (fs.existsSync(nextDir)) {
    console.log('Renaming _next to next...');
    if (fs.existsSync(newNextDir)) {
        fs.rmSync(newNextDir, { recursive: true, force: true });
    }
    fs.renameSync(nextDir, newNextDir);
}

// 2. Process all files
processDirectory(outDir);

// 3. Cleanup files starting with _ (Chrome forbids these)
const rootItems = fs.readdirSync(outDir);
for (const item of rootItems) {
  if (item.startsWith('_')) {
    console.log(`Removing restricted file/directory: ${item}`);
    fs.rmSync(path.join(outDir, item), { recursive: true, force: true });
  }
}

console.log('Build processing complete.');
