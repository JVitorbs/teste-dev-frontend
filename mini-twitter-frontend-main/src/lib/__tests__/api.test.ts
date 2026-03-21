const { createMock, getTokenMock, capturedInterceptor } = vi.hoisted(() => {
  const state: { fn?: (config: { headers: Record<string, string> }) => { headers: Record<string, string> } } = {};

  return {
    createMock: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn((fn) => {
            state.fn = fn;
          }),
        },
      },
    })),
    getTokenMock: vi.fn(() => "token-123"),
    capturedInterceptor: state,
  };
});

vi.mock("axios", () => ({
  default: {
    create: createMock,
  },
}));

vi.mock("./storage", () => ({
  storage: {
    getToken: getTokenMock,
  },
}));

describe("api client", () => {
  it("configura baseURL e injeta Authorization quando houver token", async () => {
    await import("../api");

    expect(createMock).toHaveBeenCalledWith({
      baseURL: "http://localhost:3000",
    });

    const result = capturedInterceptor.fn?.({ headers: {} });

    expect(getTokenMock).toHaveBeenCalled();
    expect(result?.headers.Authorization).toBe("Bearer token-123");
  });
});
