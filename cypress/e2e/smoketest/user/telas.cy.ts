import { interceptarApis } from '../../../support/intercept'
import {
  abrirTela,
  menuDeveExistir,
  menuNaoDeveExistir,
  rotaBloqueada,
} from '../../../support/helpers'

describe('Smoke USER', () => {
  beforeEach(() => {
    interceptarApis()
    cy.loginAs('user')
  })

  it('abre só as telas de consulta e bloqueia o restante', () => {
    menuDeveExistir(
      'Dashboard',
      'Membros',
      'Pgm',
      'Ministerios',
      'Configuracoes',
    )
    menuNaoDeveExistir('Reunioes', 'Tesouraria', 'Documentos', 'Relatorios')

    abrirTela('/dashboard', 'pageDashboard')
    abrirTela('/membros', 'pageMembros', 'loadingMembros')
    abrirTela('/pgm', 'pagePgm', 'loadingPgms')
    abrirTela('/ministerios', 'pageMinisterios', 'loadingMinisterios')
    abrirTela('/configuracoes', 'pageConfiguracoes')

    rotaBloqueada('/reunioes')
    rotaBloqueada('/relatorios')
    rotaBloqueada('/tesouraria')
    rotaBloqueada('/documentos')
  })
})
