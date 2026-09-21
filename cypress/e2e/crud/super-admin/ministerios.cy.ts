import { interceptarApis } from '../../../support/intercept'
import { criarMinisterio, idMinisterioPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD SUPER_ADMIN — Ministérios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
    cy.on('window:confirm', () => true)
  })

  it('cria, edita e exclui um ministério', () => {
    const nome = nomeUnico('Ministério Teste')
    const nomeEditado = `${nome} Editado`

    criarMinisterio(nome)
    idMinisterioPorNome(nome)
    cy.get<string>('@ministerioId').then((id) => {
      cy.get(`[data-cy=btnEditarMinisterio-${id}]`).click()
    })
    cy.get('[data-cy=formMinisterio]').should('be.visible')
    cy.get('[data-cy=inputNomeMinisterio]').clear().type(nomeEditado)
    cy.get('[data-cy=btnSalvarMinisterio]').click()
    cy.wait('@updateMinisterios')
    cy.contains('[data-cy^=ministerioItem-]', nomeEditado).should('be.visible')

    idMinisterioPorNome(nomeEditado)
    cy.get<string>('@ministerioId').then((id) => {
      cy.get(`[data-cy=btnExcluirMinisterio-${id}]`).click()
    })
    cy.wait('@deleteMinisterios')
    cy.contains(nomeEditado).should('not.exist')
  })
})
