import { storage } from "../storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("salva e recupera token", () => {
    storage.setToken("abc");
    expect(storage.getToken()).toBe("abc");
  });

  it("salva e recupera usuario", () => {
    const user = { id: 1, name: "Alice", email: "alice@example.com" };
    storage.setUser(user);

    expect(storage.getUser()).toEqual(user);
  });

  it("remove usuario invalido ao fazer parse", () => {
    localStorage.setItem("mini-twitter-user", "{invalido");

    expect(storage.getUser()).toBeNull();
    expect(localStorage.getItem("mini-twitter-user")).toBeNull();
  });

  it("limpa sessao completa", () => {
    storage.setToken("abc");
    storage.setUser({ id: 2, name: "Bob", email: "bob@example.com" });

    storage.clearSession();

    expect(storage.getToken()).toBeNull();
    expect(storage.getUser()).toBeNull();
  });
});
