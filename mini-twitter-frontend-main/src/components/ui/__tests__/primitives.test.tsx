import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

describe("UI primitives", () => {
  it("renderiza Badge e Button", () => {
    render(
      <div>
        <Badge>Novo</Badge>
        <Button>Acao</Button>
      </div>,
    );

    expect(screen.getByText("Novo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acao" })).toBeInTheDocument();
  });

  it("renderiza Card e suas secoes", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Titulo</CardTitle>
          <CardDescription>Descricao</CardDescription>
        </CardHeader>
        <CardContent>Conteudo</CardContent>
        <CardFooter>Rodape</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Titulo")).toBeInTheDocument();
    expect(screen.getByText("Descricao")).toBeInTheDocument();
    expect(screen.getByText("Conteudo")).toBeInTheDocument();
    expect(screen.getByText("Rodape")).toBeInTheDocument();
  });

  it("renderiza Input e Textarea", () => {
    render(
      <div>
        <Input placeholder="Seu email" />
        <Textarea placeholder="Seu texto" />
      </div>,
    );

    expect(screen.getByPlaceholderText("Seu email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Seu texto")).toBeInTheDocument();
  });

  it("troca conteudo de Tabs", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Conteudo A</TabsContent>
        <TabsContent value="b">Conteudo B</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Conteudo A")).toBeInTheDocument();
  });
});
