import type { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from 'tinacms';
import { TinaMediaStore } from 'tinacms';

export class TinaCloudOriginalMediaStore implements MediaStore {
  accept: string;
  maxSize: number;
  private store: TinaMediaStore;

  constructor(api: unknown) {
    this.store = new TinaMediaStore({ api: { tina: api } } as never);
    this.accept = Array.isArray(this.store.accept) ? this.store.accept.join(',') : this.store.accept;
    this.maxSize = this.store.maxSize;
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    return this.store.persist(files);
  }

  async list(options: MediaListOptions = {}): Promise<MediaList> {
    const result = await this.store.list(options);
    return {
      ...result,
      items: result.items.map((media) => {
        const src = media.src;
        return media.type === 'file' && src
          ? { ...media, thumbnails: Object.fromEntries(Object.keys(media.thumbnails ?? {}).map((size) => [size, src])) as Record<string, string> }
          : media;
      }),
    };
  }

  async delete(media: Media): Promise<void> {
    await this.store.delete(media);
  }

  parse(media: Media): string {
    return this.store.parse(media);
  }
}
