import axios from "axios";
import { getApiError } from "../error";

describe("getApiError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna mensagem da API quando erro Axios", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {
          error: "Falha da API",
        },
      },
    };

    expect(getApiError(error)).toBe("Falha da API");
  });

  it("retorna fallback quando nao for AxiosError", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    expect(getApiError(new Error("x"), "Fallback")).toBe("Fallback");
  });
});
