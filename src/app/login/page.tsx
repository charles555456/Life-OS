"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { pullFromCloud } from "@/lib/sync";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      const err = await signUp(email, password, name);
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
      }
    } else {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        // Pull cloud data after login
        const { data } = await (await import("@/lib/supabase")).supabase.auth.getUser();
        if (data.user) {
          await pullFromCloud(data.user.id);
        }
        window.location.href = "/";
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="px-6 pt-20 text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-bold mb-2">確認你的信箱</h1>
        <p className="text-sm text-text-secondary">
          已寄出驗證信到 {email}，點擊連結後即可登入。
        </p>
        <button
          onClick={() => { setSuccess(false); setIsSignUp(false); }}
          className="mt-6 text-sm text-accent-amber"
        >
          返回登入
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Life OS</h1>
        <p className="text-sm text-text-secondary">你的個人生活操作系統</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
        {isSignUp && (
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent-amber"
              placeholder="你的名字"
            />
          </div>
        )}
        <div>
          <label className="text-xs text-text-secondary block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent-amber"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary block mb-1.5">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent-amber"
            placeholder="至少 6 個字元"
          />
        </div>

        {error && (
          <p className="text-xs text-accent-rose bg-accent-rose-soft px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent-amber text-bg-primary text-sm font-semibold active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {loading ? "..." : isSignUp ? "註冊" : "登入"}
        </button>

        <p className="text-center text-xs text-text-muted">
          {isSignUp ? "已有帳號？" : "還沒有帳號？"}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-accent-amber ml-1"
          >
            {isSignUp ? "登入" : "註冊"}
          </button>
        </p>
      </form>
    </div>
  );
}
