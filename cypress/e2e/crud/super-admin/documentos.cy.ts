import { interceptarApis } from '../../../support/intercept'
import { arquivoPdfFake, idDeDataCy, nomeUnico } from '../../../support/helpers'

describe('CRUD SUPER_ADMIN — Documentos', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
  })

  it('anexa, lista e exclui um documento', () => {
    const titulo = nomeUnico('ATA Teste')

    cy.visit('/documentos')
    cy.get('[data-cy=pageDocumentos]').should('be.visible')
    cy.get('[data-cy=loadingDocumentos]').should('not.exist')
    cy.get('[data-cy=btnNovoDocumento]').click()
    cy.get('[data-cy=formDocumento]').should('be.visible')
    cy.get('[data-cy=inputTituloDocumento]').type(titulo)
    cy.get('[data-cy=selectTipoDocumento]').select('ata')
    cy.get('[data-cy=fileDocumento]').selectFile(arquivoPdfFake())
    cy.get('[data-cy=btnSalvarDocumento]').click()
    cy.wait('@uploadStorage')
    cy.wait('@insertDocumentos')
    cy.contains('[data-cy^=documentoItem-]', titulo).should('be.visible')

    cy.contains('[data-cy^=documentoItem-]', titulo)
      .invoke('attr', 'data-cy')
      .then((attr) => {
        const id = idDeDataCy(attr, 'documentoItem-')
        cy.get(`[data-cy=btnExcluirDocumento-${id}]`).click()
      })
    cy.get('[data-cy=modalConfirmacao]').should('be.visible')
    cy.get('[data-cy=btnConfirmarModal]').click()
    cy.wait('@deleteDocumentos')
    cy.contains(titulo).should('not.exist')
  })
})
