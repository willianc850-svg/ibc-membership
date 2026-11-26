class TesourariaPage {
  selectorsList() {
    const selectors = {
      page: "[data-cy=pageTesouraria]",
      loading: "[data-cy=loadingTesouraria]",
      mes: "[data-cy=pageTesourariaMes]",
      loadingMes: "[data-cy=loadingLancamentos]",
      descricao: "[data-cy=inputDescricaoLancamento]",
      valor: "[data-cy=inputValorLancamento]",
      entraNoTotal: "[data-cy=checkEntraNoTotal]",
      salvar: "[data-cy=btnSalvarLancamento]",
      totalEntradas: "[data-cy=totalEntradasMes]",
    };
    return selectors;
  }

  visitarResumo() {
    cy.visit("/tesouraria");
    cy.get(this.selectorsList().page).should("be.visible");
    cy.get(this.selectorsList().loading).should("not.exist");
  }

  visitarMesAtual() {
    const agora = new Date();
    cy.visit(`/tesouraria/${agora.getFullYear()}/${agora.getMonth() + 1}`);
    cy.get(this.selectorsList().mes).should("be.visible");
    cy.get(this.selectorsList().loadingMes).should("not.exist");
  }

  adicionarOferta(descricao: string, valor: string, conta: boolean) {
    const s = this.selectorsList();
    cy.get("[data-cy=btnAdicionarLancamento-ofertas]").click();
    cy.get("[data-cy=formLancamento]").should("be.visible");
    cy.get(s.descricao).clear().type(descricao);
    cy.get(s.valor).clear().type(valor);
    if (!conta) cy.get(s.entraNoTotal).uncheck();
    cy.get(s.salvar).click();
    cy.wait("@insertLancamentos");
    cy.contains(descricao).should("be.visible");
  }

  desligarConta(descricao: string) {
    cy.contains("[data-cy^=lancamentoItem-]", descricao)
      .invoke("attr", "data-cy")
      .then((attr) => {
        const id = String(attr ?? "").replace("lancamentoItem-", "");
        cy.get(`[data-cy=toggleContaLancamento-${id}]`).click();
        cy.wait("@updateLancamentos");
        cy.get(`[data-cy=lancamentoItem-${id}]`).should("be.visible");
      });
  }

  excluir(descricao: string) {
    cy.contains("[data-cy^=lancamentoItem-]", descricao)
      .invoke("attr", "data-cy")
      .then((attr) => {
        const id = String(attr ?? "").replace("lancamentoItem-", "");
        cy.get(`[data-cy=btnExcluirLancamento-${id}]`).click();
      });
    cy.get("[data-cy=btnConfirmarModal]").click();
    cy.wait("@deleteLancamentos");
    cy.contains(descricao).should("not.exist");
  }
}

export default new TesourariaPage();
