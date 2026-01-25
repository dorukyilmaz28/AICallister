export const dynamic = 'force-static';

export default async function sitemap() {
  const baseUrl = 'https://callisterai.com';
  const routes = [
    '',
    '/chat',
    '/code-snippets',
    '/teams',
    '/discover-teams',
    '/profile',
    '/privacy',
    '/delete-account',
    '/yagsl',
  ];
  const now = new Date().toISOString();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

