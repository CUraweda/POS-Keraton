<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch, watchEffect } from 'vue'
import LoginHelper from '@/utilities/LoginHelper'
import GlobalHelper from '@/utilities/GlobalHelper'

const { userData, userLogout } = LoginHelper
const activeLink = ref(0)
const router = useRouter()
const route = useRoute()
let isCurawedaAccount = ref(false)

const determineActiveLink = () => {
  const path = route.path
  const name = route.name
  if (path === '/') {
    activeLink.value = 0 // Home link active
  } else if (path.includes('/invoice')) {
    activeLink.value = 1 // Add link active
  } else if (path.includes('/report')) {
    activeLink.value = 2 // Report link active
  } else if (path.includes('/checkout')) {
    activeLink.value = 3
  } else if (path.includes('/report-curaweda')) {
    activeLink.value = 4
  } else if (path.includes('/settings')) {
    activeLink.value = 5
  } else {
    activeLink.value = -1 // No specific link active
  }
}

const reportCuraweda = () => {
  if (userData.value.role === 'SUPER_ADMIN') {
    router.push('/report-curaweda')
  }
}
const toSettings = () => {
  if (userData.value.role === 'CASHIER') {
    GlobalHelper.assignAlert(
      true,
      'Error',
      'danger',
      'Kamu tidak memiliki akses yang cukup untuk membuka fitur ini!'
    )
  } else router.push('/settings')
}
watch(
  () => route.path,
  () => {
    determineActiveLink()
  }
)
onMounted(() => {
  if (!userData.value) {
    userLogout()
    router.replace('/login')
  } else {
    isCurawedaAccount = userData.value.role === 'CURAWEDA'
    determineActiveLink()
  }
})

// const showTooltip = (event) => {
//   const tooltip = document.getElementById('tooltip')
//   tooltip.textContent = event.target.getAttribute('name')
//   tooltip.style.display = 'block'
//   tooltip.style.top = `${event.clientY + window.scrollY + 20}px`
//   tooltip.style.left = `${event.clientX + window.scrollX + 20}px`
// }

// const hideTooltip = () => {
//   const tooltip = document.getElementById('tooltip')
//   tooltip.style.display = 'none'
// }

watchEffect(() => {
  if (!userData.value) {
    userLogout()
    router.replace('/login')
  }
})
</script>

<template>
  <div>
    <nav class="mobile-navbar">
      <button @click="toggleMenu" class="menu-button">☰</button>
      <div v-if="menuOpen" class="menu-overlay" @click.self="toggleMenu">
        <div class="menu" @click.stop>
          <ul>
            <li v-if="!isCurawedaAccount">
              <RouterLink to="/" :class="{ active: activeLink === 0 }" @click="toggleMenu"
                >Dashboard</RouterLink
              >
            </li>
            <li v-if="!isCurawedaAccount">
              <RouterLink to="/invoice" :class="{ active: activeLink === 1 }" @click="toggleMenu"
                >Invoice</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/report" :class="{ active: activeLink === 2 }" @click="toggleMenu"
                >Report</RouterLink
              >
            </li>
            <li v-if="!isCurawedaAccount">
              <RouterLink to="/checkout" :class="{ active: activeLink === 3 }" @click="toggleMenu"
                >Checkout</RouterLink
              >
            </li>
            <li v-if="!isCurawedaAccount">
              <a
                @click="toSettings(), toggleMenu()"
                :class="{ active: activeLink === 5 }"
                v-if="!isCurawedaAccount"
                style="cursor: pointer"
              >
                Settings
              </a>
            </li>
            <li v-if="isCurawedaAccount">
              <RouterLink
                to="/report-curaweda"
                :class="{ active: activeLink === 4 }"
                @click="toggleMenu"
              >
                Report Curaweda
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/login"
                name="Logout"
                @click="userLogout(), router.replace('/login'), toggleMenu()"
                @mouseover="showTooltip"
                @mouseleave="hideTooltip"
              >
                Logout</RouterLink
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    }
  }
}
</script>

<style scoped>
.mobile-navbar {
  display: none;
  background-color: #ffd978;
  padding: 10px;
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
}

.menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  z-index: 9999999;
  padding: 10px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  margin: 10px 0;
}

.menu a {
  text-decoration: none;
  color: black;
}

/* Responsive styles */
@media (max-width: 700px) {
  .mobile-navbar {
    display: block;
  }
}
</style>
