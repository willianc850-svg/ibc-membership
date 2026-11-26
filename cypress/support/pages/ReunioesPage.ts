class ReunioesPage {
  selectorsList() {
    const selectors = {
      page: '[data-cy=pageReunioes]',
      loading: '[data-cy=loadingReunioes]',
      nova: '[data-cy=btnNovaReuniao]',
      pageNova: '[data-cy=pageNovaReuniao]',
      titulo: '[data-cy=inputTituloReuniao]',
      data: '[data-cy=inputDataReuniao]',
      local: '[data-cy=inputLocalReuniao]',
      pauta: '[data-cy=textareaPauta]',
      busca: '[data-cy=inputBuscaParticipante]',
      criar: '[data-cy=btnCriarReuniao]',
      detalhe: '[data-cy=pageReuniao]',
      criarAta: '[data-cy=btnCriarAta]',
      textareaAta: '[data-cy=textareaAta]',
      salvarAta: '[data-cy=btnSalvarAta]',
      textoAta: '[data-cy=textoAta]',
      pdf: '[data-cy=btnBaixarPdfAta]',
      finalizar: '[data-cy=btnFinalizarReuniao]',
      excluir: '[data-cy=btnExcluirReuniao]',
      filtroInicio: '[data-cy=inputDataInicio]',
      filtroFim: '[data-cy=inputDataFim]',
    }
    return selectors
  }

  visitar() {
    cy.visit('/reunioes')
    cy.get(this.selectorsList().page).should('be.visible')
    cy.get(this.selectorsList().loading).should('not.exist')
  }

  criarComParticipante(titulo: string, dataIso: string, nomeParticipante: string) {
    const s = this.selectorsList()
    cy.get(s.nova).click()
    cy.get(s.pageNova).should('be.visible')
    cy.get(s.titulo).type(titulo)
    cy.get(s.data).type(dataIso)
    cy.get(s.local).type('Templo')
    cy.get(s.pauta).type('Pauta de regressão')
    cy.get(s.busca).type(nomeParticipante)
    cy.contains('[data-cy^=btnAdicionarParticipante-]', nomeParticipante).click()
    cy.contains('[data-cy^=participanteItem-]', nomeParticipante).should('be.visible')
    cy.get(s.criar).click()
    cy.wait('@insertReunioes')
    cy.get(s.detalhe, { timeout: 15000 }).should('be.visible')
    cy.contains(titulo).should('be.visible')
  }

  salvarAta(texto: string) {
    const s = this.selectorsList()
    cy.get(s.criarAta).click()
    cy.get(s.textareaAta).clear().type(texto)
    cy.get(s.salvarAta).click()
    cy.wait('@updateReunioes')
    cy.get(s.textoAta).should('contain.text', texto)
  }

  baixarPdf() {
    cy.get(this.selectorsList().pdf).should('be.visible').click()
  }

  finalizar() {
    cy.get(this.selectorsList().finalizar).click()
    cy.contains('Finalizada').should('be.visible')
    cy.get(this.selectorsList().finalizar).should('not.exist')
  }

  filtrarTipo(tipo: string) {
    cy.get(`[data-cy=btnFiltroTipo-${tipo}]`).click()
  }

  filtrarData(inicio: string, fim: string) {
    const s = this.selectorsList()
    cy.get(s.filtroInicio).clear().type(inicio)
    cy.get(s.filtroFim).clear().type(fim)
  }

  excluirAberta() {
    cy.get(this.selectorsList().excluir).click()
    cy.wait('@deleteReunioes')
    cy.get(this.selectorsList().page, { timeout: 15000 }).should('be.visible')
  }
}

export default new ReunioesPage()
