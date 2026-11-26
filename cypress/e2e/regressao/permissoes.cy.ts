import { interceptarApis } from "../../support/intercept";
import layoutPage from "../../support/pages/LayoutPage";
import membrosPage from "../../support/pages/MembrosPage";
import tesourariaPage from "../../support/pages/TesourariaPage";
import configuracoesPage from "../../support/pages/ConfiguracoesPage";

describe("Regressão — Permissões", () => {
  beforeEach(() => {
    interceptarApis();
  });

  it("USER não cria membro e não abre reuniões, relatórios, tesouraria nem documentos", () => {
    cy.loginAs("user");
    membrosPage.visitarLista();
    cy.get(membrosPage.selectorsList().novo).should("not.exist");
    cy.get("[data-cy^=btnDeletarMembroDesktop-]").should("not.exist");
    layoutPage.menuNaoDeveExistir(
      "Reunioes",
      "Relatorios",
      "Tesouraria",
      "Documentos",
    );
    layoutPage.abrirRotaBloqueada("/reunioes");
    layoutPage.abrirRotaBloqueada("/relatorios");
    layoutPage.abrirRotaBloqueada("/tesouraria");
    layoutPage.abrirRotaBloqueada("/documentos");
    configuracoesPage.visitar();
    configuracoesPage.secaoUsuariosOculta();

    cy.request({
      method: "POST",
      url: "/api/admin/usuarios",
      failOnStatusCode: false,
      body: {
        email: "user-bloqueado@teste.com",
        nome: "Bloqueado",
        role: "USER",
      },
    })
      .its("status")
      .should("eq", 403);
  });

  it("ADMIN vê documentos, não vê tesouraria e não cria tesoureiro", () => {
    cy.loginAs("admin");
    layoutPage.menuNaoDeveExistir("Tesouraria");
    layoutPage.menuDeveExistir("Documentos");
    layoutPage.abrirRotaBloqueada("/tesouraria");
    cy.visit("/documentos");
    cy.get("[data-cy=pageDocumentos]").should("be.visible");
    configuracoesPage.visitar();
    configuracoesPage.secaoUsuariosVisivel();
    configuracoesPage.soConvidaUsuario();

    cy.request({
      method: "POST",
      url: "/api/admin/usuarios",
      failOnStatusCode: false,
      body: {
        email: "admin-nao-cria@teste.com",
        nome: "Nao",
        role: "TESOUREIRO",
      },
    })
      .its("status")
      .should("eq", 403);
  });

  it("TESOUREIRO vê tesouraria e não vê documentos", () => {
    cy.loginAs("tesoureiro");
    layoutPage.menuDeveExistir("Tesouraria");
    layoutPage.menuNaoDeveExistir("Documentos");
    tesourariaPage.visitarResumo();
    layoutPage.abrirRotaBloqueada("/documentos");
    configuracoesPage.visitar();
    configuracoesPage.soConvidaUsuario();

    cy.request({
      method: "POST",
      url: "/api/admin/usuarios",
      failOnStatusCode: false,
      body: {
        email: "tesoureiro-nao-cria@teste.com",
        nome: "Nao",
        role: "ADMIN",
      },
    })
      .its("status")
      .should("eq", 403);
  });

  it("SUPER_ADMIN vê tesouraria e documentos", () => {
    cy.loginAs("superAdmin");
    layoutPage.menuDeveExistir("Tesouraria", "Documentos");
    tesourariaPage.visitarResumo();
    cy.visit("/documentos");
    cy.get("[data-cy=pageDocumentos]").should("be.visible");
  });
});
