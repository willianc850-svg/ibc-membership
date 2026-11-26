class RelatoriosPage {
  selectorsList() {
    const selectors = {
      page: '[data-cy=pageRelatorios]',
      loading: '[data-cy=loadingRelatorios]',
      filtros: '[data-cy=btnFiltrosRelatorio]',
      painel: '[data-cy=painelFiltrosRelatorio]',
      status: '[data-cy=selectFiltroStatus]',
      exportar: '[data-cy=btnExportarExcel]',
      total: '[data-cy=totalRelatorios]',
    }
    return selectors
  }

  visitar() {
    cy.visit('/relatorios')
    cy.get(this.selectorsList().page).should('be.visible')
    cy.get(this.selectorsList().loading).should('not.exist')
  }

  abrirFiltros() {
    cy.get(this.selectorsList().filtros).click()
    cy.get(this.selectorsList().painel).should('be.visible')
  }

  filtrarStatus(status: string) {
    cy.get(this.selectorsList().status).select(status)
  }

  exportarExcel() {
    cy.get(this.selectorsList().exportar).click()
  }
}

export default new RelatoriosPage()
