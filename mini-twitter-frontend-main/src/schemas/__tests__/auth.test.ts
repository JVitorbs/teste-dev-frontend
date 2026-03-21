import { loginSchema, registerSchema } from "../auth";

describe("auth schemas", () => {
  it("valida registro com dados corretos", () => {
    const result = registerSchema.safeParse({
      name: "Joao",
      email: "joao@example.com",
      password: "1234",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita e-mail invalido no registro", () => {
    const result = registerSchema.safeParse({
      name: "Joao",
      email: "email-invalido",
      password: "1234",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia no login", () => {
    const result = loginSchema.safeParse({
      email: "joao@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
