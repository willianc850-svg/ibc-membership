import { interceptarApis } from '../../../support/intercept'
import { criarPgm, idPgmPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD TESOUREIRO — PGM', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
    cy.on('window:confirm', () => true)
  })

  it('cria e exclui um PGM', () => {
    const nome = nomeUnico('PGM Tesoureiro')

    criarPgm(nome)
    idPgmPorNome(nome)
    cy.get<string>('@pgmId').then((id) => {
      cy.get(`[data-cy=btnExcluirPgm-${id}]`).click()
    })
    cy.wait('@deletePgm')
    cy.contains(nome).should('not.exist')
  })
})
