class LayoutPage {
  selectorsList() {
    const selectors = {
      sidebar: '[data-cy=navSidebar]',
      barra: '[data-cy=navBarra]',
      drawer: '[data-cy=navDrawer]',
      abrirMenu: '[data-cy=btnAbrirMenu]',
      fecharMenu: '[data-cy=btnFecharMenu]',
      overlay: '[data-cy=overlayMenuMobile]',
      sairSidebar: '[data-cy=btnSairSidebar]',
      acessoRestrito: '[data-cy=msgAcessoRestrito]',
    }
    return selectors
  }

  linkSidebar(nome: string) {
    return `[data-cy=linkMenu${nome}Sidebar]`
  }

  linkDrawer(nome: string) {
    return `[data-cy=linkMenu${nome}Drawer]`
  }

  menuDeveExistir(...nomes: string[]) {
    nomes.forEach((nome) => {
      cy.get(this.linkSidebar(nome)).should('be.visible')
    })
  }

  menuNaoDeveExistir(...nomes: string[]) {
    nomes.forEach((nome) => {
      cy.get(this.linkSidebar(nome)).should('not.exist')
    })
  }

  sair() {
    cy.get(this.selectorsList().sairSidebar).click()
    cy.get('[data-cy=pageLogin]', { timeout: 15000 }).should('be.visible')
  }

  abrirRotaBloqueada(path: string) {
    cy.visit(path)
    cy.get(this.selectorsList().acessoRestrito).should('be.visible')
  }

  emMobile() {
    cy.viewport(375, 812)
  }

  sidebarOculta() {
    cy.get(this.selectorsList().sidebar).should('not.be.visible')
  }

  barraVisivel() {
    const s = this.selectorsList()
    cy.get(s.barra).should('be.visible')
    cy.get(s.abrirMenu).should('be.visible')
  }

  abrirDrawer() {
    cy.get(this.selectorsList().abrirMenu).click()
    cy.get(this.selectorsList().drawer).should('be.visible')
  }

  fecharPeloOverlay() {
    cy.get(this.selectorsList().overlay).click({ force: true })
    cy.get(this.selectorsList().drawer).should('not.exist')
  }
}

export default new LayoutPage()
