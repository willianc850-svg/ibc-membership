import { interceptarApis, mockConviteUsuario } from '../../../support/intercept'

describe('CRUD SUPER_ADMIN — Configurações', () => {
  beforeEach(() => {
    interceptarApis()
    mockConviteUsuario()
    cy.loginAs('superAdmin')
  })

  it('envia convite mockado e altera/restaura a role de um usuário de teste', () => {
    cy.visit('/configuracoes')
    cy.get('[data-cy=pageConfiguracoes]').should('be.visible')
    cy.wait('@listarUsuarios')
    cy.get('[data-cy=btnNovoUsuario]').click()
    cy.get('[data-cy=formConviteUsuario]').should('be.visible')
    cy.get('[data-cy=inputNomeConvite]').type('Convidado Cypress')
    cy.get('[data-cy=inputEmailConvite]').type(`convidado.${Date.now()}@teste.com`)
    cy.get('[data-cy=selectRoleConvite]').select('USER')
    cy.get('[data-cy=btnEnviarConvite]').click()
    cy.wait('@convidar')
    cy.get('[data-cy=msgSucessoUsuario]').should('be.visible')

    cy.contains('[data-cy^=usuarioItem-]', 'usuario@teste.com')
      .find('[data-cy^=selectRoleUsuario-]')
      .should('have.value', 'USER')
      .select('ADMIN')
    cy.wait('@alterarRoleUsuario').its('response.statusCode').should('eq', 200)

    cy.contains('[data-cy^=usuarioItem-]', 'usuario@teste.com')
      .find('[data-cy^=selectRoleUsuario-]')
      .should('have.value', 'ADMIN')
      .select('USER')
    cy.wait('@alterarRoleUsuario').its('response.statusCode').should('eq', 200)
    cy.contains('[data-cy^=usuarioItem-]', 'usuario@teste.com')
      .find('[data-cy^=selectRoleUsuario-]')
      .should('have.value', 'USER')
  })
})
