class PgmPage {
  selectorsList() {
    const selectors = {
      page: "[data-cy=pagePgm]",
      loading: "[data-cy=loadingPgms]",
      novo: "[data-cy=btnNovoPgm]",
      form: "[data-cy=formPgm]",
      nome: "[data-cy=inputNomePgm]",
      salvar: "[data-cy=btnSalvarPgm]",
      detalhe: "[data-cy=pagePgmDetalhe]",
      adicionar: "[data-cy=btnAdicionarMembroPgm]",
      busca: "[data-cy=inputBuscaMembroPgm]",
    };
    return selectors;
  }

  visitar() {
    cy.visit("/pgm");
    cy.get(this.selectorsList().page).should("be.visible");
    cy.get(this.selectorsList().loading).should("not.exist");
  }

  criar(nome: string) {
    const s = this.selectorsList();
    cy.get(s.novo).click();
    cy.get(s.form).should("be.visible");
    cy.get(s.nome).clear().type(nome);
    cy.get(s.salvar).click();
    cy.wait("@insertPgm", { timeout: 15000 });
    cy.contains("[data-cy^=pgmItem-]", nome).should("be.visible");
  }

  idPorNome(nome: string) {
    return cy
      .contains("[data-cy^=pgmItem-]", nome)
      .invoke("attr", "data-cy")
      .then((attr) => {
        return String(attr ?? "").replace("pgmItem-", "");
      });
  }

  abrir(id: string) {
    cy.get(`[data-cy=linkVerMembrosPgm-${id}]`).click();
    cy.get(this.selectorsList().detalhe).should("be.visible");
  }

  vincularMembro(nome: string) {
    const s = this.selectorsList();
    cy.get(s.adicionar).click();
    cy.get(s.busca).clear().type(nome);
    cy.contains("[data-cy^=btnVincularMembro-]", nome).click();
    cy.contains("[data-cy^=membroPgmItem-]", nome).should("be.visible");
  }

  desvincularPrimeiro(nome: string) {
    cy.contains("[data-cy^=membroPgmItem-]", nome)
      .invoke("attr", "data-cy")
      .then((attr) => {
        const id = String(attr ?? "").replace("membroPgmItem-", "");
        cy.get(`[data-cy=btnDesvincularMembro-${id}]`).click();
      });
    cy.contains("[data-cy^=membroPgmItem-]", nome).should("not.exist");
  }

  excluir(id: string) {
    cy.visit("/pgm");
    cy.get(`[data-cy=btnExcluirPgm-${id}]`).click();
    cy.wait("@deletePgm");
  }
}

export default new PgmPage();
