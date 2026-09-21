import { interceptarApis } from '../../../support/intercept'
import { dataHojeISO, nomeUnico } from '../../../support/helpers'

describe('CRUD TESOUREIRO — Reuniões', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
    cy.on('window:confirm', () => true)
  })

  it('cria e exclui uma reunião', () => {
    const titulo = nomeUnico('Reunião Tesoureiro')

    cy.visit('/reunioes/nova')
    cy.get('[data-cy=pageNovaReuniao]').should('be.visible')
    cy.get('[data-cy=inputTituloReuniao]').type(titulo)
    cy.get('[data-cy=inputDataReuniao]').type(dataHojeISO())
    cy.get('[data-cy=btnCriarReuniao]').click()
    cy.wait('@insertReunioes')
    cy.get('[data-cy=pageReuniao]', { timeout: 15000 }).should('be.visible')
    cy.get('[data-cy=btnExcluirReuniao]').click()
    cy.wait('@deleteReunioes')
    cy.get('[data-cy=pageReunioes]', { timeout: 15000 }).should('be.visible')
  })
})
