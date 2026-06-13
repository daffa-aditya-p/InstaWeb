import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCopy,
  FiEdit3,
  FiEye,
  FiExternalLink,
  FiGlobe,
  FiLayers,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useShortcut } from "../hooks/useShortcut";
import { apiError, pagesApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { slugify } from "../utils/slugify";

const emptyForm = { title: "", slug: "", summary: "" };

export default function PagesPage() {
  useDocumentTitle("Halaman");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState({});

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pagesApi.all();
      setPages(response.data.pages);
    } catch (error) {
      toast.error(apiError(error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const openNew = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setSlugTouched(false);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDeleteTarget(null);
  }, []);

  useShortcut(
    useCallback(
      (event) => {
        if (event.altKey && event.key.toLowerCase() === "n") {
          event.preventDefault();
          openNew();
        }
        if (event.key === "Escape") {
          closeModal();
        }
      },
      [closeModal, openNew],
    ),
  );

  const openEdit = (page) => {
    setEditing(page);
    setForm({
      title: page.title,
      slug: page.slug,
      summary: page.summary || "",
    });
    setErrors({});
    setSlugTouched(true);
    setModalOpen(true);
  };

  const setTitle = (title) => {
    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await pagesApi.update(editing.slug, form);
        toast.success("Halaman diperbarui");
      } else {
        await pagesApi.create(form);
        toast.success("Halaman dibuat");
      }
      setModalOpen(false);
      await loadPages();
    } catch (error) {
      const parsed = apiError(error);
      setErrors(parsed.errors);
      toast.error(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (page) => {
    try {
      await pagesApi.publish(page.slug, !page.is_published);
      toast.success(page.is_published ? "Halaman batal dipublikasi" : "Halaman dipublikasi");
      await loadPages();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const removePage = async () => {
    if (!deleteTarget) return;
    try {
      await pagesApi.remove(deleteTarget.slug);
      toast.success("Halaman dihapus");
      setDeleteTarget(null);
      await loadPages();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Halaman</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Website Anda</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/[0.55]">
            Buat halaman, buka editor, pratinjau konten live, dan publikasikan saat siap.
          </p>
        </div>
        <Button icon={FiPlus} variant="primary" onClick={openNew} className="w-full sm:w-auto">
          Halaman Baru
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton className="h-56" key={item} />
          ))}
        </div>
      ) : pages.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <article
              className="muted-panel group flex min-h-64 flex-col justify-between rounded-lg p-5 transition hover:-translate-y-1 hover:border-brand-aqua/35"
              key={page.id}
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={page.is_published ? "green" : "neutral"}>
                      {page.is_published ? "Dipublikasi" : "Draf"}
                    </Badge>
                    {page.user_id !== user?.id && (
                      <Badge tone="purple">Kolaborator</Badge>
                    )}
                  </div>
                  {page.user_id === user?.id && (
                    <button
                      className="text-white/40 transition hover:text-brand-rose"
                      onClick={() => setDeleteTarget(page)}
                      aria-label={`Delete ${page.title}`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Link to={`/pages/${page.slug}/builder`}>
                  <h2 className="text-xl font-semibold text-white transition group-hover:text-brand-aqua">
                    {page.title}
                  </h2>
                </Link>
                <p className="mt-2 text-xs font-medium text-white/[0.45]">/{page.slug}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/[0.58]">
                  {page.summary || "Tidak ada ringkasan."}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button size="sm" icon={FiLayers} onClick={() => navigate(`/pages/${page.slug}/builder`)} className="w-full sm:w-auto">
                  Desain
                </Button>
                <Button size="sm" icon={FiEye} onClick={() => navigate(`/pages/${page.slug}/preview`)} className="w-full sm:w-auto">
                  Pratinjau
                </Button>
                <Button size="sm" icon={FiEdit3} onClick={() => openEdit(page)} className="w-full sm:w-auto">
                  Edit
                </Button>
                <Button
                  size="sm"
                  icon={FiCopy}
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    const loadingToast = toast.loading("Menduplikasi halaman...");
                    try {
                      const response = await pagesApi.duplicate(page.slug);
                      setPages((current) => [...current, response.data]);
                      toast.success("Halaman diduplikasi", { id: loadingToast });
                    } catch (error) {
                      toast.error(apiError(error).message, { id: loadingToast });
                    }
                  }}
                >
                  Duplikat
                </Button>
                {page.is_published ? (
                  <>
                    <Button
                      size="sm"
                      as="a"
                      href={`/site/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      icon={FiExternalLink}
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      Buka Web Live
                    </Button>
                    <Button
                      size="sm"
                      icon={FiGlobe}
                      variant="secondary"
                      onClick={() => togglePublish(page)}
                      className="col-span-2 sm:col-span-none w-full sm:w-auto"
                    >
                      Batal Publikasi
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    icon={FiGlobe}
                    variant="primary"
                    onClick={() => togglePublish(page)}
                    className="w-full sm:w-auto"
                  >
                    Publikasi
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada halaman"
          description="Buat halaman website pertama Anda dan mulai susun dengan modul dinamis."
          action="Halaman Baru"
          onAction={openNew}
        />
      )}

      <Modal open={modalOpen} title={editing ? "Edit halaman" : "Halaman baru"} onClose={closeModal}>
        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Judul"
            value={form.title}
            error={errors.title?.[0]}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            label="Tautan (Slug)"
            value={form.slug}
            error={errors.slug?.[0]}
            onChange={(event) => {
              setSlugTouched(true);
              setForm({ ...form, slug: slugify(event.target.value) });
            }}
          />
          <Textarea
            label="Ringkasan"
            value={form.summary}
            error={errors.summary?.[0]}
            onChange={(event) => setForm({ ...form, summary: event.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={closeModal}>Batal</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteTarget)} title="Hapus halaman" onClose={closeModal}>
        <p className="text-sm leading-6 text-white/[0.65]">
          Hapus "{deleteTarget?.title}" dan seluruh kontennya?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={closeModal}>Batal</Button>
          <Button icon={FiTrash2} variant="danger" onClick={removePage}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
