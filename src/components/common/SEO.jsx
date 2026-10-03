import { useEffect } from "react";

/**
 * Dynamic SEO component that updates document title and meta description
 * dynamically on route changes.
 */
export default function SEO({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title.includes("Oomio") ? title : `${title} | Oomio Card Game`;
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", document.title);

      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute("content", document.title);
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      } else {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        metaDesc.content = description;
        document.head.appendChild(metaDesc);
      }

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);

      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", description);
    }

    // Trigger Google Analytics pageview tracking on SPA route changes
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-6TWPEPR21S", {
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }, [title, description]);

  return null;
}
