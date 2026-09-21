import { interceptarApis, mockConviteUsuario } from '../../../support/intercept'

describe('CRUD ADMIN — Configurações', () => {
  beforeEach(() => {
    interceptarApis()
    mockConviteUsuario()
    cy.loginAs('admin')
  })

  it('envia convite mockado e não altera role', () => {
    cy.visit('/configuracoes')
    cy.get('[data-cy=pageConfiguracoes]').should('be.visible')
    cy.get('[data-cy=btnNovoUsuario]').click()
    cy.get('[data-cy=formConviteUsuario]').should('be.visible')
    cy.get('[data-cy=inputNomeConvite]').type('Convidado Admin')
    cy.get('[data-cy=inputEmailConvite]').type(`admin.convidado.${Date.now()}@teste.com`)
    cy.get('[data-cy=btnEnviarConvite]').click()
    cy.wait('@convidar')
    cy.get('[data-cy=msgSucessoUsuario]').should('be.visible')
    cy.get('[data-cy^=selectRoleUsuario-]').should('not.exist')
  })
})
