import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCard } from "../PostCard";
import type { PostItem, User } from "../types/api";

const postMock: PostItem = {
  id: 10,
  title: "Post de teste",
  content: "Conteudo de teste",
  image: null,
  authorId: 1,
  authorName: "Alice",
  createdAt: "2026-03-21T10:00:00.000Z",
  likesCount: 5,
};

const ownerUser: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};

const makeProps = (currentUser: User | null) => ({
  post: postMock,
  currentUser,
  liked: false,
  canInteract: true,
  onToggleLike: vi.fn(),
  onDelete: vi.fn(),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onOpenPost: vi.fn(),
  onRequireAuth: vi.fn(),
});

describe("PostCard", () => {
  it("mostra Editar e Deletar apenas para o autor", () => {
    const ownerProps = makeProps(ownerUser);
    const { rerender } = render(<PostCard {...ownerProps} />);

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deletar" })).toBeInTheDocument();

    const nonOwnerProps = makeProps({ id: 999, name: "Outro", email: "other@example.com" });
    rerender(<PostCard {...nonOwnerProps} />);

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Deletar" })).not.toBeInTheDocument();
  });

  it("dispara onToggleLike ao clicar no botao de curtida", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    await user.click(screen.getByRole("button", { name: "Curtir post" }));

    expect(props.onToggleLike).toHaveBeenCalledWith(postMock.id, false);
  });

  it("entra em modo edição ao clicar em Editar", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    const editButton = screen.getByRole("button", { name: "Editar" });
    await user.click(editButton);

    // Verifica que o formulário de edição apareceu
    expect(screen.getByDisplayValue(postMock.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(postMock.content)).toBeInTheDocument();
  });

  it("cancela edição ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    const { rerender } = render(<PostCard {...props} />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: "Editar" });
    await user.click(editButton);

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    await user.click(cancelButton);

    // Form should no longer be visible
    rerender(<PostCard {...props} />);
    expect(screen.queryByDisplayValue(postMock.title)).not.toBeInTheDocument();
  });

  it("salva edição ao submeter formulário", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: "Editar" });
    await user.click(editButton);

    // Modify title
    const titleInput = screen.getByDisplayValue(postMock.title) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, "Novo titulo");

    // Submit
    const saveButton = screen.getByRole("button", { name: "Salvar" });
    await user.click(saveButton);

    expect(props.onUpdate).toHaveBeenCalled();
  });

  it("mostra post com imagem", () => {
    const postWithImage = {
      ...postMock,
      image: "https://example.com/image.jpg",
    };
    const props = makeProps(ownerUser);

    render(
      <PostCard
        {...props}
        post={postWithImage}
      />,
    );

    const image = screen.getByAltText(postWithImage.title) as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe(postWithImage.image);
  });

  it("dispara onRequireAuth ao clicar curtir sem permissão", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(
      <PostCard
        {...props}
        canInteract={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Entrar para curtir" }));

    expect(props.onRequireAuth).toHaveBeenCalled();
  });

  it("dispara onDelete ao clicar em Deletar", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    const deleteButton = screen.getByRole("button", { name: "Deletar" });
    await user.click(deleteButton);

    expect(props.onDelete).toHaveBeenCalledWith(postMock.id);
  });

  it("dispara onOpenPost ao clicar em Abrir", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    const openButton = screen.getByRole("button", { name: /abrir/i });
    await user.click(openButton);

    expect(props.onOpenPost).toHaveBeenCalledWith(postMock.id);
  });

  it("mostra like button com estado curtido", () => {
    const props = makeProps(ownerUser);

    render(
      <PostCard
        {...props}
        liked={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Descurtir post" })).toBeInTheDocument();
  });

  it("desabilita like button quando carregando", () => {
    const props = makeProps(ownerUser);

    render(
      <PostCard
        {...props}
        likeLoading={true}
      />,
    );

    const likeButton = screen.getByRole("button", { name: "Curtir post" });
    expect(likeButton).toBeDisabled();
  });

  it("abre modal ao clicar no card", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);

    render(<PostCard {...props} />);

    // Click anywhere on the card (but not on buttons)
    const article = screen.getByRole("article");
    await user.click(article);

    expect(props.onOpenPost).toHaveBeenCalledWith(postMock.id);
  });

  it("não abre modal ao clicar em botão durante edição", async () => {
    const user = userEvent.setup();
    const props = makeProps(ownerUser);
    const { rerender } = render(<PostCard {...props} />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: "Editar" });
    await user.click(editButton);

    rerender(<PostCard {...props} />);

    // Verify edit form is visible
    expect(screen.getByDisplayValue(postMock.title)).toBeInTheDocument();
  });
});
