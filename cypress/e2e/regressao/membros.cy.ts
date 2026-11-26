import { interceptarApis } from "../../support/intercept";
import { nomeUnico } from "../../support/helpers";
import membrosPage from "../../support/pages/MembrosPage";

describe("Regressão — Membros", () => {
  beforeEach(() => {
    interceptarApis();
    cy.loginAs("superAdmin");
    cy.intercept("GET", "https://viacep.com.br/ws/35160000/json/", {
      statusCode: 200,
      body: {
        logradouro: "Rua da Regressão",
        bairro: "Centro",
        localidade: "Ipatinga",
      },
    }).as("viacep");
  });

  it("cadastra com validação, máscara, CEP, busca, filtro, edição e perfil", () => {
    const nome = nomeUnico("Membro Regressao");
    const nomeEditado = `${nome} Editado`;

    membrosPage.visitarLista();
    membrosPage.abrirNovo();
    membrosPage.salvarSemNome();

    membrosPage.abrirContato();
    membrosPage.preencherTelefone("31999998888");
    membrosPage.telefoneDeveSer("(31) 99999-8888");
    membrosPage.preencherCep("35160000");
    cy.wait("@viacep");
    membrosPage.enderecoPreenchido("Rua da Regressão", "Centro", "Ipatinga");

    membrosPage.salvarComNome(nome);
    membrosPage.buscar(nome);
    membrosPage.itemDesktop(nome).should("be.visible");

    membrosPage.filtrarStatus("Membro Ativo");
    cy.contains(nome).should("not.exist");
    membrosPage.filtrarStatus("todos");
    membrosPage.buscar(nome);
    membrosPage.itemDesktop(nome).should("be.visible");

    membrosPage.idPorNome(nome).then((id) => {
      membrosPage.ver(id);
      cy.contains(nome).should("be.visible");
      cy.contains("Rua da Regressão").should("be.visible");
      cy.contains("(31) 99999-8888").should("be.visible");
      membrosPage.editarNomeNoPerfil(nomeEditado);
    });

    membrosPage.visitarLista();
    membrosPage.buscar(nomeEditado);
    membrosPage.idPorNome(nomeEditado).then((id) => {
      membrosPage.excluirPelaLista(id);
    });
    membrosPage.buscar(nomeEditado);
    cy.get(membrosPage.selectorsList().vazio).should("be.visible");
  });
});
