import { interceptarApis } from "../../support/intercept";
import dashboardPage from "../../support/pages/DashboardPage";

describe("Regressão — Dashboard", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
  });

  it("mostra cards e os seis gráficos", () => {
    dashboardPage.visitar();
    dashboardPage.cardsVisiveis();
    dashboardPage.graficosRenderizam();
  });

  it("com membros vazios, os gráficos mostram o estado sem dados", () => {
    cy.intercept("GET", "**/rest/v1/membros*", {
      statusCode: 200,
      body: [],
    }).as("membrosVazios");
    dashboardPage.visitar();
    cy.wait("@membrosVazios");
    dashboardPage.cardsVisiveis();
    cy.get(dashboardPage.selectorsList().totalMembros).should(
      "contain.text",
      "0",
    );
    dashboardPage.estadosVazios();
  });
});
