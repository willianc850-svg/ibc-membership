export const BUCKET_DOCUMENTOS = 'documentos-ibc'

export type TipoDocumento = 'ata' | 'estatuto' | 'oficio' | 'outro'

export type Documento = {
  id: string
  titulo: string
  tipo: TipoDocumento
  storage_path: string
  criado_por: string | null
  created_at: string
}

export const TIPOS_DOCUMENTO: { valor: TipoDocumento; label: string }[] = [
  { valor: 'ata', label: 'ATA' },
  { valor: 'estatuto', label: 'Estatuto' },
  { valor: 'oficio', label: 'Ofício' },
  { valor: 'outro', label: 'Outro' },
]

export function labelTipoDocumento(tipo: string) {
  return TIPOS_DOCUMENTO.find((t) => t.valor === tipo)?.label ?? tipo
}
