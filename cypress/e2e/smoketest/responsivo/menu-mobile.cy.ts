import { interceptarApis } from "../../support/intercept";
import layoutPage from "../../support/pages/LayoutPage";
import membrosPage from "../../support/pages/MembrosPage";

describe("Smoke — menu mobile", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
    layoutPage.emMobile();
  });

  it("abre e fecha o drawer e a lista de membros continua utilizável", () => {
    layoutPage.sidebarOculta();
    layoutPage.barraVisivel();
    layoutPage.abrirDrawer();
    cy.get(layoutPage.linkDrawer("Tesouraria")).should("be.visible");
    layoutPage.fecharPeloOverlay();

    membrosPage.visitarLista();
    layoutPage.emMobile();
    membrosPage.listaMobileUtilizavel();
  });
});
