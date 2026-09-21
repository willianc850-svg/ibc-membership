import { interceptarApis } from '../../../support/intercept'
import { criarMinisterio, idMinisterioPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD TESOUREIRO — Ministérios', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
    cy.on('window:confirm', () => true)
  })

  it('cria e exclui um ministério', () => {
    const nome = nomeUnico('Ministério Tesoureiro')

    criarMinisterio(nome)
    idMinisterioPorNome(nome)
    cy.get<string>('@ministerioId').then((id) => {
      cy.get(`[data-cy=btnExcluirMinisterio-${id}]`).click()
    })
    cy.wait('@deleteMinisterios')
    cy.contains(nome).should('not.exist')
  })
})
