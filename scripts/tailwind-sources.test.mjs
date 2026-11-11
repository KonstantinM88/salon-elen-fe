import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const stylesheet = path.join(sourceRoot, 'app', 'globals.css');

test('Tailwind scans live sources, not deployment backups or generated files', async () => {
  const compiler = await compile(await readFile(stylesheet, 'utf8'), {
    base: path.dirname(stylesheet),
    from: stylesheet,
    onDependency() {},
  });

  // A root-wide scan would also read .next.previous-* during production builds.
  assert.ok(compiler.root && compiler.root !== 'none');
  assert.equal(path.resolve(compiler.root.base, compiler.root.pattern), sourceRoot);

  const scanner = new Scanner({
    sources: [{ ...compiler.root, negated: false }, ...compiler.sources],
  });
  const candidates = scanner.scan();
  assert.ok(scanner.files.length > 0);
  for (const file of scanner.files) {
    const relative = path.relative(sourceRoot, file);
    assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), file);
    assert.doesNotMatch(relative.replaceAll('\\', '/'), /^(?:generated\/)|\.(?:bak|backup)$/);
  }

  const safeArea = 'pb-[calc(env(safe-area-inset-bottom)+16px)]';
  assert.ok(candidates.includes(safeArea), 'real mobile safe-area utility is retained');
  const css = compiler.build(candidates);
  assert.match(css, /padding-bottom:\s*calc\(env\(safe-area-inset-bottom\)\s*\+\s*16px\)/);
  assert.match(css, /\.lg\\:flex/);
});
