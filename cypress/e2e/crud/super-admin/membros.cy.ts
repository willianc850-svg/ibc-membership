import { interceptarApis } from '../../../support/intercept'
import { criarMembro, idMembroPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD SUPER_ADMIN — Membros', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
  })

  it('cria, consulta, edita e exclui um membro', () => {
    const nome = nomeUnico('Membro Teste')
    const nomeEditado = `${nome} Editado`

    criarMembro(nome)

    idMembroPorNome(nome)
    cy.get<string>('@membroId').then((id) => {
      cy.get(`[data-cy=btnVerMembroDesktop-${id}]`).click()
    })
    cy.get('[data-cy=pagePerfilMembro]').should('be.visible')
    cy.contains(nome).should('be.visible')

    cy.get('[data-cy=btnEditarPerfil]').click()
    cy.get('[data-cy=pageEditarMembro]').should('be.visible')
    cy.get('[data-cy=inputNomeCompleto]').clear().type(nomeEditado)
    cy.get('[data-cy=btnSalvarAlteracoes]').click()
    cy.wait('@updateMembros')
    cy.get('[data-cy=pagePerfilMembro]', { timeout: 15000 }).should('be.visible')
    cy.contains(nomeEditado).should('be.visible')

    cy.visit('/membros')
    cy.get('[data-cy=loadingMembros]').should('not.exist')
    idMembroPorNome(nomeEditado)
    cy.get<string>('@membroId').then((id) => {
      cy.get(`[data-cy=btnDeletarMembroDesktop-${id}]`).click()
    })
    cy.get('[data-cy=modalConfirmacao]').should('be.visible')
    cy.get('[data-cy=btnConfirmarModal]').click()
    cy.wait('@deleteMembros')
    cy.get('[data-cy=inputBuscaMembro]').clear().type(nomeEditado)
    cy.get('[data-cy=vazioMembros]').should('be.visible')
  })
})
