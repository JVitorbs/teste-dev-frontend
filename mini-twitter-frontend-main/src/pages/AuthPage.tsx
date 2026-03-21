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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
      navigate("/timeline", { replace: true });
    },
    onError: (error) => {
      setApiMessage(getApiError(error, "Credenciais invalidas."));
    },
  });

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-5 px-3 py-6 md:grid-cols-[1.2fr,1fr] md:items-center md:gap-8 md:px-6">
      <Card className="animate-fade-up relative overflow-hidden p-6 md:p-10">
        <div className="animate-pulse-soft absolute -left-20 -top-20 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-700/35" />
        <div className="animate-pulse-soft absolute -bottom-24 right-2 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-700/25" />

        <div className="relative">
          <Badge variant="secondary" className="mb-5 uppercase tracking-[0.14em] text-[var(--tw-brand)]">
            Mini Twitter
          </Badge>
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
      </Card>

      <Card className="animate-fade-up p-5 md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
          <Button
            onClick={toggleTheme}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            {theme === "light" ? "Modo escuro" : "Modo claro"}
          </Button>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")} className="mt-1">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          {apiMessage && (
            <p className="mt-4 rounded-2xl border border-[var(--tw-border)] bg-[var(--tw-surface-soft)] p-3 text-sm text-[var(--tw-text)]">
              {apiMessage}
            </p>
          )}

          <TabsContent value="register" className="mt-4">
            <form className="space-y-3" onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}>
            <div>
              <Input
                {...registerForm.register("name")}
                placeholder="Nome"
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Input
                {...registerForm.register("email")}
                placeholder="E-mail"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                {...registerForm.register("password")}
                placeholder="Senha"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-2xl"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
            </Button>
            </form>
          </TabsContent>

          <TabsContent value="login" className="mt-4">
            <form className="space-y-3" onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}>
            <div>
              <Input
                {...loginForm.register("email")}
                placeholder="E-mail"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                {...loginForm.register("password")}
                placeholder="Senha"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[var(--tw-danger)]">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-2xl"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
};
