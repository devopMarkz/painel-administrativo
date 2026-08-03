<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { useRouter } from 'vue-router'; import { documentosApi } from '../api/resources'; import { errorMessage } from '../api/client'; import type { Documento, Page } from '../types'
const router = useRouter(); const page = ref<Page<Documento> | null>(null); const municipio = ref(''); const periodo = ref(''); const loading = ref(false); const baixandoId = ref<number | null>(null); const documentoParaExcluir = ref<Documento | null>(null); const excluindo = ref(false); const error = ref('')
const date = (v: string) => new Date(v).toLocaleString('pt-BR')
const periodoValido = (valor: string) => /^(0[1-9]|1[0-2])-\d{4}$/.test(valor)
function mascararPeriodo(event: Event) {
  const input = event.target as HTMLInputElement
  let digitos = input.value.replace(/\D/g, '').slice(0, 6)
  if (digitos.length >= 2 && (Number(digitos.slice(0, 2)) < 1 || Number(digitos.slice(0, 2)) > 12)) digitos = digitos.slice(0, 1)
  const formatado = digitos.length > 2 ? `${digitos.slice(0, 2)}-${digitos.slice(2)}` : digitos
  input.value = formatado
  periodo.value = formatado
}
function bloquearCaracteresInvalidos(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  if (!/^\d$/.test(event.key)) event.preventDefault()
}
async function load(index = 0) { if (periodo.value && !periodoValido(periodo.value)) { error.value = 'Informe o período no formato MM-AAAA, com mês entre 01 e 12.'; return }; loading.value = true; error.value = ''; try { page.value = (await documentosApi.listar({ municipio: municipio.value || undefined, periodo: periodo.value || undefined, page: index, size: 20 })).data } catch (e) { error.value = errorMessage(e) } finally { loading.value = false } }
function solicitarExclusao(doc: Documento) { documentoParaExcluir.value = doc }
async function confirmarExclusao() {
  const doc = documentoParaExcluir.value
  if (!doc) return
  excluindo.value = true
  try {
    await documentosApi.excluir(doc.id)
    documentoParaExcluir.value = null
    await load(page.value?.number || 0)
  } catch (e) { error.value = errorMessage(e) } finally { excluindo.value = false }
}
async function baixar(doc: Documento) {
  baixandoId.value = doc.id
  try {
    const response = await documentosApi.baixar(doc.id)
    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = doc.nomeOriginal
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) { error.value = errorMessage(e) } finally { baixandoId.value = null }
}
onMounted(load)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Gestão</p>
        <h1>Documentos</h1>
        <p class="muted">Demonstrativos enviados e seus links de compartilhamento.</p>
      </div>
      <RouterLink class="primary button" to="/documentos/novo">Novo documento</RouterLink>
    </header>

    <form class="filters card" @submit.prevent="load(0)">
      <label class="field">
        <span>Município</span>
        <input v-model="municipio" placeholder="Filtrar por município" />
      </label>
      <label class="field">
        <span>Período</span>
        <input :value="periodo" inputmode="numeric" maxlength="7" placeholder="MM-AAAA" @keydown="bloquearCaracteresInvalidos" @input="mascararPeriodo" />
      </label>
      <button class="secondary">Filtrar</button>
    </form>

    <p v-if="error" class="alert error">{{ error }}</p>

    <div class="card table-wrap">
      <p v-if="loading" class="muted state">Carregando...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Município</th>
            <th>Período</th>
            <th>Tipo</th>
            <th class="num">Links</th>
            <th>Upload</th>
            <th class="right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in page?.content" :key="doc.id">
            <td><strong>{{ doc.nomeOriginal }}</strong></td>
            <td>{{ doc.municipio }}</td>
            <td>{{ doc.periodoFormatado }}</td>
            <td><span class="badge">{{ doc.tipoImposto.sigla }}</span></td>
            <td class="num">{{ doc.quantidadeLinks }}</td>
            <td class="dim">{{ date(doc.dataUpload) }}</td>
            <td class="actions">
              <RouterLink :to="`/documentos/${doc.id}`">Links</RouterLink>
              <button class="link-button" :disabled="baixandoId === doc.id" @click="baixar(doc)">{{ baixandoId === doc.id ? 'Baixando...' : 'Baixar' }}</button>
              <button class="danger-text" @click="solicitarExclusao(doc)">Excluir</button>
            </td>
          </tr>
          <tr v-if="!page?.content.length">
            <td colspan="7" class="muted state">Nenhum documento encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="page" class="pager">
      <button :disabled="page.first" @click="load(page.number - 1)">Anterior</button>
      <span>Página {{ page.number + 1 }} de {{ page.totalPages || 1 }}</span>
      <button :disabled="page.last" @click="load(page.number + 1)">Próxima</button>
    </footer>
  
    <Teleport to="body">
      <div v-if="documentoParaExcluir" class="modal-backdrop" @click.self="documentoParaExcluir = null">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <p class="eyebrow">Confirmação necessária</p>
          <h2 id="confirm-delete-title">Excluir documento?</h2>
          <p>O arquivo <strong>{{ documentoParaExcluir.nomeOriginal }}</strong> e todos os seus links de compartilhamento serão removidos permanentemente.</p>
          <div class="modal-actions">
            <button type="button" class="cancel-button" :disabled="excluindo" @click="documentoParaExcluir = null">Cancelar</button>
            <button type="button" class="delete-button" :disabled="excluindo" @click="confirmarExclusao">{{ excluindo ? 'Excluindo...' : 'Excluir documento' }}</button>
          </div>
        </section>
      </div>
    </Teleport>  </section>
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
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field span {
  font-size: .7rem;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #64748b;
}
input {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 9px 11px;
  font-size: .9rem;
  min-width: 220px;
  background: #fff;
  color: #0f172a;
}
input:focus { outline: none; border-color: #1e4080; box-shadow: 0 0 0 3px rgba(30,64,128,.14); }

.button, button {
  border-radius: 4px;
  font-weight: 600;
  font-size: .875rem;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.primary.button {
  background: #1e4080;
  color: #fff;
  border: 1px solid #1e4080;
  padding: 10px 16px;
  text-decoration: none;
  white-space: nowrap;
}
.primary.button:hover { background: #17325f; }
.secondary {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
}
.secondary:hover { border-color: #94a3b8; background: #f8fafc; }

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
  white-space: nowrap;
}
tbody td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #f8fafc; }
.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
.right { text-align: right; }
.dim { color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }
.state { padding: 24px 16px; text-align: center; }

.badge {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .04em;
  background: #eef2f8;
  color: #1e4080;
  border: 1px solid #dbe3ef;
}
.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  white-space: nowrap;
}
/* Altura, linha e centralização idênticas evitam o deslocamento nativo do button. */
.actions > a,
.actions > button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 20px;
  margin: 0;
  padding: 0;
  background: none;
  border: 0;
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  font-weight: 600;
  line-height: 19px;
  text-decoration: none;
}
.actions a { color: #1e4080; }
.actions a:hover,
.link-button:hover:not(:disabled),
.danger-text:hover { text-decoration: underline; }
/* Largura reservada no botão para o texto "Baixando..." não empurrar as outras ações */
.link-button {
  color: #1e4080;
  justify-content: flex-start;
}
.link-button:disabled { opacity: .6; cursor: wait; }
.danger-text { color: #b91c1c; }

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
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: .85rem;
  color: #475569;
}
.pager button {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 8px 14px;
}
.pager button:disabled { opacity: .45; cursor: not-allowed; }

.modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(15, 23, 42, .42); }
.confirm-modal { width: min(100%, 440px); padding: 24px; border: 1px solid #e2e8f0; border-top: 3px solid #b91c1c; border-radius: 4px; background: #fff; box-shadow: 0 20px 44px rgba(15, 23, 42, .24); }
.confirm-modal h2 { margin: 4px 0 10px; color: #0f172a; font-size: 1.25rem; }
.confirm-modal p:not(.eyebrow) { margin: 0; color: #475569; font-size: .9rem; line-height: 1.55; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.cancel-button, .delete-button { border-radius: 4px; padding: 9px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.cancel-button { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
.delete-button { border: 1px solid #b91c1c; background: #b91c1c; color: #fff; }
.cancel-button:disabled, .delete-button:disabled { opacity: .6; cursor: wait; }
</style>
