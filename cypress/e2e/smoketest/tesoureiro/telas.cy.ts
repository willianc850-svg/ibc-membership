import { interceptarApis } from '../../../support/intercept'
import {
  abrirTela,
  menuDeveExistir,
  menuNaoDeveExistir,
  rotaBloqueada,
} from '../../../support/helpers'

describe('Smoke TESOUREIRO', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('tesoureiro')
  })

  it('abre tesouraria e bloqueia documentos', () => {
    menuDeveExistir(
      'Dashboard',
      'Membros',
      'Reunioes',
      'Pgm',
      'Ministerios',
      'Tesouraria',
      'Relatorios',
      'Configuracoes',
    )
    menuNaoDeveExistir('Documentos')

    abrirTela('/dashboard', 'pageDashboard')
    abrirTela('/membros', 'pageMembros', 'loadingMembros')
    abrirTela('/reunioes', 'pageReunioes', 'loadingReunioes')
    abrirTela('/pgm', 'pagePgm', 'loadingPgms')
    abrirTela('/ministerios', 'pageMinisterios', 'loadingMinisterios')
    abrirTela('/tesouraria', 'pageTesouraria', 'loadingTesouraria')
    abrirTela('/relatorios', 'pageRelatorios', 'loadingRelatorios')
    abrirTela('/configuracoes', 'pageConfiguracoes')

    rotaBloqueada('/documentos')
  })
})
