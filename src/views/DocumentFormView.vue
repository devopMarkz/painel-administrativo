<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { useRouter } from 'vue-router'; import { documentosApi, tiposApi } from '../api/resources'; import { useAuthStore } from '../stores/auth'; import { errorMessage } from '../api/client'; import type { TipoImposto } from '../types'
import templateRepasseIcms from '../assets/templates/template_repasse_icms.xlsx?url'
import templateRepasseIpva from '../assets/templates/template_repasse_ipva.xlsx?url'
const router = useRouter(); const auth = useAuthStore(); const tipos = ref<TipoImposto[]>([]); const arquivo = ref<File | null>(null); const idTipoImposto = ref(''); const municipio = ref(''); const periodoVigencia = ref(''); const error = ref(''); const loading = ref(false)
const periodoValido = (valor: string) => /^(0[1-9]|1[0-2])-\d{4}$/.test(valor)
function mascararPeriodo(event: Event) {
  const input = event.target as HTMLInputElement
  let digitos = input.value.replace(/\D/g, '').slice(0, 6)
  if (digitos.length >= 2 && (Number(digitos.slice(0, 2)) < 1 || Number(digitos.slice(0, 2)) > 12)) digitos = digitos.slice(0, 1)
  const formatado = digitos.length > 2 ? `${digitos.slice(0, 2)}-${digitos.slice(2)}` : digitos
  input.value = formatado
  periodoVigencia.value = formatado
}
function bloquearCaracteresInvalidos(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  if (!/^\d$/.test(event.key)) event.preventDefault()
}
onMounted(async () => { try { tipos.value = (await tiposApi()).data } catch (e) { error.value = errorMessage(e) } })
async function submit() { if (!arquivo.value || !auth.usuario) return error.value = 'Preencha todos os campos e selecione o arquivo Excel.'; if (!periodoValido(periodoVigencia.value)) return error.value = 'Informe o período no formato MM-AAAA, com mês entre 01 e 12.'; loading.value = true; error.value = ''; const form = new FormData(); form.append('arquivo', arquivo.value); form.append('idTipoImposto', idTipoImposto.value); form.append('municipio', municipio.value); form.append('periodoVigencia', periodoVigencia.value); form.append('idUsuario', String(auth.usuario.id)); try { const { data } = await documentosApi.criar(form); router.push(`/documentos/${data.id}`) } catch (e) { error.value = errorMessage(e) } finally { loading.value = false } }
</script>

<template>
  <section class="page narrow">
    <header class="page-header">
      <div>
        <p class="eyebrow">Novo registro</p>
        <h1>Enviar demonstrativo</h1>
        <p class="muted">Somente planilhas .xlsx são aceitas pelo processador fiscal.</p>
      </div>
      <RouterLink class="secondary button" to="/documentos">Cancelar</RouterLink>
    </header>

    <form class="card form" @submit.prevent="submit">
      <p v-if="error" class="alert error">{{ error }}</p>

      <aside class="template-info" aria-labelledby="templates-title">
        <div>
          <p class="template-eyebrow">Modelos disponíveis</p>
          <h2 id="templates-title">Use o template correspondente ao imposto</h2>
          <p>Baixe o modelo antes de preencher a planilha. Isso garante que os repasses, municípios, categorias e totais sejam interpretados corretamente.</p>
        </div>
        <div class="template-actions">
          <a :href="templateRepasseIcms" download="template_repasse_icms.xlsx">Baixar template ICMS</a>
          <a :href="templateRepasseIpva" download="template_repasse_ipva.xlsx">Baixar template IPVA</a>
        </div>
      </aside>
      <label>Arquivo Excel (.xlsx)
        <input type="file" accept=".xlsx" required @change="arquivo = ($event.target as HTMLInputElement).files?.[0] || null" />
      </label>

      <div class="grid">
        <label>Tipo de imposto
          <select v-model="idTipoImposto" required>
            <option value="" disabled>Selecione</option>
            <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">{{ tipo.nome }} ({{ tipo.sigla }})</option>
          </select>
        </label>
        <label>Município
          <input v-model.trim="municipio" required />
        </label>
      </div>

      <label>Período de vigência
        <input :value="periodoVigencia" inputmode="numeric" maxlength="7" placeholder="MM-AAAA" pattern="(0[1-9]|1[0-2])-\d{4}" required @keydown="bloquearCaracteresInvalidos" @input="mascararPeriodo" />
        <small>Formato mês-ano, por exemplo 03-2026.</small>
      </label>

      <div class="form-foot">
        <button class="primary" :disabled="loading">{{ loading ? 'Enviando...' : 'Enviar documento' }}</button>
      </div>
    </form>
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
.page.narrow { max-width: 720px; }
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
.template-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  border: 1px solid #bfdbfe;
  border-left: 3px solid #1e4080;
  border-radius: 4px;
  background: #f8fbff;
}
.template-eyebrow {
  margin: 0 0 4px;
  color: #1e4080;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.template-info h2 {
  margin: 0;
  color: #1e293b;
  font-size: .98rem;
}
.template-info p:not(.template-eyebrow) {
  margin: 5px 0 0;
  color: #64748b;
  font-size: .82rem;
  line-height: 1.45;
}
.template-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px;
}
.template-actions a {
  border: 1px solid #1e4080;
  border-radius: 4px;
  padding: 8px 10px;
  color: #1e4080;
  background: #fff;
  font-size: .78rem;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}
.template-actions a:hover { background: #eaf2ff; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .template-info { align-items: flex-start; flex-direction: column; } }

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
input[type="file"] { padding: 9px 12px; background: #f8fafc; }
input[type="file"]::file-selector-button {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  padding: 6px 12px;
  margin-right: 12px;
  font-weight: 600;
  font-size: .8rem;
  color: #1e4080;
  cursor: pointer;
}
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
  white-space: nowrap;
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
