import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'x402 Bazaar';
const BASE_URL = 'https://x402bazaar.org';

export default function useSEO({ title, description }) {
    const { pathname } = useLocation();
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${BASE_URL}${pathname}`;

    useEffect(() => {
        document.title = fullTitle;

        const setMeta = (attr, key, value) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
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
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:url', url);
        setMeta('name', 'twitter:title', fullTitle);

        let canonical = document.querySelector('link[rel="canonical"]');
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
        let bcScript = document.getElementById('breadcrumb-jsonld');
        if (!bcScript) {
            bcScript = document.createElement('script');
            bcScript.id = 'breadcrumb-jsonld';
            bcScript.type = 'application/ld+json';
            document.head.appendChild(bcScript);
        }
        bcScript.textContent = JSON.stringify(breadcrumb);
    }, [fullTitle, description, url, pathname, title]);
}
