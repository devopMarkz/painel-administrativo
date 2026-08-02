import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login } from '../api/resources'
import type { Usuario } from '../types'

const KEY = 'demonstrativos.admin.session'
type Session = { accessToken: string; expiresAt: string; usuario: Usuario }
const saved = (): Session | null => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { return null } }
export const useAuthStore = defineStore('auth', () => {
  const initial = saved(); const accessToken = ref(initial?.accessToken || ''); const expiresAt = ref(initial?.expiresAt || ''); const usuario = ref<Usuario | null>(initial?.usuario || null)
  const isAuthenticated = computed(() => !!accessToken.value && !!usuario.value && new Date(expiresAt.value) > new Date())
  const isAdmin = computed(() => usuario.value?.perfil === 'ADMINISTRADOR')
  function persist() { if (usuario.value && accessToken.value) sessionStorage.setItem(KEY, JSON.stringify({ accessToken: accessToken.value, expiresAt: expiresAt.value, usuario: usuario.value })) }
  async function signIn(email: string, senha: string) { const { data } = await login(email, senha); if (data.usuario.perfil === 'CLIENTE') throw new Error('Este perfil não possui acesso à área administrativa.'); accessToken.value = data.accessToken; expiresAt.value = data.expiresAt; usuario.value = data.usuario; persist() }
  function logout() { accessToken.value = ''; expiresAt.value = ''; usuario.value = null; sessionStorage.removeItem(KEY) }
  return { accessToken, expiresAt, usuario, isAuthenticated, isAdmin, signIn, logout }
})