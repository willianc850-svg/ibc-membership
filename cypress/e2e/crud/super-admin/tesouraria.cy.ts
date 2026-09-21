import { interceptarApis } from '../../../support/intercept'
import { idDeDataCy, nomeUnico } from '../../../support/helpers'

describe('CRUD SUPER_ADMIN — Tesouraria', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
  })

  it('cria, edita e exclui um lançamento', () => {
    const descricao = nomeUnico('Dízimo Teste')
    const descricaoEditada = `${descricao} Editado`
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = agora.getMonth() + 1

    cy.visit(`/tesouraria/${ano}/${mes}`)
    cy.get('[data-cy=pageTesourariaMes]').should('be.visible')
    cy.get('[data-cy=loadingLancamentos]').should('not.exist')

    cy.get('[data-cy=btnAdicionarLancamento-dizimos]').click()
    cy.get('[data-cy=formLancamento]').should('be.visible')
    cy.get('[data-cy=inputDescricaoLancamento]').clear().type(descricao)
    cy.get('[data-cy=inputValorLancamento]').clear().type('150.00')
    cy.get('[data-cy=btnSalvarLancamento]').click()
    cy.wait('@insertLancamentos')
    cy.contains(descricao).should('be.visible')

    cy.contains('[data-cy^=lancamentoItem-]', descricao)
      .invoke('attr', 'data-cy')
      .then((attr) => {
        const id = idDeDataCy(attr, 'lancamentoItem-')
        cy.get(`[data-cy=btnEditarLancamento-${id}]`).click()
      })
    cy.get('[data-cy=formLancamento]').should('be.visible')
    cy.get('[data-cy=inputDescricaoLancamento]').clear().type(descricaoEditada)
    cy.get('[data-cy=btnSalvarLancamento]').click()
    cy.wait('@updateLancamentos')
    cy.contains(descricaoEditada).should('be.visible')

    cy.contains('[data-cy^=lancamentoItem-]', descricaoEditada)
      .invoke('attr', 'data-cy')
      .then((attr) => {
        const id = idDeDataCy(attr, 'lancamentoItem-')
        cy.get(`[data-cy=btnExcluirLancamento-${id}]`).click()
      })
    cy.get('[data-cy=modalConfirmacao]').should('be.visible')
    cy.get('[data-cy=btnConfirmarModal]').click()
    cy.wait('@deleteLancamentos')
    cy.contains(descricaoEditada).should('not.exist')
  })
})
