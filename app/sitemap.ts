import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://topendvisuals.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/bookings', '/portfolio', '/about', '/contact'];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
