import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

const origins = (process.env.MEDIA_UPLOAD_ORIGINS ?? 'https://cubex-fitness.com,http://localhost:4321')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

await client.send(new PutBucketCorsCommand({
  Bucket: process.env.R2_BUCKET,
  CORSConfiguration: {
    CORSRules: [{
      AllowedOrigins: origins,
      AllowedMethods: ['PUT'],
      AllowedHeaders: ['Content-Type'],
      MaxAgeSeconds: 3600,
    }],
  },
}));

console.log(`Configured R2 upload CORS for: ${origins.join(', ')}`);
