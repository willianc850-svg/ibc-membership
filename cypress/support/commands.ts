/// <reference types="cypress" />

export type RoleTeste = 'superAdmin' | 'admin' | 'tesoureiro' | 'user'

type Credencial = {
  email: string
  password: string
}

Cypress.Commands.add('loginAs', (role: RoleTeste) => {
  cy.session(role, () => {
    cy.env([role], { log: false }).then((vars) => {
      const cred = vars[role] as Credencial | undefined
      if (!cred?.email || !cred.password || cred.password === 'COLOQUE_A_SENHA_DAS_4_CONTAS') {
        throw new Error(
          `Credenciais de ${role} ausentes. Copie cypress.env.example.json para cypress.env.json e preencha a senha.`,
        )
      }

      cy.visit('/login')
      cy.get('[data-cy=pageLogin]').should('be.visible')
      cy.get('[data-cy=inputEmailLogin]').clear().type(cred.email)
      cy.get('[data-cy=inputSenhaLogin]').clear().type(cred.password, { log: false })
      cy.get('[data-cy=btnEntrar]').click()
      cy.get('[data-cy=pageDashboard]', { timeout: 20000 }).should('be.visible')
    })
  })
  cy.visit('/dashboard')
  cy.get('[data-cy=pageDashboard]', { timeout: 20000 }).should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: RoleTeste): Chainable<void>
    }
  }
}

export {}
