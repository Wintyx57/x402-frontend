import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'x402 Bazaar';
const BASE_URL = 'https://x402bazaar.org';
const DEFAULT_OG_IMAGE = 'https://x402bazaar.org/og-image.png';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
}

export default function useSEO({ title, description, keywords, ogImage, noindex }: SEOOptions = {}) {
    const { pathname } = useLocation();
    const fullTitle = title
        ? (title.includes('x402 Bazaar') ? title : `${title} | ${SITE_NAME}`)
        : SITE_NAME;
    const url = `${BASE_URL}${pathname}`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    useEffect(() => {
        document.title = fullTitle;

        const setMeta = (attr: string, key: string, value: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', value);
        };

        if (description) {
            setMeta('name', 'description', description);
            setMeta('property', 'og:description', description);
            setMeta('name', 'twitter:description', description);
        }
        if (keywords) setMeta('name', 'keywords', keywords);

        // noindex for private/thin pages
        let robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
        if (noindex) {
            if (!robotsEl) {
                robotsEl = document.createElement('meta');
                robotsEl.setAttribute('name', 'robots');
                document.head.appendChild(robotsEl);
            }
            robotsEl.setAttribute('content', 'noindex, nofollow');
        } else if (robotsEl) {
            robotsEl.remove();
        }

        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', image);
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:image', image);

        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);

        // BreadcrumbList JSON-LD
        const breadcrumb = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
                ...(pathname !== '/' ? [{ '@type': 'ListItem', position: 2, name: title || pathname.slice(1), item: url }] : [])
            ]
        };
        let bcScript = document.getElementById('breadcrumb-jsonld') as HTMLScriptElement | null;
        if (!bcScript) {
            bcScript = document.createElement('script');
            bcScript.id = 'breadcrumb-jsonld';
            bcScript.type = 'application/ld+json';
            document.head.appendChild(bcScript);
        }
        bcScript.textContent = JSON.stringify(breadcrumb);
    }, [fullTitle, description, keywords, ogImage, noindex, url, pathname, title, image]);
}
