export const site = {
  name: 'CUBEX',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://cubex-fitness.com',
  email: 'hello@cubexfitness.com',
  description: 'Fitness equipment engineering, manufacturing, quality control and China sourcing services.',
};

export const navigation = [
  ['Products', '/products'], ['New', '/new'], ['Engineering', '/engineering'], ['Quality', '/quality'],
  ['China Sourcing', '/sourcing'], ['Knowledge', '/knowledge'], ['Resources', '/resources'],
  ['Questionnaire', '/questionnaire'], ['Contact', '/contact'],
] as const;

export const resources = [
  ['Catalog', 'Product Catalog', 'Overview of current CUBEX product categories and capabilities.', 'Request Catalog'],
  ['Engineering', 'CAD & Drawings', 'Selected 2D drawings and 3D files for qualified projects.', 'Request Files'],
  ['Assembly', 'Assembly Manuals', 'Installation, assembly and service documentation.', 'Request Manual'],
  ['Quality', 'Inspection Standards', 'Example quality standards, checkpoints and report formats.', 'Request Standard'],
  ['Compliance', 'Certificates', 'Available test reports and supplier compliance documents.', 'Request Documents'],
  ['Support', 'FAQ', 'Answers covering MOQ, customization, samples, lead time and sourcing services.', 'Ask A Question'],
] as const;
