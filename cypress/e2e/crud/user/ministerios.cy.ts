import { interceptarApis } from '../../../support/intercept'

describe('CRUD USER — Ministérios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('user')
  })

  it('consulta a lista e não cria, edita nem exclui', () => {
    cy.visit('/ministerios')
    cy.get('[data-cy=pageMinisterios]').should('be.visible')
    cy.get('[data-cy=loadingMinisterios]').should('not.exist')
    cy.get('[data-cy=btnNovoMinisterio]').should('not.exist')
    cy.get('[data-cy^=btnEditarMinisterio-]').should('not.exist')
    cy.get('[data-cy^=btnExcluirMinisterio-]').should('not.exist')
  })
})
