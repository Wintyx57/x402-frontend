import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "x402 Bazaar";
const BASE_URL = "https://x402bazaar.org";
const DEFAULT_OG_IMAGE = "https://x402bazaar.org/og-image.png";

// Human-readable breadcrumb labels per route segment
const ROUTE_LABELS: Record<string, string> = {
  services: "API Catalog",
  pricing: "Pricing",
  "for-providers": "For API Providers",
  register: "List Your API",
  compare: "Compare",
  quickstart: "Quickstart",
  developers: "Developer Docs",
  integrate: "Integration Guide",
  mcp: "MCP Server",
  playground: "API Playground",
  demos: "Agent Demos",
  docs: "Documentation",
  about: "About",
  faq: "FAQ",
  blog: "Blog",
  status: "System Status",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
  /** Override og:type — default "website", use "article" for blog posts */
  ogType?: "website" | "article";
}

export default function useSEO({
  title,
  description,
  keywords,
  ogImage,
  noindex,
  ogType = "website",
}: SEOOptions = {}) {
  const { pathname } = useLocation();
  const fullTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : SITE_NAME;
  const url = `${BASE_URL}${pathname}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(
        `meta[${attr}="${key}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // Description — propagate to og + twitter.
    // If no description is provided, read the default from the static meta tag
    // so og:description is always consistent with the page description.
    const resolvedDescription =
      description ||
      (
        document.querySelector(
          'meta[name="description"]',
        ) as HTMLMetaElement | null
      )?.content ||
      "";

    if (resolvedDescription) {
      setMeta("name", "description", resolvedDescription);
      setMeta("property", "og:description", resolvedDescription);
      setMeta("name", "twitter:description", resolvedDescription);
    }

    // Keywords
    if (keywords) setMeta("name", "keywords", keywords);

    // Robots
    let robotsEl = document.querySelector(
      'meta[name="robots"]',
    ) as HTMLMetaElement | null;
    if (noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.setAttribute("name", "robots");
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute("content", "noindex, nofollow");
    } else if (robotsEl) {
      // Restore default from index.html when navigating away from noindex pages
      robotsEl.setAttribute(
        "content",
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      );
    }

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:locale", "en_US");

    // Twitter Card
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:image", image);
    // Use summary_large_image unless a custom per-page image is provided
    setMeta("name", "twitter:card", "summary_large_image");

    // Canonical — update if exists, create if not; track creation for cleanup
    let createdCanonical = false;
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("data-seo-hook", "true");
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    canonical.setAttribute("href", url);

    // BreadcrumbList JSON-LD
    // Build segments: skip empty strings from leading "/"
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      ...segments.map((seg, idx) => {
        const segPath = "/" + segments.slice(0, idx + 1).join("/");
        const segUrl = `${BASE_URL}${segPath}`;
        // Use human-readable label if available, else capitalise raw segment
        const label =
          ROUTE_LABELS[seg] ||
          (title && idx === segments.length - 1
            ? title.replace(` | ${SITE_NAME}`, "")
            : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
        return {
          "@type": "ListItem",
          position: idx + 2,
          name: label,
          item: segUrl,
        };
      }),
    ];

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    };

    let bcScript = document.getElementById(
      "breadcrumb-jsonld",
    ) as HTMLScriptElement | null;
    if (!bcScript) {
      bcScript = document.createElement("script");
      bcScript.id = "breadcrumb-jsonld";
      bcScript.type = "application/ld+json";
      bcScript.setAttribute("data-seo-hook", "true");
      document.head.appendChild(bcScript);
    }
    bcScript.textContent = JSON.stringify(breadcrumb);

    return () => {
      // Remove breadcrumb JSON-LD added by this hook instance
      const bc = document.getElementById("breadcrumb-jsonld");
      if (bc) bc.remove();
      // Remove canonical link only if this hook instance created it
      if (createdCanonical) {
        const c = document.querySelector(
          'link[data-seo-hook][rel="canonical"]',
        );
        if (c) c.remove();
      }
    };
  }, [
    fullTitle,
    description,
    keywords,
    ogImage,
    noindex,
    ogType,
    url,
    pathname,
    title,
    image,
  ]);
}
