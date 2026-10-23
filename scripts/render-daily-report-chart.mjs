import sharp from 'sharp';

try {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const svg = Buffer.concat(chunks);
  if (svg.length === 0) {
    throw new Error('SVG input is empty');
  }

  const png = await sharp(svg)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  process.stdout.write(png);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
