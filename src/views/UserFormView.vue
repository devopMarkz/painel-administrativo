<script setup lang="ts">
import { ref } from 'vue'; import { useRouter } from 'vue-router'; import { usuariosApi } from '../api/resources'; import { errorMessage } from '../api/client'; import type { PerfilUsuario } from '../types'
const router = useRouter(); const nome = ref(''); const email = ref(''); const senha = ref(''); const perfil = ref<PerfilUsuario>('ADVOGADO'); const error = ref(''); const loading = ref(false)
async function submit() { loading.value = true; error.value = ''; try { await usuariosApi.criar({ nome: nome.value, email: email.value, senha: senha.value, perfil: perfil.value }); router.push('/usuarios') } catch (e) { error.value = errorMessage(e) } finally { loading.value = false } }
</script>

<template>
  <section class="page narrow">
    <header class="page-header">
      <div>
        <p class="eyebrow">Administração</p>
        <h1>Novo usuário</h1>
        <p class="muted">Credenciais de acesso ao portal administrativo.</p>
      </div>
      <RouterLink class="secondary button" to="/usuarios">Cancelar</RouterLink>
    </header>

    <form class="card form" @submit.prevent="submit">
      <p v-if="error" class="alert error">{{ error }}</p>

      <label>Nome
        <input v-model.trim="nome" required maxlength="150" />
      </label>

      <div class="grid">
        <label>E-mail
          <input v-model.trim="email" type="email" required />
        </label>
        <label>Senha
          <input v-model="senha" type="password" required minlength="8" maxlength="100" />
          <small>Mínimo de 8 caracteres.</small>
        </label>
      </div>

      <label>Perfil
        <select v-model="perfil">
          <option value="ADVOGADO">Advogado</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="CLIENTE">Cliente</option>
        </select>
      </label>

      <div class="form-foot">
        <button class="primary" :disabled="loading">{{ loading ? 'Criando...' : 'Criar usuário' }}</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.page {
  max-width: 720px;
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
  border-top: 3px solid #1e4080;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.form { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #475569;
}
input, select {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: .92rem;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
  color: #0f172a;
  background: #fff;
}
input:focus, select:focus { outline: none; border-color: #1e4080; box-shadow: 0 0 0 3px rgba(30,64,128,.14); }
small {
  font-size: .74rem;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
  color: #94a3b8;
}

.form-foot { display: flex; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 18px; }
.primary {
  background: #1e4080;
  color: #fff;
  border: 1px solid #1e4080;
  border-radius: 4px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
}
.primary:hover:not(:disabled) { background: #17325f; }
.primary:disabled { opacity: .6; cursor: not-allowed; }
.secondary.button {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #334155;
  padding: 9px 16px;
  font-weight: 600;
  font-size: .875rem;
  text-decoration: none;
}
.secondary.button:hover { border-color: #94a3b8; background: #f8fafc; }

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
