/** Espiona as APIs Next e o REST do Supabase (sem stub — a requisição segue). */
export function interceptarApis() {
  cy.intercept('GET', '/api/admin/usuarios').as('listarUsuarios')
  cy.intercept('PUT', '/api/admin/usuarios').as('alterarRoleUsuario')
  cy.intercept('DELETE', '/api/admin/usuarios').as('excluirUsuario')
  cy.intercept('POST', '/api/admin/vincular').as('vincularUsuario')
  cy.intercept('GET', '/api/cadastro/pendentes').as('listarPendentes')
  cy.intercept('POST', '/api/cadastro').as('enviarCadastro')
  cy.intercept('POST', '/api/gerar-ata').as('gerarAta')

  cy.intercept({ method: 'GET', url: '**/rest/v1/membros*' }).as('getMembros')
  cy.intercept({ method: 'POST', url: '**/rest/v1/membros*' }).as('insertMembros')
  cy.intercept({ method: 'PATCH', url: '**/rest/v1/membros*' }).as('updateMembros')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/membros*' }).as('deleteMembros')

  cy.intercept({ method: 'GET', url: '**/rest/v1/reunioes*' }).as('getReunioes')
  cy.intercept({ method: 'POST', url: '**/rest/v1/reunioes*' }).as('insertReunioes')
  cy.intercept({ method: 'PATCH', url: '**/rest/v1/reunioes*' }).as('updateReunioes')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/reunioes*' }).as('deleteReunioes')

  cy.intercept({ method: 'GET', url: '**/rest/v1/pgm*' }).as('getPgm')
  cy.intercept({ method: 'POST', url: '**/rest/v1/pgm*' }).as('insertPgm')
  cy.intercept({ method: 'PATCH', url: '**/rest/v1/pgm*' }).as('updatePgm')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/pgm*' }).as('deletePgm')

  cy.intercept({ method: 'GET', url: '**/rest/v1/celulas*' }).as('getCelulas')

  cy.intercept({ method: 'GET', url: '**/rest/v1/ministerios*' }).as('getMinisterios')
  cy.intercept({ method: 'POST', url: '**/rest/v1/ministerios*' }).as('insertMinisterios')
  cy.intercept({ method: 'PATCH', url: '**/rest/v1/ministerios*' }).as('updateMinisterios')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/ministerios*' }).as('deleteMinisterios')

  cy.intercept({ method: 'GET', url: '**/rest/v1/lancamentos_financeiros*' }).as('getLancamentos')
  cy.intercept({ method: 'POST', url: '**/rest/v1/lancamentos_financeiros*' }).as('insertLancamentos')
  cy.intercept({ method: 'PATCH', url: '**/rest/v1/lancamentos_financeiros*' }).as('updateLancamentos')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/lancamentos_financeiros*' }).as('deleteLancamentos')

  cy.intercept({ method: 'GET', url: '**/rest/v1/documentos*' }).as('getDocumentos')
  cy.intercept({ method: 'POST', url: '**/rest/v1/documentos*' }).as('insertDocumentos')
  cy.intercept({ method: 'DELETE', url: '**/rest/v1/documentos*' }).as('deleteDocumentos')

  cy.intercept({ method: 'POST', url: '**/storage/v1/object/**' }).as('uploadStorage')
}

/** Convite de usuário: não dispara e-mail de verdade. */
export function mockConviteUsuario() {
  cy.intercept('POST', '/api/admin/usuarios', {
    statusCode: 200,
    body: { ok: true },
  }).as('convidar')
}
