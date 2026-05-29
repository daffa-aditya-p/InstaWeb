import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("instaweb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(error) {
  return {
    message:
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.",
    errors: error?.response?.data?.errors || {},
    status: error?.response?.status,
  };
}

const unwrap = (request) => request.then((response) => response.data);

export const authApi = {
  register: (payload) => unwrap(api.post("/register", payload)),
  login: (payload) => unwrap(api.post("/login", payload)),
  logout: () => unwrap(api.post("/logout")),
  me: () => unwrap(api.get("/me")),
  updateProfile: (payload) => unwrap(api.put("/me", payload)),
};

export const pagesApi = {
  all: () => unwrap(api.get("/pages")),
  create: (payload) => unwrap(api.post("/pages", payload)),
  get: (slug) => unwrap(api.get(`/pages/${slug}`)),
  update: (slug, payload) => unwrap(api.put(`/pages/${slug}`, payload)),
  remove: (slug) => unwrap(api.delete(`/pages/${slug}`)),
  publish: (slug, isPublished) =>
    unwrap(api.put(`/pages/${slug}/publish`, { is_published: isPublished })),
  addSection: (slug, payload) => unwrap(api.post(`/pages/${slug}/sections`, payload)),
  updateSectionFields: (slug, sectionId, fields) =>
    unwrap(api.put(`/pages/${slug}/sections/${sectionId}/fields`, { fields })),
  reorderSections: (slug, sections) =>
    unwrap(api.put(`/pages/${slug}/sections/reorder`, { sections })),
  removeSection: (slug, sectionId) =>
    unwrap(api.delete(`/pages/${slug}/sections/${sectionId}`)),
  upload: (formData) =>
    unwrap(
      api.post("/pages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
};

export const templatesApi = {
  all: () => unwrap(api.get("/templates")),
  get: (slug) => unwrap(api.get(`/templates/${slug}`)),
};

export const publicApi = {
  page: (slug) => unwrap(api.get(`/public/pages/${slug}`)),
};

export const adminApi = {
  analytics: () => unwrap(api.get("/admin/analytics")),
  users: () => unwrap(api.get("/admin/users")),
  updateUser: (id, payload) => unwrap(api.put(`/admin/users/${id}`, payload)),
  deleteUser: (id) => unwrap(api.delete(`/admin/users/${id}`)),
  pages: () => unwrap(api.get("/admin/pages")),
  deletePage: (identifier) => unwrap(api.delete(`/admin/pages/${identifier}`)),
  createTemplate: (payload) => unwrap(api.post("/admin/templates", payload)),
  updateTemplate: (slug, payload) => unwrap(api.put(`/admin/templates/${slug}`, payload)),
  deleteTemplate: (slug) => unwrap(api.delete(`/admin/templates/${slug}`)),
};

