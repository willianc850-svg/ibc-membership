import { interceptarApis } from '../../../support/intercept'
import { dataHojeISO, nomeUnico } from '../../../support/helpers'

describe('CRUD SUPER_ADMIN — Reuniões', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
    cy.on('window:confirm', () => true)
  })

  it('cria, consulta, edita a ATA e exclui uma reunião', () => {
    const titulo = nomeUnico('Reunião Teste')

    cy.visit('/reunioes/nova')
    cy.get('[data-cy=pageNovaReuniao]').should('be.visible')
    cy.get('[data-cy=inputTituloReuniao]').type(titulo)
    cy.get('[data-cy=inputDataReuniao]').type(dataHojeISO())
    cy.get('[data-cy=inputLocalReuniao]').type('Templo')
    cy.get('[data-cy=textareaPauta]').type('Pauta de teste Cypress')
    cy.get('[data-cy=btnCriarReuniao]').click()
    cy.wait('@insertReunioes')
    cy.get('[data-cy=pageReuniao]', { timeout: 15000 }).should('be.visible')
    cy.contains(titulo).should('be.visible')

    cy.get('[data-cy=btnCriarAta]').click()
    cy.get('[data-cy=textareaAta]').clear().type('ATA gerada pelo teste Cypress.')
    cy.get('[data-cy=btnSalvarAta]').click()
    cy.wait('@updateReunioes')
    cy.get('[data-cy=textoAta]').should('contain.text', 'ATA gerada pelo teste Cypress.')

    cy.get('[data-cy=btnExcluirReuniao]').click()
    cy.wait('@deleteReunioes')
    cy.get('[data-cy=pageReunioes]', { timeout: 15000 }).should('be.visible')
    cy.contains(titulo).should('not.exist')
  })
})
