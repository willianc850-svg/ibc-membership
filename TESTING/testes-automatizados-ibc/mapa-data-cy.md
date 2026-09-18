# Mapa de `data-cy` — IBC Membership

Seletores para Cypress: `cy.get('[data-cy=btnEntrar]')`.
Listas dinâmicas: `cy.get(\`[data-cy=btnEditarMembroDesktop-${id}]\`)`.
Valores com espaço (tags de gasto, cidade): use aspas — `cy.get('[data-cy="optTag-Manutenção predial"]')`.

## Convenção

| Prefixo | Uso | Exemplo |
|---------|-----|---------|
| `btn` | botão ou link com aparência de botão | `btnNovoMembro` |
| `link` | item de menu ou link de texto | `linkEsqueciSenha` |
| `input` | text, email, tel, date, search, password | `inputNomeCompleto` |
| `file` | `input type="file"` | `fileFotoCadastro` |
| `select` / `opt` | dropdown e opções | `selectStatusMembro`, `optPastor` |
| `check` | checkbox | `checkTemFilhos` |
| `textarea` | área de texto | `textareaPauta` |
| `tab` | aba da ficha | `tabFicha-pessoal` |
| `item` | linha/card de lista | `membroItemDesktop-<id>` |
| `modal` | modal | `modalConfirmacao` |
| `page` | raiz da tela | `pageMembros` |
| `msg` / `loading` / `vazio` / `total` | asserção | `msgErroLogin` |

Listas usam o id do registro. Conteúdo duplicado (mobile/desktop, sidebar/drawer) recebe sufixo de contexto.

`window.confirm()` nativo (PGM, ministérios, finalizar reunião) não recebe `data-cy`. O teste usa o botão que dispara + `cy.on('window:confirm')`.

---

## Componentes compartilhados

**CampoSenha** — prop `dataCy` (ex.: `senhaLogin`) gera `inputSenhaLogin` e `btnMostrarSenhaLogin`.

**InputHorario24** — prop `dataCy` (ex.: `inputHorarioReuniao`) gera `inputHorarioReuniaoHora` e `inputHorarioReuniaoMinuto`.

**UploadFoto** — `fileFotoMembro`, `btnTrocarFoto`, `btnRemoverFoto`, `msgErroUploadFoto`.

**ModalConfirmacao** — `modalConfirmacao`, `tituloModalConfirmacao`, `msgModalConfirmacao`, `btnConfirmarModal`, `btnCancelarModal`.

**BotaoTema** — `btnTemaLogin`, `btnTemaCadastro`, `btnTemaSidebar`, `btnTemaDrawer`, `btnTemaHeader`.

**VincularContaMembro** — `selectContaLogin`, `optSemConta`, `optContaLogin-<id>`, `loadingVinculoConta`, `msgVinculoConta`.

**VincularFichaUsuario** — `selectFichaUsuario-<usuarioId>`, `optSemFicha-<usuarioId>`, `optFichaUsuario-<usuarioId>-<membroId>`.

**AcessoGuard / TesourariaGuard** — `loadingPermissao`, `msgAcessoRestrito`.

---

## Autenticação e cadastro público

**Login** (`pageLogin`) — `formLogin`, `inputEmailLogin`, `inputSenhaLogin`, `btnMostrarSenhaLogin`, `linkEsqueciSenha`, `msgErroLogin`, `btnEntrar`.

**Esqueci senha** (`pageEsqueciSenha`) — `formEsqueciSenha`, `inputEmailEsqueciSenha`, `btnEnviarLink`, `linkVoltarLogin`, `msgErroEsqueciSenha`, `msgSucessoEsqueciSenha`.

**Definir senha** (`pageDefinirSenha`) — `formDefinirSenha`, `inputNovaSenha`, `btnMostrarNovaSenha`, `inputConfirmarSenha`, `btnMostrarConfirmarSenha`, `btnSalvarSenha`, `msgErroDefinirSenha`, `loadingDefinirSenha`, `msgLinkInvalido`, `linkIrParaLogin`.

**Auth callback** (`pageAuthCallback`) — `loadingAuthCallback`, `msgErroAuthCallback`, `btnPedirNovoEmail`.

