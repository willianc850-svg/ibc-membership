import { interceptarApis } from '../../../support/intercept'

describe('CRUD ADMIN — Relatórios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('admin')
  })

  it('carrega a lista e aplica filtro', () => {
    cy.visit('/relatorios')
    cy.get('[data-cy=pageRelatorios]').should('be.visible')
    cy.get('[data-cy=loadingRelatorios]').should('not.exist')
    cy.get('[data-cy=btnExportarExcel]').should('be.visible')
    cy.get('[data-cy=btnFiltrosRelatorio]').click()
    cy.get('[data-cy=painelFiltrosRelatorio]').should('be.visible')
    cy.get('[data-cy=selectFiltroStatus]').select('Membro Ativo')
    cy.get('[data-cy=btnLimparFiltros]').click()
  })
})
