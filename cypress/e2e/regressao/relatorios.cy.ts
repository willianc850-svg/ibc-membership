import { interceptarApis } from "../../support/intercept";
import relatoriosPage from "../../support/pages/RelatoriosPage";

describe("Regressão — Relatórios", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
  });

  it("filtra a lista e exporta Excel com a aba Resumo", () => {
    const hoje = new Date().toISOString().slice(0, 10);
    const arquivo = `cypress/downloads/relatorio-membros-${hoje}.xlsx`;

    relatoriosPage.visitar();
    cy.get(relatoriosPage.selectorsList().total).should("be.visible");

    relatoriosPage.abrirFiltros();
    relatoriosPage.filtrarStatus("Membro Ativo");
    cy.get("[data-cy^=relatorioMembroItem-]").each(($item) => {
      cy.wrap($item).should("contain.text", "Membro Ativo");
    });

    cy.task("apagarArquivo", arquivo);
    relatoriosPage.exportarExcel();
    cy.readFile(arquivo, null, { timeout: 15000 }).should("exist");
    cy.task("lerPlanilha", arquivo).then(
      (dados: { abas: string[]; resumo: unknown[][] }) => {
        expect(dados.abas).to.include.members(["Membros", "Resumo"]);
        expect(JSON.stringify(dados.resumo)).to.contain("Membro Ativo");
      },
    );
  });
});
