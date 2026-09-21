import { interceptarApis } from '../../../support/intercept'

describe('CRUD USER — PGM', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('user')
  })

  it('consulta a lista e não cria, edita nem exclui', () => {
    cy.visit('/pgm')
    cy.get('[data-cy=pagePgm]').should('be.visible')
    cy.get('[data-cy=loadingPgms]').should('not.exist')
    cy.get('[data-cy=btnNovoPgm]').should('not.exist')
    cy.get('[data-cy^=btnEditarPgm-]').should('not.exist')
    cy.get('[data-cy^=btnExcluirPgm-]').should('not.exist')
  })
})
