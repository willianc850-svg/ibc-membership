import loginPage from "../../support/pages/LoginPage";
import layoutPage from "../../support/pages/LayoutPage";

describe("Regressão — Autenticação", () => {
  it("login inválido mostra erro e rota sem sessão volta ao login", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/dashboard");
    cy.get("[data-cy=pageLogin]", { timeout: 15000 }).should("be.visible");

    loginPage.entrarCom("nao-existe@teste.com", "senha-errada");
    loginPage.deveMostrarErro();
  });

  it("login válido entra e o logout invalida a sessão", () => {
    cy.loginAs("superAdmin");
    loginPage.deveEstarNoDashboard();
    layoutPage.sair();
    cy.visit("/dashboard");
    cy.get("[data-cy=pageLogin]", { timeout: 15000 }).should("be.visible");
  });
});
