import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { getApiError } from "../lib/error";
import { loginSchema, registerSchema, type LoginSchema, type RegisterSchema } from "../schemas/auth";
import { useAuth } from "../context/AuthContext";

export const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [apiMessage, setApiMessage] = useState<string>("");
  const navigate = useNavigate();
  const { setSession } = useAuth();

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
    <main className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 px-4 py-8 md:grid-cols-2 md:items-center">
      <section className="hidden rounded-3xl border border-sky-100 bg-white/75 p-8 shadow-sm md:block">
        <p className="mb-4 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
          Mini Twitter
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Acontecendo agora</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Entre para acompanhar as conversas da comunidade, publicar ideias e interagir em tempo real.
        </p>
      </section>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Entrar no Mini Twitter</h2>
        <p className="mt-1 text-sm text-slate-600">Use sua conta para acessar a timeline.</p>

        <div className="mt-4 grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm">
          <button
            className={`rounded-full py-2 font-semibold transition ${
              mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-600"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`rounded-full py-2 font-semibold transition ${
              mode === "register" ? "bg-white text-slate-900 shadow" : "text-slate-600"
            }`}
            onClick={() => setMode("register")}
          >
            Registrar
          </button>
        </div>

        {apiMessage && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{apiMessage}</p>}

        {mode === "register" ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}
          >
            <div>
              <input
                {...registerForm.register("name")}
                placeholder="Nome"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <input
                {...registerForm.register("email")}
                placeholder="E-mail"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...registerForm.register("password")}
                placeholder="Senha"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-full bg-sky-500 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
          >
            <div>
              <input
                {...loginForm.register("email")}
                placeholder="E-mail"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...loginForm.register("password")}
                placeholder="Senha"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-full bg-sky-500 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
