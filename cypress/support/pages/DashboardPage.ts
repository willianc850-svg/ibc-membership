class DashboardPage {
  selectorsList() {
    const selectors = {
      page: "[data-cy=pageDashboard]",
      loading: "[data-cy=loadingDashboard]",
      totalMembros: "[data-cy=totalMembros]",
      totalAtivos: "[data-cy=totalMembrosAtivos]",
      totalVisitantes: "[data-cy=totalVisitantes]",
      totalAfastados: "[data-cy=totalAfastados]",
      totalPgms: "[data-cy=totalPgms]",
      totalMinisterios: "[data-cy=totalMinisterios]",
      vazioStatus: "[data-cy=vazioStatus]",
      vazioGenero: "[data-cy=vazioGenero]",
      vazioFaixa: "[data-cy=vazioFaixaEtaria]",
      vazioAdmissoes: "[data-cy=vazioAdmissoes]",
      vazioEscolaridade: "[data-cy=vazioEscolaridade]",
      vazioBairros: "[data-cy=vazioBairros]",
    };
    return selectors;
  }

  visitar() {
    cy.visit("/dashboard");
    cy.get(this.selectorsList().page).should("be.visible");
    cy.get(this.selectorsList().loading).should("not.exist");
  }

  cardsVisiveis() {
    const s = this.selectorsList();
    cy.get(s.totalMembros).should("be.visible");
    cy.get(s.totalAtivos).should("be.visible");
    cy.get(s.totalVisitantes).should("be.visible");
    cy.get(s.totalAfastados).should("be.visible");
    cy.get(s.totalPgms).should("be.visible");
    cy.get(s.totalMinisterios).should("be.visible");
  }

  graficosRenderizam() {
    [
      "Status de membresia",
      "Distribuição por gênero",
      "Faixa etária",
      "Novos membros (últimos 6 meses)",
      "Escolaridade",
      "Principais bairros",
    ].forEach((titulo) => {
      cy.contains("h3", titulo).should("be.visible");
    });
  }

  estadosVazios() {
    const s = this.selectorsList();
    cy.get(s.vazioStatus).should("be.visible");
    cy.get(s.vazioGenero).should("be.visible");
    cy.get(s.vazioFaixa).should("be.visible");
    cy.get(s.vazioAdmissoes).should("be.visible");
    cy.get(s.vazioEscolaridade).should("be.visible");
    cy.get(s.vazioBairros).should("be.visible");
  }
}

export default new DashboardPage();
