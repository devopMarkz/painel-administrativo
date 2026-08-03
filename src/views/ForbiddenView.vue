<template>
  <section class="page narrow">
    <div class="card">
      <p class="eyebrow">Erro 403</p>
      <h1>Acesso não autorizado</h1>
      <p class="muted">Seu perfil não possui permissão para acessar este recurso. Caso acredite se tratar de um engano, contate o administrador do sistema.</p>
      <RouterLink class="primary button" to="/documentos">Voltar aos documentos</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.page {
  min-height: 70vh;
  max-width: 560px;
  margin: 0 auto;
  padding: 64px 24px;
  display: grid;
  place-items: center;
  color: #0f172a;
}
.card {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #b91c1c;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
  padding: 32px;
  text-align: left;
}
.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: .12em;
  font-size: .68rem;
  font-weight: 650;
  color: #b91c1c;
}
h1 { margin: 0 0 8px; font-size: 1.5rem; letter-spacing: -.02em; }
.muted { color: #64748b; font-size: .9rem; margin: 0 0 22px; line-height: 1.55; }
.primary.button {
  display: inline-block;
  background: #1e4080;
  color: #fff;
  border: 1px solid #1e4080;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: .875rem;
  text-decoration: none;
}
.primary.button:hover { background: #17325f; }
</style>
