import { postSchema } from "../post";

describe("post schema", () => {
  it("aceita post com imagem http", () => {
    const result = postSchema.safeParse({
      title: "Titulo valido",
      content: "Conteudo valido",
      image: "http://example.com/image.png",
    });

    expect(result.success).toBe(true);
  });

  it("aceita post sem imagem", () => {
    const result = postSchema.safeParse({
      title: "Titulo valido",
      content: "Conteudo valido",
      image: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita imagem fora do formato URL http(s)", () => {
    const result = postSchema.safeParse({
      title: "Titulo valido",
      content: "Conteudo valido",
      image: "data:image/png;base64,abc",
    });

    expect(result.success).toBe(false);
  });
});
