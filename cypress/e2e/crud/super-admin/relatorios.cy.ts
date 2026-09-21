import { interceptarApis } from '../../../support/intercept'

describe('CRUD SUPER_ADMIN — Relatórios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
  })

  it('carrega a lista, aplica filtro e mostra exportação', () => {
    cy.visit('/relatorios')
    cy.get('[data-cy=pageRelatorios]').should('be.visible')
    cy.get('[data-cy=loadingRelatorios]').should('not.exist')
    cy.get('[data-cy=btnExportarExcel]').should('be.visible')
    cy.get('[data-cy=btnFiltrosRelatorio]').click()
    cy.get('[data-cy=painelFiltrosRelatorio]').should('be.visible')
    cy.get('[data-cy=selectFiltroStatus]').select('Membro Ativo')
    cy.get('[data-cy=btnLimparFiltros]').click()
    cy.get('[data-cy=pageRelatorios]').should('be.visible')
  })
})
