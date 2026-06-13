import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUserPlus } from "react-icons/fi";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import { AuthScreen, BrandHeader } from "./LoginPage";

export default function RegisterPage() {
  useDocumentTitle("Daftar");
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    try {
      await register(form);
      toast.success("Ruang kerja Anda sudah siap");
      navigate("/pages", { replace: true });
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    }
  };

  return (
    <AuthScreen>
      <motion.form
        className="glass-panel w-full max-w-md rounded-lg p-5 sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
      >
        <BrandHeader title="Buat ruang kerja baru" />
        <div className="mt-8 space-y-4">
          <Input
            label="Nama"
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
          <Input
            label="Kata Sandi"
            type="password"
            value={form.password}
            error={errors.password?.[0]}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <Button className="mt-6 w-full" size="lg" icon={FiUserPlus} type="submit" variant="primary" disabled={loading}>
          {loading ? "Membuat..." : "Daftar"}
        </Button>
        <p className="mt-5 text-center text-sm text-white/[0.55]">
          Sudah punya akun?{" "}
          <Link className="font-semibold text-brand-aqua hover:text-white" to="/login">
            Masuk
          </Link>
        </p>
      </motion.form>
    </AuthScreen>
  );
}
