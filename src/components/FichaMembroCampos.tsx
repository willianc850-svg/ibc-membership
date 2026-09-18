'use client'

import type { ReactNode } from 'react'
import {
  anosFicha,
  mascaraTelefone,
  textoAdmissao,
  textoBatismo,
  type FichaMembro,
} from '@/lib/ficha-membro'

export const inputFichaClass =
  'w-full min-h-11 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
export const selectFichaClass = inputFichaClass

export function CampoFicha({
  label,
  obrigatorio,
  children,
}: {
  label: string
  obrigatorio?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

type CepStatus = 'idle' | 'valido' | 'invalido'

type Props = {
  form: FichaMembro
  set: (campo: keyof FichaMembro, valor: string | boolean) => void
  abaAtiva: number
  fotoSlot?: ReactNode
  cepStatus: CepStatus
  mensagemCep: string
  onCep: (cep: string) => void
}

export default function FichaMembroCampos({
  form,
  set,
  abaAtiva,
  fotoSlot,
  cepStatus,
  mensagemCep,
  onCep,
}: Props) {
  const anos = anosFicha()

  return (
    <>
      {abaAtiva === 0 && (
        <div className="space-y-6">
          {fotoSlot}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <CampoFicha label="Nome completo" obrigatorio>
                <input
                  required
                  minLength={3}
                  autoComplete="name"
                  data-cy="inputNomeCompleto"
                  className={inputFichaClass}
                  value={form.nome_completo}
                  onChange={(e) => set('nome_completo', e.target.value)}
                />
              </CampoFicha>
            </div>
            <CampoFicha label="Data de nascimento">
              <input
                type="date"
                data-cy="inputDataNascimento"
                className={inputFichaClass}
                value={form.data_nascimento}
                onChange={(e) => set('data_nascimento', e.target.value)}
              />
            </CampoFicha>
            <CampoFicha label="Gênero">
              <select data-cy="selectGenero" className={selectFichaClass} value={form.genero} onChange={(e) => set('genero', e.target.value)}>
                <option value="" data-cy="optGeneroSelecione">Selecione</option>
                <option data-cy="optGeneroMasculino">Masculino</option>
                <option data-cy="optGeneroFeminino">Feminino</option>
                <option data-cy="optGeneroOutro">Outro</option>
              </select>
            </CampoFicha>
            <CampoFicha label="Estado civil">
              <select data-cy="selectEstadoCivil" className={selectFichaClass} value={form.estado_civil} onChange={(e) => set('estado_civil', e.target.value)}>
                <option value="" data-cy="optEstadoCivilSelecione">Selecione</option>
                <option data-cy="optEstadoCivilSolteiro">Solteiro</option>
                <option data-cy="optEstadoCivilCasado">Casado</option>
                <option data-cy="optEstadoCivilDivorciado">Divorciado</option>
                <option data-cy="optEstadoCivilViuvo">Viúvo</option>
                <option data-cy="optEstadoCivilUniaoEstavel">União Estável</option>
              </select>
            </CampoFicha>
            <CampoFicha label="Naturalidade">
              <input
                data-cy="inputNaturalidade"
                className={inputFichaClass}
                placeholder="Cidade onde nasceu"
                value={form.naturalidade}
                onChange={(e) => set('naturalidade', e.target.value)}
              />
            </CampoFicha>
            <CampoFicha label="Escolaridade">
              <select data-cy="selectEscolaridade" className={selectFichaClass} value={form.escolaridade} onChange={(e) => set('escolaridade', e.target.value)}>
                <option value="" data-cy="optEscolaridadeSelecione">Selecione</option>
                <option data-cy="optEscolaridadeFundamentalIncompleto">Ensino Fundamental Incompleto</option>
                <option data-cy="optEscolaridadeFundamentalCompleto">Ensino Fundamental Completo</option>
                <option data-cy="optEscolaridadeMedioIncompleto">Ensino Médio Incompleto</option>
                <option data-cy="optEscolaridadeMedioCompleto">Ensino Médio Completo</option>
                <option data-cy="optEscolaridadeSuperiorIncompleto">Ensino Superior Incompleto</option>
                <option data-cy="optEscolaridadeSuperiorCompleto">Ensino Superior Completo</option>
                <option data-cy="optEscolaridadePosGraduacao">Pós-graduação</option>
              </select>
            </CampoFicha>
            <CampoFicha label="Profissão / Área de atuação">
              <input
                data-cy="inputProfissao"
                className={inputFichaClass}
                placeholder="Ex: Engenheiro, Professor..."
                value={form.profissao}
                onChange={(e) => set('profissao', e.target.value)}
              />
            </CampoFicha>
          </div>
        </div>
      )}

      {abaAtiva === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoFicha label="Telefone / WhatsApp">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              data-cy="inputTelefone"
              className={inputFichaClass}
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => set('telefone', mascaraTelefone(e.target.value))}
            />
          </CampoFicha>
          <CampoFicha label="E-mail">
            <input
              type="email"
              autoComplete="email"
              data-cy="inputEmail"
              className={inputFichaClass}
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </CampoFicha>
          <div className="sm:col-span-2">
            <CampoFicha label="Rua">
              <input
                data-cy="inputRua"
                className={inputFichaClass}
                placeholder="Nome da rua"
                value={form.rua}
                onChange={(e) => set('rua', e.target.value)}
              />
            </CampoFicha>
          </div>
          <CampoFicha label="Número">
            <input
              data-cy="inputNumero"
              className={inputFichaClass}
              placeholder="Ex: 123"
              value={form.numero}
              onChange={(e) => set('numero', e.target.value)}
            />
          </CampoFicha>
          <CampoFicha label="Complemento">
            <input
              data-cy="inputComplemento"
              className={inputFichaClass}
              placeholder="Apto, Bloco, Casa..."
              value={form.complemento}
              onChange={(e) => set('complemento', e.target.value)}
            />
          </CampoFicha>
          <CampoFicha label="Bairro">
            <input data-cy="inputBairro" className={inputFichaClass} value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
          </CampoFicha>
          <CampoFicha label="Cidade">
            <input data-cy="inputCidade" className={inputFichaClass} value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
          </CampoFicha>
          <CampoFicha label="CEP">
            <div className="relative">
              <input
                data-cy="inputCep"
                className={inputFichaClass}
                placeholder="00000-000"
                value={form.cep}
                maxLength={9}
                inputMode="numeric"
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
                  set('cep', valor)
                  if (valor.replace(/\D/g, '').length === 8) onCep(valor)
                }}
              />
              {cepStatus === 'valido' && (
                <span data-cy="iconeCepValido" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">✓</span>
              )}
              {cepStatus === 'invalido' && (
                <span data-cy="iconeCepInvalido" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-medium">✕</span>
              )}
            </div>
            {mensagemCep && (
              <p data-cy="msgCep" className={`text-xs mt-1 ${cepStatus === 'invalido' ? 'text-red-600' : 'text-green-600'}`}>
                {mensagemCep}
              </p>
            )}
          </CampoFicha>
        </div>
      )}

      {abaAtiva === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoFicha label="Data de casamento">
            <input
              type="date"
              data-cy="inputDataCasamento"
              className={inputFichaClass}
              value={form.data_casamento}
              onChange={(e) => set('data_casamento', e.target.value)}
            />
          </CampoFicha>
          <div />
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer min-h-11">
              <input
                type="checkbox"
                checked={form.tem_filhos}
                onChange={(e) => set('tem_filhos', e.target.checked)}
                data-cy="checkTemFilhos"
                className="w-5 h-5 shrink-0 accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">Possui filhos</span>
            </label>
          </div>
          {form.tem_filhos && (
            <div className="sm:col-span-2">
              <CampoFicha label="Nomes e idades dos filhos">
                <textarea
                  data-cy="textareaFilhosInfo"
                  className={`${inputFichaClass} resize-none`}
                  rows={3}
                  placeholder="Ex: João (8 anos), Maria (5 anos)"
                  value={form.filhos_info}
                  onChange={(e) => set('filhos_info', e.target.value)}
                />
              </CampoFicha>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <CampoFicha label="Quando começou a frequentar">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-11">
                  <input
                    type="checkbox"
                    checked={form.so_ano_admissao}
                    onChange={(e) => {
                      const checked = e.target.checked
                      set('so_ano_admissao', checked)
                      if (checked) set('data_admissao', '')
                      else set('ano_admissao', '')
                    }}
                    data-cy="checkSoAnoAdmissao"
                    className="w-5 h-5 shrink-0 accent-indigo-600"
                  />
                  <span className="text-xs text-gray-500">Não lembro o dia e mês, somente o ano</span>
                </label>
                {form.so_ano_admissao ? (
                  <select data-cy="selectAnoAdmissao" className={selectFichaClass} value={form.ano_admissao} onChange={(e) => set('ano_admissao', e.target.value)}>
                    <option value="" data-cy="optAnoAdmissaoSelecione">Selecione o ano</option>
                    {anos.map((ano) => (
                      <option key={ano} value={ano} data-cy={`optAnoAdmissao-${ano}`}>{ano}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    data-cy="inputDataAdmissao"
                    className={inputFichaClass}
                    value={form.data_admissao}
                    onChange={(e) => set('data_admissao', e.target.value)}
                  />
                )}
              </div>
            </CampoFicha>
          </div>
          <CampoFicha label="Forma de admissão">
            <select data-cy="selectFormaAdmissao" className={selectFichaClass} value={form.forma_admissao} onChange={(e) => set('forma_admissao', e.target.value)}>
              <option value="" data-cy="optFormaAdmissaoSelecione">Selecione</option>
              <option data-cy="optFormaAdmissaoBatismo">Batismo</option>
              <option data-cy="optFormaAdmissaoAclamacao">Aclamação</option>
              <option data-cy="optFormaAdmissaoCarta">Carta de Transferência</option>
            </select>
          </CampoFicha>
          <CampoFicha label="Igreja de procedência">
            <input
              data-cy="inputIgrejaProcedencia"
              className={inputFichaClass}
              placeholder="Se veio de outra igreja"
              value={form.igreja_procedencia}
              onChange={(e) => set('igreja_procedencia', e.target.value)}
            />
          </CampoFicha>
          <div className="sm:col-span-2">
            <CampoFicha label="Data de batismo nas águas">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-11">
                  <input
                    type="checkbox"
                    checked={form.so_ano_batismo_aguas}
                    onChange={(e) => {
                      const checked = e.target.checked
                      set('so_ano_batismo_aguas', checked)
                      if (checked) set('data_batismo_aguas', '')
                      else set('ano_batismo_aguas', '')
                    }}
                    data-cy="checkSoAnoBatismo"
                    className="w-5 h-5 shrink-0 accent-indigo-600"
                  />
                  <span className="text-xs text-gray-500">Não lembro o dia e mês, somente o ano</span>
                </label>
                {form.so_ano_batismo_aguas ? (
                  <select
                    data-cy="selectAnoBatismo"
                    className={selectFichaClass}
                    value={form.ano_batismo_aguas}
                    onChange={(e) => set('ano_batismo_aguas', e.target.value)}
                  >
                    <option value="" data-cy="optAnoBatismoSelecione">Selecione o ano</option>
                    {anos.map((ano) => (
                      <option key={ano} value={ano} data-cy={`optAnoBatismo-${ano}`}>{ano}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    data-cy="inputDataBatismo"
                    className={inputFichaClass}
                    value={form.data_batismo_aguas}
                    onChange={(e) => set('data_batismo_aguas', e.target.value)}
                  />
                )}
              </div>
            </CampoFicha>
          </div>
          <div className="sm:col-span-2">
            <CampoFicha label="Cursos teológicos ou de liderança">
              <textarea
                data-cy="textareaCursosTeologicos"
                className={`${inputFichaClass} resize-none`}
                rows={2}
                placeholder="Ex: Escola de Líderes, Seminário..."
                value={form.cursos_teologicos}
                onChange={(e) => set('cursos_teologicos', e.target.value)}
              />
            </CampoFicha>
          </div>
        </div>
      )}

      {abaAtiva === 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <CampoFicha label="Alergias ou restrições alimentares">
              <textarea
                data-cy="textareaAlergias"
                className={`${inputFichaClass} resize-none`}
                rows={2}
                placeholder="Ex: Lactose, glúten, amendoim..."
                value={form.alergias_restricoes}
                onChange={(e) => set('alergias_restricoes', e.target.value)}
              />
            </CampoFicha>
          </div>
          <CampoFicha label="Tipo sanguíneo">
            <select data-cy="selectTipoSanguineo" className={selectFichaClass} value={form.tipo_sanguineo} onChange={(e) => set('tipo_sanguineo', e.target.value)}>
              <option value="" data-cy="optTipoSanguineoSelecione">Selecione</option>
              <option data-cy="optTipoSanguineoAPos">A+</option><option data-cy="optTipoSanguineoANeg">A-</option>
              <option data-cy="optTipoSanguineoBPos">B+</option><option data-cy="optTipoSanguineoBNeg">B-</option>
              <option data-cy="optTipoSanguineoABPos">AB+</option><option data-cy="optTipoSanguineoABNeg">AB-</option>
              <option data-cy="optTipoSanguineoOPos">O+</option><option data-cy="optTipoSanguineoONeg">O-</option>
              <option data-cy="optTipoSanguineoNaoSei">Não sei</option>
            </select>
          </CampoFicha>
          <CampoFicha label="Tamanho de camiseta">
            <select data-cy="selectTamanhoCamiseta" className={selectFichaClass} value={form.tamanho_camiseta} onChange={(e) => set('tamanho_camiseta', e.target.value)}>
              <option value="" data-cy="optCamisetaSelecione">Selecione</option>
              <option data-cy="optCamisetaPP">PP</option><option data-cy="optCamisetaP">P</option><option data-cy="optCamisetaM">M</option>
              <option data-cy="optCamisetaG">G</option><option data-cy="optCamisetaGG">GG</option><option data-cy="optCamisetaXGG">XGG</option>
            </select>
          </CampoFicha>
          <CampoFicha label="Contato de emergência — nome">
            <input
              data-cy="inputEmergenciaNome"
              className={inputFichaClass}
              value={form.contato_emergencia_nome}
              onChange={(e) => set('contato_emergencia_nome', e.target.value)}
            />
          </CampoFicha>
          <CampoFicha label="Contato de emergência — telefone">
            <input
              type="tel"
              inputMode="numeric"
              data-cy="inputEmergenciaTelefone"
              className={inputFichaClass}
              placeholder="(00) 00000-0000"
              value={form.contato_emergencia_telefone}
              onChange={(e) => set('contato_emergencia_telefone', mascaraTelefone(e.target.value))}
            />
          </CampoFicha>
          <div className="sm:col-span-2">
            <CampoFicha label="Habilidades e talentos">
              <textarea
                data-cy="textareaHabilidades"
                className={`${inputFichaClass} resize-none`}
                rows={2}
                placeholder="Ex: Música, artes, cozinha, TI..."
                value={form.habilidades}
                onChange={(e) => set('habilidades', e.target.value)}
              />
            </CampoFicha>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer min-h-11">
              <input
                type="checkbox"
                checked={form.autorizacao_imagem}
                onChange={(e) => set('autorizacao_imagem', e.target.checked)}
                data-cy="checkAutorizacaoImagem"
                className="w-5 h-5 shrink-0 accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Autoriza uso de imagem (LGPD) — fotos em cultos e redes sociais
              </span>
            </label>
          </div>
        </div>
      )}
    </>
  )
}

function ItemLeitura({ label, valor, full }: { label: string; valor?: string | null; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">{valor?.trim() ? valor : '—'}</p>
    </div>
  )
}

function enderecoFicha(f: FichaMembro) {
  return [f.rua, f.numero, f.complemento, f.bairro, f.cidade, f.cep].filter(Boolean).join(', ')
}

export function FichaMembroLeitura({ form, fotoUrl }: { form: FichaMembro; fotoUrl?: string | null }) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center gap-3">
        {fotoUrl ? (
          <img src={fotoUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            {form.nome_completo.slice(0, 1) || '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{form.nome_completo || '—'}</p>
          <p className="text-sm text-gray-500">{form.telefone || 'Sem telefone'} · {form.email || 'Sem e-mail'}</p>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Pessoal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ItemLeitura label="Nascimento" valor={form.data_nascimento ? textoData(form.data_nascimento) : ''} />
          <ItemLeitura label="Gênero" valor={form.genero} />
          <ItemLeitura label="Estado civil" valor={form.estado_civil} />
          <ItemLeitura label="Naturalidade" valor={form.naturalidade} />
          <ItemLeitura label="Escolaridade" valor={form.escolaridade} />
          <ItemLeitura label="Profissão" valor={form.profissao} />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Contato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ItemLeitura label="Telefone" valor={form.telefone} />
          <ItemLeitura label="E-mail" valor={form.email} />
          <ItemLeitura label="Endereço" valor={enderecoFicha(form)} full />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Família</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ItemLeitura label="Casamento" valor={form.data_casamento ? textoData(form.data_casamento) : ''} />
          <ItemLeitura label="Possui filhos" valor={form.tem_filhos ? 'Sim' : 'Não'} />
          {form.tem_filhos && <ItemLeitura label="Filhos" valor={form.filhos_info} full />}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Igreja</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ItemLeitura label="Frequenta desde" valor={textoAdmissao(form)} />
          <ItemLeitura label="Forma de admissão" valor={form.forma_admissao} />
          <ItemLeitura label="Igreja de procedência" valor={form.igreja_procedencia} />
          <ItemLeitura label="Batismo nas águas" valor={textoBatismo(form)} />
          <ItemLeitura label="Cursos teológicos" valor={form.cursos_teologicos} full />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Saúde e extra</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ItemLeitura label="Tipo sanguíneo" valor={form.tipo_sanguineo} />
          <ItemLeitura label="Camiseta" valor={form.tamanho_camiseta} />
          <ItemLeitura label="Alergias / restrições" valor={form.alergias_restricoes} full />
          <ItemLeitura label="Emergência — nome" valor={form.contato_emergencia_nome} />
          <ItemLeitura label="Emergência — telefone" valor={form.contato_emergencia_telefone} />
          <ItemLeitura label="Habilidades" valor={form.habilidades} full />
          <ItemLeitura label="Autorização de imagem" valor={form.autorizacao_imagem ? 'Sim' : 'Não'} />
        </div>
      </section>
    </div>
  )
}

function textoData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
}
