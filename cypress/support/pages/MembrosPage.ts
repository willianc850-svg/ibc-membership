class MembrosPage {
  selectorsList() {
    const selectors = {
      page: "[data-cy=pageMembros]",
      loading: "[data-cy=loadingMembros]",
      novo: "[data-cy=btnNovoMembro]",
      busca: "[data-cy=inputBuscaMembro]",
      filtroStatus: "[data-cy=selectFiltroStatus]",
      listaDesktop: "[data-cy=listaMembrosDesktop]",
      listaMobile: "[data-cy=listaMembrosMobile]",
      vazio: "[data-cy=vazioMembros]",
      pageNovo: "[data-cy=pageNovoMembro]",
      nome: "[data-cy=inputNomeCompleto]",
      telefone: "[data-cy=inputTelefone]",
      cep: "[data-cy=inputCep]",
      rua: "[data-cy=inputRua]",
      bairro: "[data-cy=inputBairro]",
      cidade: "[data-cy=inputCidade]",
      cepValido: "[data-cy=iconeCepValido]",
      salvar: "[data-cy=btnSalvarMembro]",
      erroNovo: "[data-cy=msgErroNovoMembro]",
      tabContato: "[data-cy=tabFicha-contato]",
      tabPessoal: "[data-cy=tabFicha-pessoal]",
      perfil: "[data-cy=pagePerfilMembro]",
      editarPerfil: "[data-cy=btnEditarPerfil]",
      excluirPerfil: "[data-cy=btnExcluirMembro]",
      pageEditar: "[data-cy=pageEditarMembro]",
      salvarAlteracoes: "[data-cy=btnSalvarAlteracoes]",
      confirmar: "[data-cy=btnConfirmarModal]",
    };
    return selectors;
  }

  visitarLista() {
    cy.visit("/membros");
    cy.get(this.selectorsList().page).should("be.visible");
    cy.get(this.selectorsList().loading).should("not.exist");
  }

  abrirNovo() {
    cy.get(this.selectorsList().novo).click();
    cy.get(this.selectorsList().pageNovo).should("be.visible");
  }

  salvarSemNome() {
    cy.get(this.selectorsList().salvar).click();
    cy.get(this.selectorsList().erroNovo).should(
      "contain.text",
      "O nome completo é obrigatório.",
    );
  }

  abrirContato() {
    cy.get(this.selectorsList().tabContato).click();
  }

  preencherTelefone(digitos: string) {
    cy.get(this.selectorsList().telefone).clear().type(digitos);
  }

  telefoneDeveSer(valor: string) {
    cy.get(this.selectorsList().telefone).should("have.value", valor);
  }

  preencherCep(cep: string) {
    cy.get(this.selectorsList().cep).clear().type(cep);
  }

  enderecoPreenchido(rua: string, bairro: string, cidade: string) {
    const s = this.selectorsList();
    cy.get(s.cepValido).should("be.visible");
    cy.get(s.rua).should("have.value", rua);
    cy.get(s.bairro).should("have.value", bairro);
    cy.get(s.cidade).should("have.value", cidade);
  }

  salvarComNome(nome: string) {
    const s = this.selectorsList();
    cy.get(s.tabPessoal).click();
    cy.get(s.nome).clear().type(nome);
    cy.get(s.salvar).click();
    cy.wait("@insertMembros", { timeout: 15000 });
    this.visitarLista();
  }

  buscar(nome: string) {
    cy.get(this.selectorsList().busca).clear().type(nome);
  }

  filtrarStatus(valor: string) {
    cy.get(this.selectorsList().filtroStatus).select(valor);
  }

  itemDesktop(nome: string) {
    return cy.contains("[data-cy^=membroItemDesktop-]", nome);
  }

  idPorNome(nome: string) {
    return this.itemDesktop(nome)
      .invoke("attr", "data-cy")
      .then((attr) => {
        return String(attr ?? "").replace("membroItemDesktop-", "");
      });
  }

  ver(id: string) {
    cy.get(`[data-cy=btnVerMembroDesktop-${id}]`).click();
    cy.get(this.selectorsList().perfil).should("be.visible");
  }

  editarNomeNoPerfil(nome: string) {
    const s = this.selectorsList();
    cy.get(s.editarPerfil).click();
    cy.get(s.pageEditar).should("be.visible");
    cy.get(s.nome).clear().type(nome);
    cy.get(s.salvarAlteracoes).click();
    cy.wait("@updateMembros");
    cy.get(s.perfil, { timeout: 15000 }).should("be.visible");
    cy.contains(nome).should("be.visible");
  }

  excluirPelaLista(id: string) {
    cy.get(`[data-cy=btnDeletarMembroDesktop-${id}]`).click();
    cy.get(this.selectorsList().confirmar).click();
    cy.wait("@deleteMembros");
  }

  listaMobileUtilizavel() {
    const s = this.selectorsList();
    cy.get(s.page).should("be.visible");
    cy.get("body").then(($body) => {
      if ($body.find("[data-cy=vazioMembros]").length) {
        cy.get(s.vazio).should("be.visible");
        return;
      }
      cy.get(s.listaMobile).should("be.visible");
      cy.get(s.listaDesktop).should("not.be.visible");
    });
  }
}

export default new MembrosPage();
