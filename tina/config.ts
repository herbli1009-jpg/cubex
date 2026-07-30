import { defineConfig } from 'tinacms';

const text = (name: string, label = name) => ({ type: 'string' as const, name, label });
const search = process.env.TINA_SEARCH_TOKEN
  ? { tina: { indexerToken: process.env.TINA_SEARCH_TOKEN, stopwordLanguages: ['eng'] } }
  : undefined;

export default defineConfig({
  branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
  clientId: process.env.TINA_CLIENT_ID || '', token: process.env.TINA_TOKEN || '',
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: {
    loadCustomStore: async () => {
      const { TinaCloudOriginalMediaStore } = await import('./tina-cloud-original-media-store');
      return TinaCloudOriginalMediaStore;
    },
  },
  search,
  schema: { collections: [
    { name: 'products', label: 'Products', path: 'src/content/products', format: 'md', defaultItem:()=>{const now=new Date().toISOString();return {launchDate:now,updatedDate:now,featured:false,specs:[]};}, fields: [text('name'), text('status'), { type:'datetime', name:'launchDate', label:'Launch date' }, { type:'datetime', name:'updatedDate', label:'Updated date' }, { type:'boolean', name:'featured', label:'Featured' }, { type:'image', name:'image', label:'Main image' }, { type:'string', name:'description', label:'Description', ui:{component:'textarea'} }, { type:'object', name:'specs', label:'Specifications', list:true, ui:{defaultItem:{label:'Specification',value:'To be confirmed'}}, fields:[text('label','Label'),text('value','Value')] }, { type:'string', name:'customization', label:'Customization', ui:{component:'textarea'} }, { type:'rich-text', name:'body', label:'Body', isBody:true }] },
    { name: 'articles', label: 'Knowledge Articles', path: 'src/content/articles', format: 'md', fields: [text('title'), { type:'datetime', name:'date', label:'Publish date' }, text('readTime','Read time'), { type:'image', name:'image', label:'Cover image' }, { type:'string', name:'excerpt', label:'Excerpt', ui:{component:'textarea'} }, { type:'string', name:'keywords', label:'Keywords', list:true }, text('seoTitle','SEO title'), { type:'string', name:'seoDescription', label:'SEO description', ui:{component:'textarea'} }, { type:'rich-text', name:'body', label:'Body', isBody:true }] },
    { name: 'pages', label: 'Service Pages', path: 'src/content/pages', format: 'md', fields: [text('eyebrow'), text('title'), { type:'string', name:'description', label:'Description', ui:{component:'textarea'} }, { type:'object', name:'features', label:'Capabilities', list:true, fields:[text('title'),{type:'string',name:'description',label:'Description',ui:{component:'textarea'}}] }, { type:'rich-text', name:'body', label:'Body', isBody:true }] },
  ] },
});
