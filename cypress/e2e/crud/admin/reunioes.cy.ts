import { interceptarApis } from '../../../support/intercept'
import { dataHojeISO, nomeUnico } from '../../../support/helpers'

describe('CRUD ADMIN — Reuniões', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('admin')
    cy.on('window:confirm', () => true)
  })

  it('cria, consulta e exclui uma reunião', () => {
    const titulo = nomeUnico('Reunião Admin')

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
    cy.contains(titulo).should('not.exist')
  })
})