**Cadastro QR** (`pageCadastroPublico`) — `tabFicha-<id>`, `fileFotoCadastro`, `textoFotoCadastro`, `btnAnterior`, `btnProximo`, `btnEnviarCadastro`, `indicadorAba`, `msgErroCadastro`, `msgSucessoCadastro`, `linkIrParaLogin`. Campos da ficha: iguais aos de `FichaMembroCampos`.

---

## Navegação (layout)

`navSidebar` / `navDrawer` / `navBarra`

Links: `linkMenu<Nome><Contexto>` — Nome vem do href (`Dashboard`, `Membros`, `Reunioes`, `Pgm`, `Ministerios`, `Tesouraria`, `Documentos`, `Relatorios`, `Configuracoes`). Contexto: `Sidebar`, `Drawer`, `Barra` (só Dashboard e Membros na barra).

`btnAbrirMenu`, `btnFecharMenu`, `overlayMenuMobile`, `btnSairSidebar`, `btnSairDrawer`.

---

## Membros

**Lista** (`pageMembros`) — `btnNovoMembro`, `btnCadastrosPendentes`, `btnQrCadastro`, `inputBuscaMembro`, `selectFiltroStatus` + `optFiltroStatus*`, `totalMembros`, `loadingMembros`, `vazioMembros`, `msgErroMembros`, `listaMembrosMobile`, `listaMembrosDesktop`.

Por membro: `membroItemMobile-<id>`, `membroItemDesktop-<id>`, `btnVerMembroMobile-<id>`, `btnVerMembroDesktop-<id>`, `btnEditarMembroMobile-<id>`, `btnEditarMembroDesktop-<id>`, `btnDeletarMembroMobile-<id>`, `btnDeletarMembroDesktop-<id>`, `btnWhatsappMembroMobile-<id>`.

**Novo / Editar** — `pageNovoMembro` / `pageEditarMembro`, `tabFicha-<id>` (`pessoal`, `contato`, `familia`, `igreja`, `saude`), `btnAnterior`, `btnProximo`, `indicadorAba`, `btnSalvarMembro` (novo), `btnSalvarAlteracoes` (editar), `btnVoltarMembros` / `btnVoltarPerfil`.

Campos da ficha (iguais em `/cadastro`, `/membros/novo` e `/membros/[id]/editar`):

`inputNomeCompleto`, `inputDataNascimento`, `selectGenero` + `optGenero*`, `selectEstadoCivil` + `optEstadoCivil*`, `inputNaturalidade`, `selectEscolaridade` + `optEscolaridade*`, `inputProfissao`, `inputTelefone`, `inputEmail`, `inputRua`, `inputNumero`, `inputComplemento`, `inputBairro`, `inputCidade`, `inputCep`, `iconeCepValido`, `iconeCepInvalido`, `msgCep`, `inputDataCasamento`, `checkTemFilhos`, `textareaFilhosInfo`, `selectStatusMembresia` + `optStatus*` (admin), `checkSoAnoAdmissao`, `selectAnoAdmissao`, `optAnoAdmissao-<ano>`, `inputDataAdmissao`, `selectFormaAdmissao` + `optFormaAdmissao*` (cadastro público e editar), `inputIgrejaProcedencia`, `checkSoAnoBatismo`, `selectAnoBatismo`, `optAnoBatismo-<ano>`, `inputDataBatismo`, `textareaCursosTeologicos`, `checkConcluiuIntegracao` (admin), `textareaAlergias`, `selectTipoSanguineo` + `optTipoSanguineo*`, `selectTamanhoCamiseta` + `optCamiseta*`, `inputEmergenciaNome`, `inputEmergenciaTelefone`, `textareaHabilidades`, `checkAutorizacaoImagem`.

Em `/membros/novo` existe um segundo date de admissão sempre visível: `inputDataAdmissaoDuplicado`. O campo condicional (o que o teste deve usar) é `inputDataAdmissao`.

**Perfil** (`pagePerfilMembro`) — `btnEditarPerfil`, `btnExcluirMembro`, `btnWhatsappPerfil`, `btnEmailPerfil`, `loadingPerfilMembro`, `vazioPerfilMembro`.

