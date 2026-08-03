import { api } from './client'
import type { Documento, Link, LoginResponse, Page, TipoImposto, Usuario } from '../types'

export const login = (email: string, senha: string) => api.post<LoginResponse>('/auth/login', { email, senha })
export const usuariosApi = { listar: () => api.get<Usuario[]>('/usuarios'), buscar: (id: number) => api.get<Usuario>(`/usuarios/${id}`), criar: (data: Pick<Usuario, 'nome' | 'email' | 'perfil'> & { senha: string }) => api.post<Usuario>('/usuarios', data) }
export const tiposApi = () => api.get<TipoImposto[]>('/tipos-imposto')
export const documentosApi = {
  listar: (params: Record<string, string | number | undefined>) => api.get<Page<Documento>>('/documentos', { params }),
  buscar: (id: number) => api.get<Documento>(`/documentos/${id}`),
  criar: (data: FormData) => api.post<Documento>('/documentos', data),
  excluir: (id: number) => api.delete(`/documentos/${id}`),
  baixar: (id: number) => api.get(`/documentos/${id}/download`, { responseType: 'blob' }),
  links: (id: number) => api.get<Link[]>(`/documentos/${id}/links`),
  criarLink: (id: number, data: { exigeSenha: boolean; senha?: string | null; expiresAt?: string | null }) => api.post<Link>(`/documentos/${id}/links`, data),
}
export const linksApi = {
  buscar: (id: number) => api.get<Link>(`/links/${id}`),
  atualizar: (id: number, data: { exigeSenha: boolean; senha?: string | null; expiresAt?: string | null }) => api.put<Link>(`/links/${id}`, data),
  revogar: (id: number) => api.put<Link>(`/links/${id}/revogar`), reativar: (id: number) => api.put<Link>(`/links/${id}/reativar`), excluir: (id: number) => api.delete(`/links/${id}`),
}