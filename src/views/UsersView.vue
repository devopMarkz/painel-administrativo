<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { usuariosApi } from '../api/resources'; import { errorMessage } from '../api/client'; import type { Usuario } from '../types'
const users = ref<Usuario[]>([]); const error = ref(''); onMounted(async () => { try { users.value = (await usuariosApi.listar()).data } catch (e) { error.value = errorMessage(e) } })
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Administração</p>
        <h1>Usuários</h1>
        <p class="muted">Perfis com acesso ao portal de demonstrativos.</p>
      </div>
      <RouterLink class="primary button" to="/usuarios/novo">Novo usuário</RouterLink>
    </header>

    <p v-if="error" class="alert error">{{ error }}</p>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><strong>{{ user.nome }}</strong></td>
            <td class="dim">{{ user.email }}</td>
            <td><span class="badge">{{ user.perfil }}</span></td>
            <td>
              <span class="status" :class="user.ativo ? 'on' : 'off'">
                <i></i>{{ user.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="4" class="muted state">Nenhum usuário cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #0f172a;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: .12em;
  font-size: .68rem;
  font-weight: 650;
  color: #1e4080;
}
h1 { margin: 0; font-size: 1.65rem; letter-spacing: -.02em; }
.muted { color: #64748b; font-size: .85rem; margin: 4px 0 0; }

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: .875rem; }
thead th {
  text-align: left;
  padding: 11px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: .68rem;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 650;
}
tbody td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #f8fafc; }
.dim { color: #64748b; }
.state { padding: 24px 16px; text-align: center; }

.badge {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: .7rem;
  font-weight: 650;
  letter-spacing: .06em;
  background: #eef2f8;
  color: #1e4080;
  border: 1px solid #dbe3ef;
}
.status { display: inline-flex; align-items: center; gap: 7px; font-weight: 600; font-size: .82rem; }
.status i { width: 7px; height: 7px; border-radius: 4px; display: inline-block; }
.status.on { color: #15803d; }
.status.on i { background: #16a34a; }
.status.off { color: #64748b; }
.status.off i { background: #94a3b8; }

.primary.button {
  background: #1e4080;
  color: #fff;
  border: 1px solid #1e4080;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: .875rem;
  text-decoration: none;
  white-space: nowrap;
}
.primary.button:hover { background: #17325f; }

.alert.error {
  margin: 0;
  border: 1px solid #fca5a5;
  border-left: 3px solid #b91c1c;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: .85rem;
}
</style>
