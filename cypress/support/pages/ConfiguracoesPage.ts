class ConfiguracoesPage {
  selectorsList() {
    const selectors = {
      page: '[data-cy=pageConfiguracoes]',
      tituloUsuarios: 'Usuários do sistema',
      novo: '[data-cy=btnNovoUsuario]',
      selectRole: '[data-cy=selectRoleConvite]',
      badge: '[data-cy=badgeNivelAcesso]',
    }
    return selectors
  }

  visitar() {
    cy.visit('/configuracoes')
    cy.get(this.selectorsList().page).should('be.visible')
  }

  secaoUsuariosVisivel() {
    cy.contains(this.selectorsList().tituloUsuarios).should('be.visible')
  }

  secaoUsuariosOculta() {
    cy.contains(this.selectorsList().tituloUsuarios).should('not.exist')
  }

  soConvidaUsuario() {
    cy.get(this.selectorsList().novo).click()
    cy.get(this.selectorsList().selectRole).should('not.exist')
  }
}

export default new ConfiguracoesPage()
