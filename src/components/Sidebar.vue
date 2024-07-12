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
  <nav>
    <div class="logo">
      <img src="../assets/images/Logo KKC.svg" alt="" />
    </div>
    <div
      id="tooltip"
      style="
        position: absolute;
        display: none;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 0.5rem;
        border-radius: 0.5rem;
        font-family: 'Poppins';
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        white-space: nowrap;
        z-index: 9999;
      "
    ></div>
    <div style="overflow-y: auto; overflow-x: hidden; height: 100%">
      <div class="navbar-links">
        <!-- Menggunakan router-link dengan params -->
        <div class="navbar-links-container flex fd-col" v-if="!isCurawedaAccount">
          <RouterLink
            to="/"
            :class="{ active: activeLink === 0 }"
            name="Dashboard"
            @mouseover="showTooltip"
            @mouseleave="hideTooltip"
          >
            <ph-house :size="24" weight="bold" />
          </RouterLink>
          <RouterLink to="/invoice" :class="{ active: activeLink === 1 }">
            <ph-envelope-simple
              :size="24"
              weight="bold"
              name="Invoice"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            />
          </RouterLink>
          <RouterLink to="/report" :class="{ active: activeLink === 2 }">
            <ph-currency-circle-dollar
              :size="24"
              weight="bold"
              name="Report"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            />
          </RouterLink>
          <RouterLink to="/checkout" :class="{ active: activeLink === 3 }">
            <ph-shopping-cart-simple
              :size="24"
              weight="bold"
              name="Checkout"
              class="icons"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            />
          </RouterLink>
        </div>
        <div v-if="isCurawedaAccount" class="navbar-links-container flex fd-col">
          <RouterLink to="/report-curaweda" :class="{ active: activeLink === 4 }">
            <PhNotePencil
              :size="24"
              weight="bold"
              name="reportCuraweda"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            />
          </RouterLink>
          <RouterLink to="/report" :class="{ active: activeLink === 4 }">
            <ph-currency-circle-dollar
              :size="24"
              weight="bold"
              name="Report"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            />
          </RouterLink>
        </div>
        <div class="navbar-links__settings-container flex fd-col">
          <a
            @click="toSettings()"
            :class="{ active: activeLink === 5 }"
            v-if="!isCurawedaAccount"
            style="cursor: pointer"
          >
            <ph-gear
              :size="24"
              weight="bold"
              :class="{ disabled: userData.role === 'CASHIER' }"
              name="test"
              class="icons"
            />
          </a>
          <RouterLink
            to="/login"
            name="Logout"
            @click="userLogout(), router.replace('/login')"
            @mouseover="showTooltip"
            @mouseleave="hideTooltip"
          >
            <ph-sign-out :size="24" weight="bold" mirrored="mirrored"
          /></RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
a {
  height: 3rem; /* Fixed height for the links */
  position: relative; /* Position relative for absolute positioning */
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  text-decoration: none;
  transition: background-color 0.1s ease; /* Smooth transition for background color */
  color: #000;
}

.icons {
  font-size: 32px;
  position: relative;
}
.icons:hover {
  opacity: 70%;
  cursor: pointer;
}
.icons:hover::after {
  content: attr(name);
  position: absolute;
  transform: translateX(50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-family: 'Poppins';
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  z-index: 9999;
}

nav {
  position: fixed;
  background-color: #ffd978;
  width: 103px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  padding-bottom: 2rem;
  z-index: 999;
}
.logo {
  text-align: center;
}
.logo img {
  width: calc(100% - 2rem);
}
.hidden {
  display: none;
}

.navbar-links {
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}

.navbar-links-container,
.navbar-links__settings-container {
  display: flex;
  margin-top: 30px;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.active {
  background-color: #e6be58;
  border-radius: 0.3rem;
  width: 3rem;
  height: 3rem; /* Maintain fixed size */
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  cursor: pointer;
  z-index: 100; /* Ensures it's above other elements */
  transition: background-color 0.4s ease; /* Smooth transition for background color */
}

a:hover::after {
  content: attr(name);
  position: absolute;
  top: 0.5rem;
  left: 2rem;
  background-color: rgb(0, 0, 0, 0.8);
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-family: 'Poppins';
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  z-index: 9999;
  position: absolute;
  display: none;
}
.active:hover::after {
  transform: translateX(15%);
}
.disabled {
  color: #545454;
}
</style>
