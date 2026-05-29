import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiGrid } from "react-icons/fi";

import { WebsiteRenderer } from "../components/sections/SectionRenderer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { apiError, publicApi } from "../services/api";

export default function PublicSitePage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useDocumentTitle(page?.title || "Published Site");

  useEffect(() => {
    publicApi
      .page(slug)
      .then((response) => setPage(response.data))
      .catch((err) => setError(apiError(err).message))
      .finally(() => setLoading(false));
  }, [slug]);

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

