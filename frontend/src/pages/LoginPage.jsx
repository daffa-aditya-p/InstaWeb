import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiGrid, FiLogIn } from "react-icons/fi";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  useDocumentTitle("Masuk");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({ email: "demo@instaweb.io", password: "password" });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    try {
      await login(form);
      toast.success("Selamat datang kembali di InstaWeb");
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
        <BrandHeader title="Selamat datang kembali" />
        <div className="mt-8 space-y-4">
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
        <Button className="mt-6 w-full" size="lg" icon={FiLogIn} type="submit" variant="primary" disabled={loading}>
          {loading ? "Sedang masuk..." : "Masuk"}
        </Button>
        <p className="mt-5 text-center text-sm text-white/[0.55]">
          Baru di sini?{" "}
          <Link className="font-semibold text-brand-aqua hover:text-white" to="/register">
            Buat akun baru
          </Link>
        </p>
      </motion.form>
    </AuthScreen>
  );
}

export function AuthScreen({ children }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-aqua/60 to-transparent" />
      {children}
    </main>
  );
}

export function BrandHeader({ title }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 overflow-hidden place-items-center rounded-lg bg-white text-ink-950">
          <img src="/logo.png" alt="InstaWeb Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">InstaWeb</div>
          <div className="text-xs text-white/[0.45]">Platform website modern</div>
        </div>
      </div>
      <h1 className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-white/[0.55]">
        Kelola halaman, modul, template, dan pratinjau live dari satu ruang kerja yang mulus.
      </p>
    </div>
  );
}
