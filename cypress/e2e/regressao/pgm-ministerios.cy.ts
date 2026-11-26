import { interceptarApis } from "../../support/intercept";
import { nomeUnico } from "../../support/helpers";
import membrosPage from "../../support/pages/MembrosPage";
import pgmPage from "../../support/pages/PgmPage";
import ministeriosPage from "../../support/pages/MinisteriosPage";

describe("Regressão — PGMs e Ministérios", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
    cy.on("window:confirm", () => true);
  });

  it("cria grupo, vincula, define função e líder, remove o vínculo e exclui o grupo", () => {
    const membro = nomeUnico("Membro Grupo");
    const pgm = nomeUnico("PGM Regressao");
    const ministerio = nomeUnico("Ministerio Regressao");
    const funcao = "Regente";

    membrosPage.visitarLista();
    membrosPage.abrirNovo();
    membrosPage.salvarComNome(membro);

    pgmPage.visitar();
    pgmPage.criar(pgm);
    pgmPage.idPorNome(pgm).then((id) => {
      pgmPage.abrir(id);
      pgmPage.vincularMembro(membro);
      pgmPage.desvincularPrimeiro(membro);
      pgmPage.excluir(id);
    });
    cy.contains(pgm).should("not.exist");
    cy.contains(membro).should("not.exist");

    ministeriosPage.visitar();
    ministeriosPage.criar(ministerio);
    ministeriosPage.idPorNome(ministerio).then((id) => {
      ministeriosPage.abrir(id);
      ministeriosPage.vincularComFuncao(membro, funcao);
      ministeriosPage.definirLiderDoMembro(membro);
      ministeriosPage.desvincular(membro);
      cy.contains(membro).should("not.exist");
      ministeriosPage.excluir(id);
    });

    membrosPage.visitarLista();
    membrosPage.buscar(membro);
    membrosPage.idPorNome(membro).then((id) => {
      membrosPage.excluirPelaLista(id);
    });
  });
});
