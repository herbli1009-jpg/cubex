import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const manifestIndex = process.argv.indexOf('--manifest');
const mapIndex = process.argv.indexOf('--map');
const manifestPath = manifestIndex >= 0 ? process.argv[manifestIndex + 1] : 'tina-media-assets.json';
const mapPath = mapIndex >= 0 ? process.argv[mapIndex + 1] : 'tina-media-migration-map.json';
const apply = args.has('--apply');

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'PUBLIC_MEDIA_URL'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

const rawManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const urls = Array.isArray(rawManifest) ? rawManifest : rawManifest.urls;
if (!Array.isArray(urls) || !urls.every((url) => typeof url === 'string')) {
  throw new Error('The manifest must be a JSON string array or an object with a urls array.');
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const publicUrl = process.env.PUBLIC_MEDIA_URL.replace(/\/$/, '');

const mappings = urls.map((source) => {
  const url = new URL(source);
  if (url.hostname !== 'assets.tina.io') throw new Error(`Only assets.tina.io URLs are supported: ${source}`);
  const originalName = decodeURIComponent(url.pathname.split('/').pop() || 'asset');
  const safeName = originalName.replace(/[^a-zA-Z0-9._ -]/g, '-').slice(0, 180) || 'asset';
  const key = `uploads/migrated/${crypto.randomUUID()}--${safeName}`;
  return { source, key, destination: `${publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}` };
});

await writeFile(mapPath, `${JSON.stringify(mappings, null, 2)}\n`);
console.log(`${apply ? 'Applying' : 'Dry run'}: ${mappings.length} asset(s). Mapping: ${mapPath}`);
if (!apply) {
  console.log('Review the mapping, then rerun with --apply to copy files and update content references.');
  process.exit(0);
}

for (const mapping of mappings) {
  const response = await fetch(mapping.source);
  if (!response.ok) throw new Error(`Could not download ${mapping.source}`);
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: mapping.key,
    Body: new Uint8Array(await response.arrayBuffer()),
    ContentType: response.headers.get('content-type') ?? undefined,
  }));
}

async function collectMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  }))).flat();
}

for (const file of await collectMarkdown('src/content')) {
  const contents = await readFile(file, 'utf8');
  const updated = mappings.reduce((value, mapping) => value.split(mapping.source).join(mapping.destination), contents);
  if (updated !== contents) await writeFile(file, updated);
}

console.log('Copied assets and updated matching Tina URLs in src/content.');
