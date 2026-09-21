import { interceptarApis } from '../../../support/intercept'

describe('CRUD USER — Membros', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('user')
  })

  it('consulta a lista e não cria nem exclui', () => {
    cy.visit('/membros')
    cy.get('[data-cy=pageMembros]').should('be.visible')
    cy.get('[data-cy=loadingMembros]').should('not.exist')
    cy.get('[data-cy=btnNovoMembro]').should('not.exist')
    cy.get('[data-cy=btnCadastrosPendentes]').should('not.exist')
    cy.get('[data-cy^=btnDeletarMembroDesktop-]').should('not.exist')
    cy.get('[data-cy^=btnEditarMembroDesktop-]').should('not.exist')

    cy.visit('/membros/novo')
    cy.get('[data-cy=msgAcessoRestrito]').should('be.visible')

    cy.visit('/membros')
    cy.get('[data-cy=pageMembros]').should('be.visible')
    cy.get('[data-cy=loadingMembros]').should('not.exist')
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=vazioMembros]').length) {
        cy.get('[data-cy=vazioMembros]').should('be.visible')
        return
      }
      cy.get('[data-cy^=btnVerMembroDesktop-]').first().click()
      cy.get('[data-cy=pagePerfilMembro]').should('be.visible')
      cy.get('[data-cy=btnEditarPerfil]').should('not.exist')
      cy.get('[data-cy=btnExcluirMembro]').should('not.exist')
    })
  })
})
