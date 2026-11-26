class MinisteriosPage {
  selectorsList() {
    const selectors = {
      page: '[data-cy=pageMinisterios]',
      loading: '[data-cy=loadingMinisterios]',
      novo: '[data-cy=btnNovoMinisterio]',
      form: '[data-cy=formMinisterio]',
      nome: '[data-cy=inputNomeMinisterio]',
      descricao: '[data-cy=inputDescricaoMinisterio]',
      salvar: '[data-cy=btnSalvarMinisterio]',
      detalhe: '[data-cy=pageMinisterioDetalhe]',
      adicionar: '[data-cy=btnAdicionarMembroMinisterio]',
      formVinculo: '[data-cy=formVincularMinisterio]',
      busca: '[data-cy=inputBuscaMembroMinisterio]',
      funcao: '[data-cy=inputFuncaoMinisterio]',
      confirmar: '[data-cy=btnConfirmarVinculo]',
      cardLider: '[data-cy=cardLiderMinisterio]',
    }
    return selectors
  }

  visitar() {
    cy.visit('/ministerios')
    cy.get(this.selectorsList().page).should('be.visible')
    cy.get(this.selectorsList().loading).should('not.exist')
  }

  criar(nome: string) {
    const s = this.selectorsList()
    cy.get(s.novo).click()
    cy.get(s.form).should('be.visible')
    cy.get(s.nome).clear().type(nome)
    cy.get(s.descricao).clear().type('Descrição de regressão')
    cy.get(s.salvar).click()
    cy.wait('@insertMinisterios', { timeout: 15000 })
    cy.contains('[data-cy^=ministerioItem-]', nome).should('be.visible')
  }

  idPorNome(nome: string) {
    return cy.contains('[data-cy^=ministerioItem-]', nome).invoke('attr', 'data-cy').then((attr) => {
      return String(attr ?? '').replace('ministerioItem-', '')
    })
  }

  abrir(id: string) {
    cy.get(`[data-cy=linkVerMembrosMinisterio-${id}]`).click()
    cy.get(this.selectorsList().detalhe).should('be.visible')
  }

  vincularComFuncao(nome: string, funcao: string) {
    const s = this.selectorsList()
    cy.get(s.adicionar).click()
    cy.get(s.formVinculo).should('be.visible')
    cy.get(s.busca).clear().type(nome)
    cy.contains('[data-cy^=btnSelecionarMembro-]', nome).click()
    cy.get(s.funcao).clear().type(funcao)
    cy.get(s.confirmar).click()
    cy.contains('[data-cy^=membroMinisterioItem-]', nome).should('be.visible')
    cy.contains(funcao).should('be.visible')
  }

  definirLiderDoMembro(nome: string) {
    cy.contains('[data-cy^=membroMinisterioItem-]', nome)
      .invoke('attr', 'data-cy')
      .then((attr) => {
        const id = String(attr ?? '').replace('membroMinisterioItem-', '')
        cy.get(`[data-cy=btnDefinirLider-${id}]`).click()
      })
    cy.get(this.selectorsList().cardLider).should('contain.text', nome)
  }

  desvincular(nome: string) {
    cy.contains('[data-cy^=membroMinisterioItem-]', nome)
      .invoke('attr', 'data-cy')
      .then((attr) => {
        const id = String(attr ?? '').replace('membroMinisterioItem-', '')
        cy.get(`[data-cy=btnDesvincularMembro-${id}]`).click()
      })
    cy.contains('[data-cy^=membroMinisterioItem-]', nome).should('not.exist')
  }

  excluir(id: string) {
    cy.visit('/ministerios')
    cy.get(`[data-cy=btnExcluirMinisterio-${id}]`).click()
    cy.wait('@deleteMinisterios')
  }
}

export default new MinisteriosPage()
