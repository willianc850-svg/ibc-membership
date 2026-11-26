import { interceptarApis } from "../../support/intercept";
import { dataHojeISO, nomeUnico } from "../../support/helpers";
import membrosPage from "../../support/pages/MembrosPage";
import reunioesPage from "../../support/pages/ReunioesPage";

describe("Regressão — Reuniões", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
    cy.on("window:confirm", () => true);
  });

  it("cria com participante, salva ATA, baixa PDF, finaliza e filtra", () => {
    const membro = nomeUnico("Membro Reuniao");
    const titulo = nomeUnico("Reuniao Regressao");
    const hoje = dataHojeISO();
    const arquivo = `cypress/downloads/ata-${titulo.toLowerCase().replace(/\s+/g, "-")}.pdf`;

    membrosPage.visitarLista();
    membrosPage.abrirNovo();
    membrosPage.salvarComNome(membro);

    reunioesPage.visitar();
    reunioesPage.criarComParticipante(titulo, hoje, membro);
    reunioesPage.salvarAta("ATA de regressão.");
    cy.task("apagarArquivo", arquivo);
    reunioesPage.baixarPdf();
    cy.readFile(arquivo, null, { timeout: 15000 }).should((conteudo) => {
      expect(String(conteudo).length).to.be.greaterThan(20);
    });
    reunioesPage.finalizar();

    reunioesPage.visitar();
    reunioesPage.filtrarData(hoje, hoje);
    reunioesPage.filtrarTipo("Diretoria");
    cy.contains(titulo).should("be.visible");
    reunioesPage.filtrarData("2000-01-01", "2000-01-02");
    cy.contains(titulo).should("not.exist");

    reunioesPage.filtrarData(hoje, hoje);
    cy.contains("[data-cy^=linkReuniao-]", titulo).click();
    reunioesPage.excluirAberta();

    membrosPage.visitarLista();
    membrosPage.buscar(membro);
    membrosPage
      .idPorNome(membro)
      .then((id) => membrosPage.excluirPelaLista(id));
  });
});
