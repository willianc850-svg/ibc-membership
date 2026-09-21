import { interceptarApis } from '../../../support/intercept'
import {
  abrirTela,
  menuDeveExistir,
} from '../../../support/helpers'

describe('Smoke SUPER_ADMIN', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('superAdmin')
  })

  it('abre as telas permitidas e o menu completo', () => {
    menuDeveExistir(
      'Dashboard',
      'Membros',
      'Reunioes',
      'Pgm',
      'Ministerios',
      'Tesouraria',
      'Documentos',
      'Relatorios',
      'Configuracoes',
    )

    abrirTela('/dashboard', 'pageDashboard')
    abrirTela('/membros', 'pageMembros', 'loadingMembros')
    abrirTela('/reunioes', 'pageReunioes', 'loadingReunioes')
    abrirTela('/pgm', 'pagePgm', 'loadingPgms')
    abrirTela('/ministerios', 'pageMinisterios', 'loadingMinisterios')
    abrirTela('/tesouraria', 'pageTesouraria', 'loadingTesouraria')
    abrirTela('/documentos', 'pageDocumentos', 'loadingDocumentos')
    abrirTela('/relatorios', 'pageRelatorios', 'loadingRelatorios')
    abrirTela('/configuracoes', 'pageConfiguracoes')
  })
})
