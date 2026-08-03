<script setup lang="ts">
import { ref } from 'vue'; import { useRouter } from 'vue-router'; import { useAuthStore } from '../stores/auth'; import { errorMessage } from '../api/client'
const email = ref(''); const senha = ref(''); const loading = ref(false); const error = ref(''); const auth = useAuthStore(); const router = useRouter()
async function submit() { error.value = ''; loading.value = true; try { await auth.signIn(email.value, senha.value); router.push('/documentos') } catch (e) { error.value = e instanceof Error ? e.message : errorMessage(e) } finally { loading.value = false } }
</script>

<template>
  <section class="login-page">
    <div class="login-brand">
      <div class="brand-mark">SF</div>
      <div>
        <p class="brand-name">Portal Fiscal</p>
        <p class="brand-sub">Gestão e compartilhamento de repasse municipal</p>
      </div>
    </div>

    <form class="card login-card" @submit.prevent="submit">
      <p class="eyebrow">Sistema de compartilhamento</p>
      <h1>Área administrativa</h1>

      <p v-if="error" class="alert error">{{ error }}</p>

      <label>E-mail
        <input v-model.trim="email" type="email" autocomplete="email" placeholder="nome@orgao.gov.br" required />
      </label>
      <label>Senha
        <input v-model="senha" type="password" autocomplete="current-password" placeholder="••••••••" required />
      </label>

      <button :disabled="loading" class="primary">{{ loading ? 'Entrando...' : 'Entrar' }}</button>

      <p class="login-foot">Acesso restrito · registros de auditoria habilitados</p>
    </form>
  </section>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 48px 20px;
  background:
    radial-gradient(1100px 520px at 12% -10%, rgba(30, 64, 128, 0.10), transparent 60%),
    linear-gradient(180deg, #f6f8fb 0%, #eef2f7 100%);
}
.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  width: min(420px, 100%);
}
.brand-mark {
  width: 42px; height: 42px;
  border-radius: 4px;
  display: grid; place-items: center;
  background: linear-gradient(160deg, #1e4080, #14294f);
  color: #fff;
  font-weight: 700;
  letter-spacing: .06em;
  font-size: .9rem;
}
.brand-name { margin: 0; font-weight: 650; color: #14294f; letter-spacing: -.01em; }
.brand-sub { margin: 2px 0 0; font-size: .8rem; color: #64748b; }

.login-card {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #1e4080;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04), 0 12px 32px -12px rgba(15, 23, 42, .18);
}
.login-card .eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: .12em;
  font-size: .68rem;
  font-weight: 650;
  color: #1e4080;
}
.login-card h1 { margin: 0; font-size: 1.5rem; letter-spacing: -.02em; color: #0f172a; }
.login-card .muted { margin: 0 0 6px; color: #64748b; font-size: .875rem; }

.login-card label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .02em;
  color: #334155;
}
.login-card input {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: .95rem;
  font-weight: 400;
  color: #0f172a;
  background: #fff;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.login-card input:focus {
  outline: none;
  border-color: #1e4080;
  box-shadow: 0 0 0 3px rgba(30, 64, 128, .14);
}
.login-card .primary {
  margin-top: 6px;
  border: 0;
  border-radius: 4px;
  padding: 11px 16px;
  background: #1e4080;
  color: #fff;
  font-weight: 600;
  font-size: .92rem;
  cursor: pointer;
  transition: background .15s ease;
}
.login-card .primary:hover:not(:disabled) { background: #17325f; }
.login-card .primary:disabled { opacity: .6; cursor: not-allowed; }

.alert.error {
  margin: 0;
  border-radius: 4px;
  border: 1px solid #fca5a5;
  border-left: 3px solid #b91c1c;
  background: #fef2f2;
  color: #991b1b;
  padding: 10px 12px;
  font-size: .85rem;
}
.login-foot {
  margin: 4px 0 0;
  text-align: center;
  font-size: .72rem;
  color: #94a3b8;
}
</style>
