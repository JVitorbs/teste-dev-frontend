import { cn } from "../utils";

describe("cn", () => {
  it("combina classes e resolve conflitos do tailwind", () => {
    expect(cn("p-2", "p-4", false && "hidden", "text-sm")).toBe("p-4 text-sm");
  });
});
