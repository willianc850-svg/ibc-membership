import { interceptarApis } from '../../../support/intercept'

describe('CRUD USER — Configurações', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('user')
  })

  it('abre o próprio perfil e não gerencia usuários', () => {
    cy.visit('/configuracoes')
    cy.get('[data-cy=pageConfiguracoes]').should('be.visible')
    cy.get('[data-cy=formPerfil]').should('be.visible')
    cy.get('[data-cy=btnNovoUsuario]').should('not.exist')
    cy.get('[data-cy=formConviteUsuario]').should('not.exist')
    cy.get('[data-cy^=selectRoleUsuario-]').should('not.exist')
  })
})
