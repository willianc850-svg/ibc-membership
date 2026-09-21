import { interceptarApis } from '../../../support/intercept'
import { criarMembro, idMembroPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD TESOUREIRO — Membros', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
  })

  it('cria, consulta e edita um membro, sem excluir', () => {
    const nome = nomeUnico('Membro Tesoureiro')
    const nomeEditado = `${nome} Editado`

    criarMembro(nome)
    cy.get('[data-cy^=btnDeletarMembroDesktop-]').should('not.exist')

    idMembroPorNome(nome)
    cy.get<string>('@membroId').then((id) => {
      cy.get(`[data-cy=btnVerMembroDesktop-${id}]`).click()
    })
    cy.get('[data-cy=pagePerfilMembro]').should('be.visible')
    cy.get('[data-cy=btnExcluirMembro]').should('not.exist')
    cy.get('[data-cy=btnEditarPerfil]').click()
    cy.get('[data-cy=pageEditarMembro]').should('be.visible')
    cy.get('[data-cy=inputNomeCompleto]').clear().type(nomeEditado)
    cy.get('[data-cy=btnSalvarAlteracoes]').click()
    cy.wait('@updateMembros')
    cy.get('[data-cy=pagePerfilMembro]', { timeout: 15000 }).should('be.visible')
    cy.contains(nomeEditado).should('be.visible')
  })
})