**Pendentes** (`pageCadastrosPendentes`) — `pendenteItem-<id>`, `btnVerFicha-<id>`, `btnAprovarCadastro-<id>`, `btnRecusarCadastro-<id>`, `fichaPendente-<id>`, `loadingPendentes`, `vazioPendentes`, `msgErroPendentes`.

**QR** (`pageQrCadastro`) — `imagemQrCadastro`, `textoUrlCadastro`, `btnImprimirQr`, `loadingQrCadastro`.

---

## Reuniões

**Lista** (`pageReunioes`) — `btnNovaReuniao`, `btnFiltroTipo-<tipo>`, `inputDataInicio`, `inputDataFim`, `btnLimparDatas`, `linkReuniao-<id>`, `totalReunioes`, `loadingReunioes`, `vazioReunioes`.

**Nova** (`pageNovaReuniao`) — `inputTituloReuniao`, `selectTipoReuniao` + `optTipoReuniao*`, `selectMinisterioReuniao`, `inputDataReuniao`, `inputHorarioReuniaoHora`, `inputHorarioReuniaoMinuto`, `inputLocalReuniao`, `textareaPauta`, `inputBuscaParticipante`, `btnAdicionarParticipante-<id>`, `btnRemoverParticipante-<id>`, `participanteItem-<id>`, `btnCriarReuniao`, `msgErroNovaReuniao`.

**Detalhe** (`pageReuniao`) — `btnExcluirReuniao`, `btnConfirmarPresenca`, `msgPresencaConfirmada`, `btnEditarAta`, `btnCriarAta`, `btnBaixarPdfAta`, `textareaAta`, `btnGerarAtaIa`, `btnSalvarAta`, `btnCancelarAta`, `textoAta`, `vazioAta`, `btnFinalizarReuniao`, `participanteItem-<id>`, `totalParticipantes`, `totalConfirmados`.

---

## PGM e Ministérios

**PGMs** (`pagePgm`) — `btnNovoPgm`, `formPgm`, `inputNomePgm`, `inputBairroPgm`, `selectLiderPgm`, `selectDiaSemana`, `inputHorarioPgmHora`, `inputHorarioPgmMinuto`, `btnSalvarPgm`, `btnCancelarPgm`, `pgmItem-<id>`, `btnEditarPgm-<id>`, `btnExcluirPgm-<id>`, `linkVerMembrosPgm-<id>`, `totalPgms`, `loadingPgms`, `vazioPgms`.

**PGM detalhe** (`pagePgmDetalhe`) — `btnAdicionarMembroPgm`, `inputBuscaMembroPgm`, `btnVincularMembro-<id>`, `membroPgmItem-<id>`, `linkVerPerfilMembro-<id>`, `btnDesvincularMembro-<id>`, `totalMembrosPgm`, `vazioMembrosPgm`.

**Ministérios** (`pageMinisterios`) — `btnNovoMinisterio`, `formMinisterio`, `inputNomeMinisterio`, `inputDescricaoMinisterio`, `btnSalvarMinisterio`, `btnCancelarMinisterio`, `ministerioItem-<id>`, `btnEditarMinisterio-<id>`, `btnExcluirMinisterio-<id>`, `linkVerMembrosMinisterio-<id>`, `totalMinisterios`, `loadingMinisterios`, `vazioMinisterios`.

**Ministério detalhe** (`pageMinisterioDetalhe`) — `btnAdicionarMembroMinisterio`, `formVincularMinisterio`, `inputBuscaMembroMinisterio`, `btnSelecionarMembro-<id>`, `inputFuncaoMinisterio`, `btnConfirmarVinculo`, `btnCancelarVinculo`, `membroMinisterioItem-<id>`, `btnEditarFuncao-<id>`, `inputEditarFuncao-<id>`, `btnSalvarFuncao-<id>`, `btnCancelarFuncao-<id>`, `btnDefinirLider-<id>`, `linkVerMembro-<id>`, `btnDesvincularMembro-<id>`, `cardLiderMinisterio`, `linkVerPerfilLider`, `totalMembrosMinisterio`, `vazioMembrosMinisterio`.

---

## Tesouraria

