var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// tina/r2-media-store.ts
var r2_media_store_exports = {};
__export(r2_media_store_exports, {
  R2MediaStore: () => R2MediaStore
});
async function request(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? "Media request failed.");
  }
  return response.json();
}
var R2MediaStore;
var init_r2_media_store = __esm({
  "tina/r2-media-store.ts"() {
    "use strict";
    R2MediaStore = class {
      accept = "image/*,application/pdf";
      maxSize = 100 * 1024 * 1024;
      async persist(files) {
        return Promise.all(files.map(async ({ directory, file }) => {
          const upload = await request("/api/admin/media/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ directory, filename: file.name, contentType: file.type })
          });
          const uploaded = await fetch(upload.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file
          });
          if (!uploaded.ok) throw new Error(`Upload failed for ${file.name}.`);
          return { type: "file", id: upload.key, filename: file.name, directory, src: upload.url };
        }));
      }
      async list(options = {}) {
        const params = new URLSearchParams();
        if (options.directory) params.set("directory", options.directory);
        if (options.offset) params.set("offset", String(options.offset));
        if (options.limit) params.set("limit", String(options.limit));
        if (options.filesOnly) params.set("filesOnly", "true");
        return request(`/api/admin/media/list?${params}`);
      }
      async delete(media) {
        await request("/api/admin/media/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: media.id })
        });
      }
      parse(media) {
        return media.src ?? "";
      }
    };
  }
});

// tina/config.ts
import { defineConfig } from "tinacms";
var text = (name, label = name) => ({ type: "string", name, label });
var search = process.env.TINA_SEARCH_TOKEN ? { tina: { indexerToken: process.env.TINA_SEARCH_TOKEN, stopwordLanguages: ["eng"] } } : void 0;
var config_default = defineConfig({
  branch: process.env.VERCEL_GIT_COMMIT_REF || "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  search,
  media: { loadCustomStore: async () => (await Promise.resolve().then(() => (init_r2_media_store(), r2_media_store_exports))).R2MediaStore },
  schema: { collections: [
    { name: "products", label: "Products", path: "src/content/products", format: "md", defaultItem: () => {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      return { launchDate: now, updatedDate: now, featured: false, specs: [] };
    }, fields: [text("name"), text("category"), text("status"), { type: "datetime", name: "launchDate", label: "Launch date" }, { type: "datetime", name: "updatedDate", label: "Updated date" }, { type: "boolean", name: "featured", label: "Featured" }, { type: "image", name: "image", label: "Main image" }, { type: "string", name: "description", label: "Description", ui: { component: "textarea" } }, { type: "object", name: "specs", label: "Specifications", list: true, ui: { defaultItem: { label: "Specification", value: "To be confirmed" } }, fields: [text("label", "Label"), text("value", "Value")] }, { type: "string", name: "customization", label: "Customization", ui: { component: "textarea" } }, { type: "rich-text", name: "body", label: "Body", isBody: true }] },
    { name: "articles", label: "Knowledge Articles", path: "src/content/articles", format: "md", fields: [text("title"), text("category"), { type: "datetime", name: "date", label: "Publish date" }, text("readTime", "Read time"), { type: "image", name: "image", label: "Cover image" }, { type: "string", name: "excerpt", label: "Excerpt", ui: { component: "textarea" } }, { type: "string", name: "keywords", label: "Keywords", list: true }, text("seoTitle", "SEO title"), { type: "string", name: "seoDescription", label: "SEO description", ui: { component: "textarea" } }, { type: "rich-text", name: "body", label: "Body", isBody: true }] },
    { name: "pages", label: "Service Pages", path: "src/content/pages", format: "md", fields: [text("eyebrow"), text("title"), { type: "string", name: "description", label: "Description", ui: { component: "textarea" } }, { type: "object", name: "features", label: "Capabilities", list: true, fields: [text("title"), { type: "string", name: "description", label: "Description", ui: { component: "textarea" } }] }, { type: "rich-text", name: "body", label: "Body", isBody: true }] }
  ] }
});
export {
  config_default as default
};
