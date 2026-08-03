<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { useRoute } from 'vue-router'; import { documentosApi, linksApi } from '../api/resources'; import { errorMessage } from '../api/client'; import type { Documento, Link } from '../types'
const route = useRoute(); const id = Number(route.params.id); const doc = ref<Documento | null>(null); const links = ref<Link[]>([]); const error = ref(''); const copied = ref(''); const linkParaExcluir = ref<Link | null>(null); const excluindo = ref(false)
const format = (v: string | null) => v ? new Date(v).toLocaleString('pt-BR') : 'Sem expiração'
async function load() { try { [doc.value, links.value] = await Promise.all([documentosApi.buscar(id).then(x => x.data), documentosApi.links(id).then(x => x.data)]) } catch (e) { error.value = errorMessage(e) } }
async function copy(link: Link) { await navigator.clipboard.writeText(link.urlCompleta); copied.value = String(link.id); setTimeout(() => copied.value = '', 1500) }
async function toggle(link: Link) { try { await (link.revogado ? linksApi.reativar(link.id) : linksApi.revogar(link.id)); await load() } catch (e) { error.value = errorMessage(e) } }
function solicitarExclusao(link: Link) { linkParaExcluir.value = link }
async function confirmarExclusao() {
  const link = linkParaExcluir.value
  if (!link) return
  excluindo.value = true
  try {
    await linksApi.excluir(link.id)
    linkParaExcluir.value = null
    await load()
  } catch (e) { error.value = errorMessage(e) } finally { excluindo.value = false }
}
onMounted(load)
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Documento</p>
        <h1>{{ doc?.nomeOriginal || 'Carregando...' }}</h1>
        <p class="muted">{{ doc?.municipio }} · {{ doc?.periodoFormatado }} · {{ doc?.tipoImposto.sigla }}</p>
      </div>
      <RouterLink class="primary button" :to="`/documentos/${id}/links/novo`">Gerar link</RouterLink>
    </header>

    <p v-if="error" class="alert error">{{ error }}</p>

    <div class="card details" v-if="doc">
      <div class="metric">
        <span class="metric-label">Enviado em</span>
        <strong>{{ format(doc.dataUpload) }}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">Tamanho</span>
        <strong>{{ doc.tamanhoBytes.toLocaleString('pt-BR') }} bytes</strong>
      </div>
      <div class="metric">
        <span class="metric-label">Links gerados</span>
        <strong>{{ doc.quantidadeLinks }}</strong>
      </div>
    </div>

    <h2>Links de compartilhamento</h2>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Proteção</th>
            <th>Expiração</th>
            <th>URL</th>
            <th class="right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.id">
            <td>
              <span class="badge" :class="link.ativo ? 'success' : 'neutral'">
                {{ link.ativo ? 'Ativo' : link.revogado ? 'Revogado' : 'Expirado' }}
              </span>
            </td>
            <td>{{ link.exigeSenha ? 'Com senha' : 'Sem senha' }}</td>
            <td class="dim">{{ format(link.expiresAt) }}</td>
            <td class="url">{{ link.urlCompleta }}</td>
            <td class="actions">
              <button @click="copy(link)">{{ copied === String(link.id) ? 'Copiado!' : 'Copiar' }}</button>
              <RouterLink :to="`/links/${link.id}/editar`">Editar</RouterLink>
              <button @click="toggle(link)">{{ link.revogado ? 'Reativar' : 'Revogar' }}</button>
              <button class="danger-text" @click="solicitarExclusao(link)">Excluir</button>
            </td>
          </tr>
          <tr v-if="!links.length">
            <td colspan="5" class="muted state">Nenhum link criado.</td>
          </tr>
        </tbody>
      </table>
    </div>
  
    <Teleport to="body">
      <div v-if="linkParaExcluir" class="modal-backdrop" @click.self="linkParaExcluir = null">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-link-title">
          <p class="eyebrow">Confirmação necessária</p>
          <h2 id="confirm-delete-link-title">Excluir link?</h2>
          <p>Este link de compartilhamento será removido permanentemente e não poderá mais ser acessado.</p>
          <div class="modal-actions">
            <button type="button" class="cancel-button" :disabled="excluindo" @click="linkParaExcluir = null">Cancelar</button>
            <button type="button" class="delete-button" :disabled="excluindo" @click="confirmarExclusao">{{ excluindo ? 'Excluindo...' : 'Excluir link' }}</button>
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
h1 { margin: 0; font-size: 1.65rem; letter-spacing: -.02em; word-break: break-word; }
h2 { margin: 8px 0 0; font-size: 1rem; letter-spacing: -.01em; color: #1e293b; }
.muted { color: #64748b; font-size: .85rem; margin: 4px 0 0; }

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}
@media (max-width: 640px) { .details { grid-template-columns: 1fr; } }
.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  border-right: 1px solid #f1f5f9;
}
.metric:last-child { border-right: 0; }
.metric-label {
  font-size: .68rem;
  letter-spacing: .09em;
  text-transform: uppercase;
  font-weight: 650;
  color: #94a3b8;
}
.metric strong { font-size: .95rem; font-variant-numeric: tabular-nums; }

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
.right { text-align: right; }
.dim { color: #64748b; white-space: nowrap; }
.state { padding: 24px 16px; text-align: center; }
.url {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .78rem;
  color: #334155;
  max-width: 340px;
  overflow-wrap: anywhere;
}

.badge {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .04em;
  border: 1px solid #dbe3ef;
  background: #eef2f8;
  color: #1e4080;
}
.badge.success { background: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
.badge.neutral { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

.actions { display: flex; gap: 12px; justify-content: flex-end; align-items: center; white-space: nowrap; }
.actions a, .actions button {
  background: none;
  border: 0;
  padding: 0;
  color: #1e4080;
  font-weight: 600;
  font-size: .82rem;
  text-decoration: none;
  cursor: pointer;
}
.actions a:hover, .actions button:hover { text-decoration: underline; }

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

.danger-text { color: #b91c1c !important; }
.modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(15, 23, 42, .42); }
.confirm-modal { width: min(100%, 440px); padding: 24px; border: 1px solid #e2e8f0; border-top: 3px solid #b91c1c; border-radius: 4px; background: #fff; box-shadow: 0 20px 44px rgba(15, 23, 42, .24); }
.confirm-modal h2 { margin: 4px 0 10px; color: #0f172a; font-size: 1.25rem; }
.confirm-modal p:not(.eyebrow) { margin: 0; color: #475569; font-size: .9rem; line-height: 1.55; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.cancel-button, .delete-button { border-radius: 4px; padding: 9px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.cancel-button { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
.delete-button { border: 1px solid #b91c1c; background: #b91c1c; color: #fff !important; }
.cancel-button:disabled, .delete-button:disabled { opacity: .6; cursor: wait; }
</style>
