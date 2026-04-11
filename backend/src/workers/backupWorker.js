const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

process.on('message', ({ filename, destination, zipPath }) => {
  
  // Check karo source exist karta hai
  if (!fs.existsSync(destination)) {
    process.send({ success: false, error: 'Source path not found' });
    return;
  }

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    process.send({ success: true });
  });

  archive.on('error', (err) => {
    process.send({ success: false, error: err.message });
  });

  archive.pipe(output);

  const stats = fs.statSync(destination);

  if (stats.isDirectory()) {
    // Directory hai toh poora folder zip karo
    archive.directory(destination, false);
  } else {
    // Single file hai toh sirf woh file zip karo
    archive.file(destination, { name: path.basename(destination) });
  }

  archive.finalize();
});
