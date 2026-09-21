import { interceptarApis } from '../../../support/intercept'
import { criarPgm, idPgmPorNome, nomeUnico } from '../../../support/helpers'

describe('CRUD ADMIN — PGM', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('admin')
    cy.on('window:confirm', () => true)
  })

  it('cria, edita e exclui um PGM', () => {
    const nome = nomeUnico('PGM Admin')
    const nomeEditado = `${nome} Editado`

    criarPgm(nome)
    idPgmPorNome(nome)
    cy.get<string>('@pgmId').then((id) => {
      cy.get(`[data-cy=btnEditarPgm-${id}]`).click()
    })
    cy.get('[data-cy=inputNomePgm]').clear().type(nomeEditado)
    cy.get('[data-cy=btnSalvarPgm]').click()
    cy.wait('@updatePgm')
    cy.contains('[data-cy^=pgmItem-]', nomeEditado).should('be.visible')

    idPgmPorNome(nomeEditado)
    cy.get<string>('@pgmId').then((id) => {
      cy.get(`[data-cy=btnExcluirPgm-${id}]`).click()
    })
    cy.wait('@deletePgm')
    cy.contains(nomeEditado).should('not.exist')
  })
})
