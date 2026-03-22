const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../lib/api", () => ({
  api: apiMock,
}));

import { postService } from "../post.service";

describe("postService", () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    apiMock.put.mockReset();
    apiMock.delete.mockReset();
  });

  it("lista posts com page e search", async () => {
    apiMock.get.mockResolvedValue({ data: { posts: [], total: 0, page: 1, limit: 10 } });

    await postService.list(1, "react");

    expect(apiMock.get).toHaveBeenCalledWith("/posts", {
      params: { page: 1, search: "react" },
    });
  });

  it("cria post", async () => {
    apiMock.post.mockResolvedValue({ data: { id: 1 } });

    await postService.create({ title: "T", content: "C", image: "" });

    expect(apiMock.post).toHaveBeenCalledWith("/posts", { title: "T", content: "C", image: "" });
  });

  it("atualiza post", async () => {
    apiMock.put.mockResolvedValue({ data: { ok: true } });

    await postService.update(10, { title: "N", content: "Novo" });

    expect(apiMock.put).toHaveBeenCalledWith("/posts/10", { title: "N", content: "Novo" });
  });

  it("deleta post", async () => {
    apiMock.delete.mockResolvedValue({ data: { ok: true } });

    await postService.delete(9);

    expect(apiMock.delete).toHaveBeenCalledWith("/posts/9");
  });

  it("curte post", async () => {
    apiMock.post.mockResolvedValue({ data: { liked: true } });

    await postService.like(7);

    expect(apiMock.post).toHaveBeenCalledWith("/posts/7/like");
  });
});
