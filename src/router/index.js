import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import DashboardView from '@/views/DashboardView.vue'
import AddView from '@/views/AddView.vue'
import InvoiceView from '@/views/InvoiceView.vue'
import ReportView from '@/views/ReportView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import GenerateTicketsView from '@/views/GenerateTicketsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import DatabaseLogsView from '@/views/DatabaseLogsView.vue'
import BackupView from '@/views/BackupView.vue'
import AfterCheckoutView from '@/views/AfterCheckoutView.vue'
import reportCurawedaView from '@/views/ReportViewCuraweda.vue'
import ReportCuraweda from '@/views/ReportCuraweda.vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import RekapKeramaianView from '@/views/RekapKeramaian.vue'
import LoginHelper from '@/utilities/LoginHelper'
import RekapView from '@/views/RekapanView.vue'
import UserManageView from '@/views/UserManageView.vue'

const { giveAccessRoute, grantAccessRoute } = GlobalHelper
const { isAuthenticated, userData } = LoginHelper

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/manage-user',
      name: 'Manage',
      component: UserManageView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/rekap',
      name: 'Rekap',
      component: RekapView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/rekap-keramaian',
      name: 'Rekap Keramaian',
      component: RekapKeramaianView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/report-curaweda',
      name: 'reportCuraweda',
      component: ReportCuraweda,
      meta: { protected: true  }
    },
    {
      path: '/add',
      name: 'add',
      component: AddView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: AddView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/checkout/generate-tickets/:id',
      name: 'generateTickets',
      component: GenerateTicketsView,
      meta: { restrictCuraweda: true }
    },
    {
      path: '/invoice',
      name: 'invoice',
      component: InvoiceView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView,
      meta: { protected: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/database-logs',
      name: 'databaseLogs',
      component: DatabaseLogsView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/backup',
      name: 'databaseBackup',
      component: BackupView,
      meta: { protected: true, restrictCuraweda: true }
    },
    {
      path: '/after-checkout',
      name: 'after-checkout',
      component: AfterCheckoutView
    },

    {
      path: '/:pathMatch(.)',
      name: '404',
      redirect: { name: 'dashboard' }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  try {
    const authenticated = await isAuthenticated()
    if (to.meta.protected && !authenticated) {
      next('/login')
    } else if (to.path === '/login' && authenticated) {
      next(from)
    } else if (to.meta.restrictAccess && !giveAccessRoute.value) {
      next(from)
    } else if (to.meta.restrictCuraweda) {
      if (userData.value.role != 'CURAWEDA') return next()
      next({ path: '/report-curaweda' })
    } else {
      if (to.meta.restrictAccess) grantAccessRoute(false)
      next()
    }
  } catch (error) {
    console.error(error)
    next('/login')
  }
})

export default router
