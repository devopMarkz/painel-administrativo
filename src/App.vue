<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore(); const router = useRouter()
function logout() { auth.logout(); router.push('/login') }
</script>
<template>
  <div class="app-shell" :class="{ guest: !auth.isAuthenticated }">
    <aside v-if="auth.isAuthenticated" class="sidebar"><div class="brand">Repasses Municipais<span>Área administrativa</span></div><nav><RouterLink to="/documentos">Documentos</RouterLink><RouterLink v-if="auth.isAdmin" to="/usuarios">Usuários</RouterLink></nav><div class="account"><strong>{{ auth.usuario?.nome }}</strong><small>{{ auth.usuario?.perfil }}</small><button class="link-button" @click="logout">Sair</button></div></aside>
    <main><RouterView /></main>
  </div>
</template>