import { interceptarApis } from '../../../support/intercept'
import {
  abrirTela,
  menuDeveExistir,
  menuNaoDeveExistir,
  rotaBloqueada,
} from '../../../support/helpers'

describe('Smoke ADMIN', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('admin')
  })

  it('abre as telas permitidas e bloqueia tesouraria', () => {
    menuDeveExistir(
      'Dashboard',
      'Membros',
      'Reunioes',
      'Pgm',
      'Ministerios',
      'Documentos',
      'Relatorios',
      'Configuracoes',
    )
    menuNaoDeveExistir('Tesouraria')

    abrirTela('/dashboard', 'pageDashboard')
    abrirTela('/membros', 'pageMembros', 'loadingMembros')
    abrirTela('/reunioes', 'pageReunioes', 'loadingReunioes')
    abrirTela('/pgm', 'pagePgm', 'loadingPgms')
    abrirTela('/ministerios', 'pageMinisterios', 'loadingMinisterios')
    abrirTela('/documentos', 'pageDocumentos', 'loadingDocumentos')
    abrirTela('/relatorios', 'pageRelatorios', 'loadingRelatorios')
    abrirTela('/configuracoes', 'pageConfiguracoes')

    rotaBloqueada('/tesouraria')
  })
})
