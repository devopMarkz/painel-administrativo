<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import { documentosApi, linksApi } from '../api/resources'; import { errorMessage } from '../api/client'
const route = useRoute(); const router = useRouter(); const isEdit = route.path.startsWith('/links/'); const linkId = isEdit ? Number(route.params.id) : null; const documentId = isEdit ? null : Number(route.params.id); const exigeSenha = ref(true); const senha = ref(''); const expiresAt = ref(''); const error = ref(''); const loading = ref(false)
onMounted(async () => { if (!linkId) return; try { const { data } = await linksApi.buscar(linkId); exigeSenha.value = data.exigeSenha; expiresAt.value = data.expiresAt?.slice(0, 16) || '' } catch (e) { error.value = errorMessage(e) } })
async function submit() { if (exigeSenha.value && !senha.value && !linkId) return error.value = 'Informe a senha do link.'; loading.value = true; error.value = ''; const data = { exigeSenha: exigeSenha.value, senha: exigeSenha.value ? (senha.value || undefined) : null, expiresAt: expiresAt.value ? `${expiresAt.value}:00` : null }; try { const result = linkId ? await linksApi.atualizar(linkId, data) : await documentosApi.criarLink(documentId!, data); router.push(`/documentos/${result.data.idDocumento}`) } catch (e) { error.value = errorMessage(e) } finally { loading.value = false } }
</script>

<template>
  <section class="page narrow">
    <header class="page-header">
      <div>
        <p class="eyebrow">Compartilhamento</p>
        <h1>{{ linkId ? 'Editar link' : 'Gerar link' }}</h1>
        <p class="muted">Defina proteção por senha e prazo de validade do acesso externo.</p>
      </div>
      <button class="secondary" @click="router.back()">Cancelar</button>
    </header>

    <form class="card form" @submit.prevent="submit">
      <p v-if="error" class="alert error">{{ error }}</p>

      <label class="check">
        <input v-model="exigeSenha" type="checkbox" />
        <span>Exigir senha para abrir o link</span>
      </label>

      <label v-if="exigeSenha">{{ linkId ? 'Nova senha (vazio mantém a atual)' : 'Senha' }}
        <input v-model="senha" type="password" :required="!linkId" />
      </label>

      <label>Expira em (opcional)
        <input v-model="expiresAt" type="datetime-local" />
        <small>Sem data de expiração, o link permanece válido até ser revogado.</small>
      </label>

      <div class="form-foot">
        <button class="primary" :disabled="loading">{{ loading ? 'Salvando...' : linkId ? 'Salvar alterações' : 'Criar link' }}</button>
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
label.check {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px 14px;
  text-transform: none;
  letter-spacing: normal;
  font-size: .875rem;
  font-weight: 600;
  color: #334155;
}
label.check input { width: 16px; height: 16px; accent-color: #1e4080; }

input {
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
input:focus { outline: none; border-color: #1e4080; box-shadow: 0 0 0 3px rgba(30,64,128,.14); }
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
.secondary {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #334155;
  padding: 9px 16px;
  font-weight: 600;
  font-size: .875rem;
  cursor: pointer;
}
.secondary:hover { border-color: #94a3b8; background: #f8fafc; }

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