**Resumo** (`pageTesouraria`) — `selectAnoTesouraria`, `optAnoTesouraria-<ano>`, `btnRelatorioTrimestral`, `linkMesTesouraria-<mes>`, `totalMediaEntradas`, `totalMediaSaidas`, `totalMediaDizimos`, `totalMediaOfertas`, `msgErroTesouraria`, `loadingTesouraria`.

**Mês** (`pageTesourariaMes`) — `btnMesAnterior`, `btnProximoMes`, `btnResumoAnual`, `blocoLancamento-<categoria>`, `btnAdicionarLancamento-<categoria>`, `formLancamento`, `inputDescricaoLancamento`, `inputDataLancamento`, `inputValorLancamento`, `inputComentarioLancamento`, `selectTagLancamento`, `fileComprovanteLancamento`, `btnSalvarLancamento`, `btnCancelarLancamento`, `lancamentoItem-<id>`, `btnEditarLancamento-<id>`, `btnExcluirLancamento-<id>`, `btnVerComprovante-<id>`, `vazioBloco-<categoria>`, `totalEntradasMes`, `totalSaidasMes`, `totalSaldoMes`, `msgErroTesourariaMes`, `loadingLancamentos`.

Categorias: `dizimos`, `ofertas`, `missoes`, `outros`, `gastos_fixos`, `gastos_variaveis`, `outros_gastos`, `ofertas_saida`.

**Relatório trimestral** (`pageRelatorioTesouraria`) — `selectAnoRelatorio`, `selectTrimestre`, `optTrimestre-<id>`, `btnExportarPdfTesouraria`, `totalEntradasTrimestre`, `totalSaidasTrimestre`, `totalSaldoTrimestre`, `vazioRelatorioTesouraria`.

---

## Documentos, Relatórios, Configurações, Dashboard

**Documentos** (`pageDocumentos`) — `btnNovoDocumento`, `formDocumento`, `inputTituloDocumento`, `selectTipoDocumento`, `optTipoDocumento-<valor>`, `fileDocumento`, `btnSalvarDocumento`, `btnCancelarDocumento`, `documentoItem-<id>`, `btnAbrirDocumento-<id>`, `btnExcluirDocumento-<id>`, `loadingDocumentos`, `vazioDocumentos`, `msgErroDocumentos`.

**Relatórios** (`pageRelatorios`) — `btnFiltrosRelatorio`, `btnExportarExcel`, `btnLimparFiltros`, `painelFiltrosRelatorio`, `selectFiltroStatus`, `selectFiltroGenero`, `selectFiltroEscolaridade`, `selectFiltroCidade`, `selectFiltroFilhos`, `selectFiltroIntegracao`, `selectFiltroAutorizacao`, `selectFiltroBatismo` (+ `optFiltro*` correspondentes), `relatorioMembroItem-<id>`, `totalRelatorios`, `loadingRelatorios`, `vazioRelatorios`.

**Configurações** (`pageConfiguracoes`) — `btnNovoUsuario`, `formConviteUsuario`, `inputNomeConvite`, `inputEmailConvite`, `selectRoleConvite`, `btnEnviarConvite`, `btnCancelarConvite`, `usuarioItem-<id>`, `selectRoleUsuario-<id>`, `btnReenviarConvite-<id>`, `btnExcluirUsuario-<id>`, `badgeConvitePendente-<id>`, `badgeNivelAcesso`, `formPerfil`, `inputEmailPerfil`, `btnSalvarEmail`, `formAlterarSenha`, `inputNovaSenha`, `inputConfirmarNovaSenha`, `btnAlterarSenha`, `msgSucessoUsuario` / `msgErroUsuario`, `msgSucessoPerfil` / `msgErroPerfil`, `msgSucessoSenha` / `msgErroSenha`, `loadingUsuarios`, `vazioUsuarios`.

**Dashboard** (`pageDashboard`) — `totalMembros`, `totalMembrosAtivos`, `totalVisitantes`, `totalAfastados`, `totalPgms`, `totalMinisterios`, `loadingDashboard`, `vazioStatus`, `vazioGenero`, `vazioFaixaEtaria`, `vazioAdmissoes`, `vazioEscolaridade`, `vazioBairros`.
