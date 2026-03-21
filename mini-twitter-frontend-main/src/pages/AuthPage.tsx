import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { getApiError } from "../lib/error";
import { loginSchema, registerSchema, type LoginSchema, type RegisterSchema } from "../schemas/auth";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [apiMessage, setApiMessage] = useState<string>("");
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const registerForm = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setApiMessage("Conta criada com sucesso. Agora faca login.");
      setMode("login");
      registerForm.reset();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setApiMessage("Este e-mail ja esta em uso. Tente outro e-mail.");
        return;
      }

      setApiMessage(getApiError(error, "Nao foi possivel registrar."));
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setApiMessage(getApiError(error, "Credenciais invalidas."));
    },
  });

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-5 px-3 py-6 md:grid-cols-[1.2fr,1fr] md:items-center md:gap-8 md:px-6">
      <section className="surface animate-fade-up relative overflow-hidden rounded-3xl p-6 md:p-10">
        <div className="animate-pulse-soft absolute -left-20 -top-20 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-700/35" />
        <div className="animate-pulse-soft absolute -bottom-24 right-2 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-700/25" />

        <div className="relative">
          <p className="mb-5 inline-flex rounded-full border border-[var(--tw-border)] bg-[var(--tw-surface-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tw-brand)]">
            Mini Twitter
          </p>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight md:text-5xl">Converse com a comunidade em tempo real.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--tw-muted)] md:text-base">
            Um feed rápido, focado em texto e ideias. Entre para compartilhar posts, curtir discussões e acompanhar os temas do momento.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="surface-soft rounded-2xl p-4">
              <p className="font-bold text-[var(--tw-brand)]">+7</p>
              <p className="mt-1 text-[var(--tw-muted)]">posts iniciais no feed</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <p className="font-bold text-[var(--tw-brand)]">100%</p>
              <p className="mt-1 text-[var(--tw-muted)]">responsivo para mobile</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface animate-fade-up rounded-3xl p-5 md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
          <button
            onClick={toggleTheme}
            type="button"
            className="rounded-full border border-[var(--tw-border)] bg-[var(--tw-surface-soft)] px-3 py-1 text-xs font-bold text-[var(--tw-muted)] transition hover:text-[var(--tw-text)]"
          >
            {theme === "light" ? "Modo escuro" : "Modo claro"}
          </button>
        </div>

        <div className="surface-soft grid grid-cols-2 rounded-full p-1 text-sm">
          <button
            className={`rounded-full py-2 font-bold transition ${mode === "login" ? "bg-[var(--tw-surface)] text-[var(--tw-text)]" : "text-[var(--tw-muted)]"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`rounded-full py-2 font-bold transition ${mode === "register" ? "bg-[var(--tw-surface)] text-[var(--tw-text)]" : "text-[var(--tw-muted)]"}`}
            onClick={() => setMode("register")}
          >
            Registrar
          </button>
        </div>

        {apiMessage && (
          <p className="mt-4 rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface-soft)] p-3 text-sm text-[var(--tw-text)]">
            {apiMessage}
          </p>
        )}

        {mode === "register" ? (
          <form className="mt-4 space-y-3" onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}>
            <div>
              <input
                {...registerForm.register("name")}
                placeholder="Nome"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <input
                {...registerForm.register("email")}
                placeholder="E-mail"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...registerForm.register("password")}
                placeholder="Senha"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-2xl bg-[var(--tw-brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--tw-brand-strong)] disabled:opacity-60"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}>
            <div>
              <input
                {...loginForm.register("email")}
                placeholder="E-mail"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...loginForm.register("password")}
                placeholder="Senha"
                className="w-full rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--tw-brand)]"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-2xl bg-[var(--tw-brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--tw-brand-strong)] disabled:opacity-60"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
