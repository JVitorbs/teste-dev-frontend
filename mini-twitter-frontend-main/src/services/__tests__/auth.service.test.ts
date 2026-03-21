const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    post: vi.fn(),
  },
}));

vi.mock("../lib/api", () => ({
  api: apiMock,
}));

import { authService } from "../auth.service";

describe("authService", () => {
  beforeEach(() => {
    apiMock.post.mockReset();
  });

  it("chama register no endpoint correto", async () => {
    apiMock.post.mockResolvedValue({ data: { ok: true } });

    await authService.register({ name: "A", email: "a@a.com", password: "1234" });

    expect(apiMock.post).toHaveBeenCalledWith("/auth/register", {
      name: "A",
      email: "a@a.com",
      password: "1234",
    });
  });

  it("chama login no endpoint correto", async () => {
    apiMock.post.mockResolvedValue({ data: { token: "abc", user: { id: 1, name: "A", email: "a@a.com" } } });

    await authService.login({ email: "a@a.com", password: "1234" });

    expect(apiMock.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@a.com",
      password: "1234",
    });
  });

  it("chama logout no endpoint correto", async () => {
    apiMock.post.mockResolvedValue({ data: { success: true } });

    await authService.logout();

    expect(apiMock.post).toHaveBeenCalledWith("/auth/logout");
  });
});
