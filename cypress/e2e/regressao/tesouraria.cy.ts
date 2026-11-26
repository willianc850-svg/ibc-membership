import { interceptarApis } from "../../support/intercept";
import { nomeUnico } from "../../support/helpers";
import tesourariaPage from "../../support/pages/TesourariaPage";

describe("Regressão — Tesouraria", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("tesoureiro");
  });

  it("lança uma oferta e o interruptor Conta tira o valor do total", () => {
    const descricao = nomeUnico("Oferta Regressao");
    tesourariaPage.visitarMesAtual();

    cy.get(tesourariaPage.selectorsList().totalEntradas)
      .invoke("text")
      .then((antes) => {
        tesourariaPage.adicionarOferta(descricao, "50.00", true);
        cy.get(tesourariaPage.selectorsList().totalEntradas).should(
          "not.have.text",
          antes,
        );
        tesourariaPage.desligarConta(descricao);
        cy.contains(descricao).should("be.visible");
        cy.get(tesourariaPage.selectorsList().totalEntradas).should(
          "have.text",
          antes,
        );
        tesourariaPage.excluir(descricao);
      });
  });
});
