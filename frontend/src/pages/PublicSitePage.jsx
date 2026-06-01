import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiGrid } from "react-icons/fi";

import { WebsiteRenderer } from "../components/sections/SectionRenderer";
import { API_BASE_URL, apiError, publicApi } from "../services/api";

export default function PublicSitePage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .page(slug)
      .then((response) => setPage(response.data))
      .catch((err) => setError(apiError(err).message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Inject SEO Meta Tags and Open Graph properties
  useEffect(() => {
    if (!page) return;
    
    // Update Title
    document.title = page.meta_title || page.title || "Published Site";
    
    // Update or create Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', page.meta_description || page.summary || "");

    // Update or create OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', page.meta_title || page.title || "");

    // Update or create OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', page.meta_description || page.summary || "");

    // Update or create OG Image
    if (page.og_image) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', page.og_image);
    }
  }, [page]);

  // Track page view (fire-and-forget)
  useEffect(() => {
    if (page?.slug) {
      fetch(`${API_BASE_URL}/public/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: page.slug, referrer: document.referrer || "" }),
      }).catch(() => {});
    }
  }, [page?.slug]);

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (error || !page) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-4 text-center text-white">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white text-black">
            <FiGrid className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Page unavailable</h1>
          <p className="mt-2 text-sm text-white/[0.55]">{error || "This page is not published."}</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-brand-aqua hover:text-white" to="/login">
            Open InstaWeb
          </Link>
        </div>
      </main>
    );
  }

  return <WebsiteRenderer sections={page.sections || []} />;
}

