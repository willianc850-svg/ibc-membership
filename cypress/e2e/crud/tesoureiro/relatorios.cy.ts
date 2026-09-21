import { interceptarApis } from '../../../support/intercept'

describe('CRUD TESOUREIRO — Relatórios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
  })

  it('carrega a lista e mostra exportação', () => {
    cy.visit('/relatorios')
    cy.get('[data-cy=pageRelatorios]').should('be.visible')
    cy.get('[data-cy=loadingRelatorios]').should('not.exist')
    cy.get('[data-cy=btnExportarExcel]').should('be.visible')
  })
})
