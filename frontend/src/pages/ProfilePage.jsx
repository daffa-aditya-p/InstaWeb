import { useState } from "react";
import toast from "react-hot-toast";
import { FiSave, FiUser } from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setForm((current) => ({ ...current, password: "" }));
      toast.success("Profile updated");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Account settings</h1>
      </div>

      <form className="glass-panel rounded-lg p-5" onSubmit={submit}>
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-lg border border-white/10 bg-white/[0.08]">
            <FiUser className="h-6 w-6 text-brand-aqua" />
          </div>
          <div>
            <h2 className="font-semibold text-white">{user?.name}</h2>
            <div className="mt-1">
              <Badge tone={user?.role === "super_admin" ? "amber" : "aqua"}>
                {user?.role?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            error={errors.name?.[0]}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email?.[0]}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="New password"
              type="password"
              value={form.password}
              error={errors.password?.[0]}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button icon={FiSave} type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

