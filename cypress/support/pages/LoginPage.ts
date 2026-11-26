class LoginPage {
  selectorsList() {
    const selectors = {
      page: '[data-cy=pageLogin]',
      email: '[data-cy=inputEmailLogin]',
      senha: '[data-cy=inputSenhaLogin]',
      entrar: '[data-cy=btnEntrar]',
      erro: '[data-cy=msgErroLogin]',
      dashboard: '[data-cy=pageDashboard]',
    }
    return selectors
  }

  visitar() {
    cy.visit('/login')
    cy.get(this.selectorsList().page).should('be.visible')
  }

  entrarCom(email: string, senha: string) {
    const s = this.selectorsList()
    cy.get(s.email).clear().type(email)
    cy.get(s.senha).clear().type(senha, { log: false })
    cy.get(s.entrar).click()
  }

  deveEstarNoDashboard() {
    cy.get(this.selectorsList().dashboard, { timeout: 20000 }).should('be.visible')
  }

  deveMostrarErro() {
    cy.get(this.selectorsList().erro).should('be.visible')
  }
}

export default new LoginPage()
