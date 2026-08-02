import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DocumentsView from '../views/DocumentsView.vue'
import DocumentFormView from '../views/DocumentFormView.vue'
import DocumentDetailView from '../views/DocumentDetailView.vue'
import LinkFormView from '../views/LinkFormView.vue'
import UsersView from '../views/UsersView.vue'
import UserFormView from '../views/UserFormView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', redirect: '/documentos' }, { path: '/login', component: LoginView, meta: { public: true } },
  { path: '/documentos', component: DocumentsView }, { path: '/documentos/novo', component: DocumentFormView }, { path: '/documentos/:id', component: DocumentDetailView, props: true },
  { path: '/documentos/:id/links/novo', component: LinkFormView, props: true }, { path: '/links/:id/editar', component: LinkFormView, props: true },
  { path: '/usuarios', component: UsersView, meta: { admin: true } }, { path: '/usuarios/novo', component: UserFormView, meta: { admin: true } }, { path: '/acesso-negado', component: ForbiddenView },
] })
router.beforeEach((to) => { const auth = useAuthStore(); if (!to.meta.public && !auth.isAuthenticated) return '/login'; if (to.meta.admin && !auth.isAdmin) return '/acesso-negado'; if (to.path === '/login' && auth.isAuthenticated) return '/documentos' })
export default router