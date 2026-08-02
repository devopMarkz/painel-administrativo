export type PerfilUsuario = 'ADMINISTRADOR' | 'ADVOGADO' | 'CLIENTE'
export interface Usuario { id: number; nome: string; email: string; perfil: PerfilUsuario; ativo: boolean; dataCriacao: string; dataAtualizacao: string }
export interface LoginResponse { accessToken: string; tokenType: string; expiresAt: string; usuario: Usuario }
export interface TipoImposto { id: number; nome: string; sigla: string; ativo: boolean; dataCriacao: string; dataAtualizacao: string }
export interface Documento { id: number; idUsuario: number; idTipoImposto: number; tipoImposto: TipoImposto; municipio: string; periodoVigencia: string; periodoFormatado: string; nomeOriginal: string; mimeType: string; tamanhoBytes: number; dataUpload: string; dataAtualizacao: string; quantidadeLinks: number }
export interface Link { id: number; uuid: string; idDocumento: number; documento: { id: number; municipio: string; periodoFormatado: string; tipoImposto: { sigla: string } } | null; exigeSenha: boolean; expiresAt: string | null; revogado: boolean; dataCriacao: string; dataAtualizacao: string; urlCompleta: string; ativo: boolean }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number; first: boolean; last: boolean }
export interface ApiError { path: string; message: string; status: number; timestamp: string }