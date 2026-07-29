import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MEDIA_PREFIX = 'uploads/';
const FILE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/;

export type R2MediaConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

export function getR2MediaConfig(env: Record<string, string | undefined>): R2MediaConfig {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET;
  const publicUrl = env.PUBLIC_MEDIA_URL?.replace(/\/$/, '');

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error('R2 media is not configured.');
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

export function createR2Client(config: R2MediaConfig) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
}

export function normalizeDirectory(directory = ''): string {
  const normalized = directory.replace(/^\/+|\/+$/g, '');
  if (!normalized) return '';
  if (normalized.split('/').some((part) => !FILE_NAME.test(part))) {
    throw new Error('Invalid directory.');
  }
  return normalized;
}

export function normalizeFileName(filename: string): string {
  const name = filename.split('/').pop() ?? '';
  if (!FILE_NAME.test(name) || name.length > 180) throw new Error('Invalid file name.');
  return name;
}

export function assertMediaKey(key: string): string {
  if (!key.startsWith(MEDIA_PREFIX) || key.includes('..') || key.length > 500) {
    throw new Error('Invalid media key.');
  }
  return key;
}

export function mediaPrefix(directory = ''): string {
  const normalized = normalizeDirectory(directory);
  return `${MEDIA_PREFIX}${normalized ? `${normalized}/` : ''}`;
}

export function displayFileName(key: string): string {
  const filename = key.split('/').pop() ?? key;
  return filename.replace(/^[0-9a-f-]{36}--/, '');
}

export function publicMediaUrl(config: R2MediaConfig, key: string): string {
  return `${config.publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function createUpload(config: R2MediaConfig, input: {
  directory?: string;
  filename: string;
  contentType: string;
}) {
  const directory = normalizeDirectory(input.directory);
  const filename = normalizeFileName(input.filename);
  if (!/^(image\/[a-zA-Z0-9.+-]+|application\/pdf)$/.test(input.contentType)) {
    throw new Error('Unsupported file type.');
  }

  const key = `${mediaPrefix(directory)}${crypto.randomUUID()}--${filename}`;
  const client = createR2Client(config);
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: config.bucket, Key: key, ContentType: input.contentType }),
    { expiresIn: 300 },
  );
  return { key, uploadUrl, url: publicMediaUrl(config, key) };
}

export async function listMedia(config: R2MediaConfig, input: {
  directory?: string;
  offset?: string;
  limit?: number;
}) {
  const directory = normalizeDirectory(input.directory);
  const response = await createR2Client(config).send(new ListObjectsV2Command({
    Bucket: config.bucket,
    Prefix: mediaPrefix(directory),
    Delimiter: '/',
    ContinuationToken: input.offset,
    MaxKeys: Math.min(Math.max(input.limit ?? 20, 1), 100),
  }));

  const folders = (response.CommonPrefixes ?? []).flatMap(({ Prefix }) => {
    if (!Prefix) return [];
    const name = Prefix.slice(mediaPrefix(directory).length).replace(/\/$/, '');
    return name ? [{ type: 'dir' as const, id: Prefix, filename: name, directory }] : [];
  });
  const files = (response.Contents ?? []).flatMap(({ Key, Size }) => {
    if (!Key || Key.endsWith('/') || Size === 0) return [];
    return [{
      type: 'file' as const,
      id: Key,
      filename: displayFileName(Key),
      directory,
      src: publicMediaUrl(config, Key),
    }];
  });

  return { items: [...folders, ...files], nextOffset: response.NextContinuationToken };
}

export async function createFolder(config: R2MediaConfig, directory: string, name: string) {
  const parent = normalizeDirectory(directory);
  const folder = normalizeFileName(name);
  const key = `${mediaPrefix(parent)}${folder}/`;
  await createR2Client(config).send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: '' }));
  return { type: 'dir' as const, id: key, filename: folder, directory: parent };
}

export async function deleteMedia(config: R2MediaConfig, key: string) {
  await createR2Client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: assertMediaKey(key) }));
}
