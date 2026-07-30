import type { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from 'tinacms';

type MediaResponse = { items: Media[]; nextOffset?: string };
type UploadResponse = { key: string; uploadUrl: string; url: string };
const thumbnailSizes = ['75x75', '400x400', '1000x1000'];

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? 'Media request failed.');
  }
  return response.json() as Promise<T>;
}

export class R2MediaStore implements MediaStore {
  accept = 'image/*,application/pdf';
  maxSize = 100 * 1024 * 1024;

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    return Promise.all(files.map(async ({ directory, file }) => {
      const upload = await request<UploadResponse>('/api/admin/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory, filename: file.name, contentType: file.type }),
      });
      const uploaded = await fetch(upload.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploaded.ok) throw new Error(`Upload failed for ${file.name}.`);
      return { type: 'file', id: upload.key, filename: file.name, directory, src: upload.url };
    }));
  }

  async list(options: MediaListOptions = {}): Promise<MediaList> {
    const params = new URLSearchParams();
    if (options.directory) params.set('directory', options.directory);
    if (options.offset) params.set('offset', String(options.offset));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.filesOnly) params.set('filesOnly', 'true');
    const response = await request<MediaResponse>(`/api/admin/media/list?${params}`);
    return {
      ...response,
      items: response.items.map((media) => {
        const src = media.src;
        return media.type === 'file' && src
          ? { ...media, thumbnails: Object.fromEntries(thumbnailSizes.map((size) => [size, src])) as Record<string, string> }
          : media;
      }),
    };
  }

  async delete(media: Media): Promise<void> {
    await request('/api/admin/media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: media.id }),
    });
  }

  parse(media: Media): string {
    return media.src ?? '';
  }
}
