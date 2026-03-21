import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostComposer } from "../PostComposer";

describe("PostComposer", () => {
  it("mostra campo de imagem ao clicar em anexar", async () => {
    const user = userEvent.setup();

    render(<PostComposer loading={false} onSubmitPost={vi.fn().mockResolvedValue(undefined)} />);

    expect(screen.queryByPlaceholderText("URL da imagem (opcional)")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Anexar imagem" }));

    expect(screen.getByPlaceholderText("URL da imagem (opcional)")).toBeInTheDocument();
  });

  it("envia formulario valido", async () => {
    const user = userEvent.setup();
    const onSubmitPost = vi.fn().mockResolvedValue(undefined);

    render(<PostComposer loading={false} onSubmitPost={onSubmitPost} />);

    await user.type(screen.getByPlaceholderText("Titulo do seu post"), "Titulo novo");
    await user.type(screen.getByPlaceholderText("Compartilhe uma ideia, dica ou opiniao..."), "Conteudo novo");
    await user.click(screen.getByRole("button", { name: "Postar" }));

    await waitFor(() => {
      expect(onSubmitPost).toHaveBeenCalledWith({
        title: "Titulo novo",
        content: "Conteudo novo",
        image: "",
      });
    });
  });
});
