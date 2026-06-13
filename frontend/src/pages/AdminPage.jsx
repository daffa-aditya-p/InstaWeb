import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiFileText,
  FiPlus,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { adminApi, apiError, templatesApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { slugify } from "../utils/slugify";

const starterTemplate = {
  name: "",
  slug: "",
  description: "",
  fields: [{ name: "Heading", slug: "heading", type: "text" }],
};

export default function AdminPage() {
  useDocumentTitle("Admin");
  const user = useAuthStore((state) => state.user);
  const isSuper = user?.role === "super_admin";
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState(starterTemplate);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, pagesResponse, templatesResponse] = await Promise.all([
        adminApi.analytics(),
        adminApi.pages(),
        templatesApi.all(),
      ]);
      setAnalytics(analyticsResponse.data);
      setPages(pagesResponse.data.pages);
      setTemplates(templatesResponse.data.templates);
      if (isSuper) {
        const usersResponse = await adminApi.users();
        setUsers(usersResponse.data.users);
      }
    } catch (error) {
      toast.error(apiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isSuper]);

  const createTemplate = async (event) => {
    event.preventDefault();
    setErrors({});
    try {
      await adminApi.createTemplate(templateForm);
      toast.success("Template dibuat");
      setTemplateOpen(false);
      setTemplateForm(starterTemplate);
      load();
    } catch (error) {
      const parsed = apiError(error);
      setErrors(parsed.errors);
      toast.error(parsed.message);
    }
  };

  const deleteTemplate = async (template) => {
    try {
      await adminApi.deleteTemplate(template.slug);
      toast.success("Template dihapus");
      load();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const deletePage = async (page) => {
    try {
      await adminApi.deletePage(page.slug);
      toast.success("Halaman dihapus");
      load();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const updateUserRole = async (target, role) => {
    try {
      await adminApi.updateUser(target.id, { role });
      toast.success("Peran pengguna diperbarui");
      load();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const deleteUser = async (target) => {
    try {
      await adminApi.deleteUser(target.id);
      toast.success("Pengguna dihapus");
      load();
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const updateTemplateField = (index, patch) => {
    setTemplateForm((current) => ({
      ...current,
      fields: current.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    }));
  };

  const metricCards = analytics
    ? [
        { label: "Pengguna", value: analytics.users, icon: FiUsers },
        { label: "Halaman", value: analytics.pages, icon: FiFileText },
        { label: "Dipublikasi", value: analytics.published_pages, icon: FiShield },
        { label: "Template", value: analytics.templates, icon: FiPlus },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Ruang kontrol platform</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/[0.55]">
          Kelola template, halaman, analitik, dan pengguna sesuai peran Anda.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((item) => <Skeleton className="h-28" key={item} />)
          : metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <div className="muted-panel rounded-lg p-5" key={metric.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/[0.55]">{metric.label}</span>
                    <Icon className="h-5 w-5 text-brand-aqua" />
                  </div>
                  <div className="mt-5 text-3xl font-semibold text-white">{metric.value}</div>
                </div>
              );
            })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="muted-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Template</h2>
            <Button icon={FiPlus} size="sm" variant="primary" onClick={() => setTemplateOpen(true)}>
              Template Baru
            </Button>
          </div>
          <div className="grid gap-3">
            {templates.map((template) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.05] p-4"
                key={template.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="mt-1 text-xs text-white/[0.45]">/{template.slug}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteTemplate(template)} aria-label="Hapus template">
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.fields.map((field) => (
                    <Badge key={field.id} tone={field.type === "image" ? "amber" : "neutral"}>
                      {field.slug}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="muted-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Halaman platform</h2>
          <div className="mt-4 max-h-[34rem] space-y-3 overflow-y-auto">
            {pages.map((page) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4" key={page.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{page.title}</h3>
                    <p className="mt-1 text-xs text-white/[0.45]">
                      /{page.slug} by {page.owner?.name}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePage(page)} aria-label="Hapus halaman">
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3">
                  <Badge tone={page.is_published ? "green" : "neutral"}>
                    {page.is_published ? "Dipublikasi" : "Draf"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isSuper ? (
        <section className="muted-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white">Pengguna</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {users.map((target) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4" key={target.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{target.name}</h3>
                    <p className="mt-1 text-xs text-white/[0.45]">{target.email}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteUser(target)} aria-label="Hapus pengguna">
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Select
                  className="mt-4"
                  label="Peran"
                  value={target.role}
                  onChange={(event) => updateUserRole(target, event.target.value)}
                >
                  <option className="bg-ink-900" value="user">User</option>
                  <option className="bg-ink-900" value="admin">Admin</option>
                  <option className="bg-ink-900" value="super_admin">Super Admin</option>
                </Select>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Modal open={templateOpen} title="Template baru" onClose={() => setTemplateOpen(false)} width="max-w-2xl">
        <form className="space-y-4" onSubmit={createTemplate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama"
              value={templateForm.name}
              error={errors.name?.[0]}
              onChange={(event) =>
                setTemplateForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
            />
            <Input
              label="Tautan (Slug)"
              value={templateForm.slug}
              error={errors.slug?.[0]}
              onChange={(event) =>
                setTemplateForm((current) => ({ ...current, slug: slugify(event.target.value) }))
              }
            />
          </div>
          <Textarea
            label="Deskripsi"
            value={templateForm.description}
            onChange={(event) =>
              setTemplateForm((current) => ({ ...current, description: event.target.value }))
            }
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Kolom</h3>
              <Button
                size="sm"
                icon={FiPlus}
                onClick={() =>
                  setTemplateForm((current) => ({
                    ...current,
                    fields: [...current.fields, { name: "", slug: "", type: "text" }],
                  }))
                }
              >
                Kolom
              </Button>
            </div>
            {templateForm.fields.map((field, index) => (
              <div className="grid gap-3 rounded-lg border border-white/10 p-3 sm:grid-cols-[1fr_1fr_120px_40px]" key={index}>
                <Input
                  label="Nama"
                  value={field.name}
                  error={errors[`fields.${index}.name`]?.[0]}
                  onChange={(event) =>
                    updateTemplateField(index, {
                      name: event.target.value,
                      slug: field.slug || slugify(event.target.value),
                    })
                  }
                />
                <Input
                  label="Tautan (Slug)"
                  value={field.slug}
                  error={errors[`fields.${index}.slug`]?.[0]}
                  onChange={(event) => updateTemplateField(index, { slug: slugify(event.target.value) })}
                />
                <Select
                  label="Tipe"
                  value={field.type}
                  error={errors[`fields.${index}.type`]?.[0]}
                  onChange={(event) => updateTemplateField(index, { type: event.target.value })}
                >
                  <option className="bg-ink-900" value="text">Text</option>
                  <option className="bg-ink-900" value="image">Image</option>
                </Select>
                <div className="flex items-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setTemplateForm((current) => ({
                        ...current,
                        fields: current.fields.filter((_, fieldIndex) => fieldIndex !== index),
                      }))
                    }
                    aria-label="Hapus kolom"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.fields?.[0] ? <p className="text-xs text-brand-rose">{errors.fields[0]}</p> : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setTemplateOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">
              Buat Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

