export function nomeUnico(prefixo: string) {
  return `${prefixo} ${Date.now()}`
}

export function dataHojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function idDeDataCy(attr: string | undefined, prefixo: string) {
  return String(attr ?? '').replace(prefixo, '')
}

export function abrirTela(path: string, pageCy: string, loadingCy?: string) {
  cy.visit(path)
  cy.get(`[data-cy=${pageCy}]`, { timeout: 15000 }).should('be.visible')
  if (loadingCy) {
    cy.get(`[data-cy=${loadingCy}]`).should('not.exist')
  }
}

export function menuDeveExistir(...nomes: string[]) {
  nomes.forEach((nome) => {
    cy.get(`[data-cy=linkMenu${nome}Sidebar]`).should('be.visible')
  })
}

export function menuNaoDeveExistir(...nomes: string[]) {
  nomes.forEach((nome) => {
    cy.get(`[data-cy=linkMenu${nome}Sidebar]`).should('not.exist')
  })
}

export function rotaBloqueada(path: string) {
  cy.visit(path)
  cy.get('[data-cy=msgAcessoRestrito]').should('be.visible')
}

export function criarMembro(nome: string) {
  cy.visit('/membros/novo')
  cy.get('[data-cy=pageNovoMembro]').should('be.visible')
  cy.get('[data-cy=inputNomeCompleto]').clear().type(nome)
  cy.get('[data-cy=btnSalvarMembro]').click()
  cy.wait('@insertMembros', { timeout: 15000 })
  cy.get('[data-cy=pageMembros]', { timeout: 15000 }).should('be.visible')
  cy.get('[data-cy=loadingMembros]').should('not.exist')
}

export function idMembroPorNome(nome: string, alias = 'membroId') {
  cy.get('[data-cy=inputBuscaMembro]').clear().type(nome)
  cy.get('[data-cy^=membroItemDesktop-]').should('contain.text', nome).first()
    .invoke('attr', 'data-cy')
    .then((attr) => {
      cy.wrap(idDeDataCy(attr, 'membroItemDesktop-')).as(alias)
    })
}

export function criarPgm(nome: string) {
  cy.visit('/pgm')
  cy.get('[data-cy=pagePgm]').should('be.visible')
  cy.get('[data-cy=loadingPgms]').should('not.exist')
  cy.get('[data-cy=btnNovoPgm]').click()
  cy.get('[data-cy=formPgm]').should('be.visible')
  cy.get('[data-cy=inputNomePgm]').clear().type(nome)
  cy.get('[data-cy=btnSalvarPgm]').click()
  cy.wait('@insertPgm', { timeout: 15000 })
  cy.contains('[data-cy^=pgmItem-]', nome).should('be.visible')
}

export function idPgmPorNome(nome: string, alias = 'pgmId') {
  cy.contains('[data-cy^=pgmItem-]', nome)
    .invoke('attr', 'data-cy')
    .then((attr) => {
      cy.wrap(idDeDataCy(attr, 'pgmItem-')).as(alias)
    })
}

export function criarMinisterio(nome: string, descricao = 'Descrição de teste') {
  cy.visit('/ministerios')
  cy.get('[data-cy=pageMinisterios]').should('be.visible')
  cy.get('[data-cy=loadingMinisterios]').should('not.exist')
  cy.get('[data-cy=btnNovoMinisterio]').click()
  cy.get('[data-cy=formMinisterio]').should('be.visible')
  cy.get('[data-cy=inputNomeMinisterio]').clear().type(nome)
  cy.get('[data-cy=inputDescricaoMinisterio]').clear().type(descricao)
  cy.get('[data-cy=btnSalvarMinisterio]').click()
  cy.wait('@insertMinisterios', { timeout: 15000 })
  cy.contains('[data-cy^=ministerioItem-]', nome).should('be.visible')
}

export function idMinisterioPorNome(nome: string, alias = 'ministerioId') {
  cy.contains('[data-cy^=ministerioItem-]', nome)
    .invoke('attr', 'data-cy')
    .then((attr) => {
      cy.wrap(idDeDataCy(attr, 'ministerioItem-')).as(alias)
    })
}

export function arquivoPdfFake(nome = 'ata-teste.pdf') {
  return {
    contents: Cypress.Buffer.from('%PDF-1.4 teste IBC'),
    fileName: nome,
    mimeType: 'application/pdf',
  }
}
