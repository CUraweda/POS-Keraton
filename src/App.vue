<script setup>
import { RouterView, useRoute } from 'vue-router'
import { watchEffect, computed } from 'vue'
import GlobalHelper from './utilities/GlobalHelper'
import LoginHelper from './utilities/LoginHelper'
import WebLoader from './components/WebLoader.vue'
import AlertCard from './components/AlertCard.vue'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
// import SendProgress from './components/SendProgress.vue'

const { loggedIn, isAuthenticated } = LoginHelper

const route = useRoute()
const showSidebar = computed(
  () =>
    route.name !== 'generateTickets' &&
    route.name !== 'login' &&
    route.name !== 'Rekap' &&
    route.name !== 'Rekap Keramaian'
)

watchEffect(() => {
  isAuthenticated()
})
</script>

<template>
  <div class="web-loader__overlay" v-if="GlobalHelper.showLoader.value">
    <WebLoader />
  </div>
  <AlertCard />
  <Sidebar v-if="loggedIn && showSidebar" class="sidebar" />
  <Navbar v-if="loggedIn && showSidebar" />
  <!-- <SendProgress v-if="loggedIn && showSidebar"/> -->
  <div :class="[loggedIn ? 'pd-block-2' : 'no-pd-block', showSidebar ? 'pd-left-8' : 'no-pd-left']">
    <RouterView />
  </div>
</template>

<style scoped>
.web-loader__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 1);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.no-pd-block {
  padding-block: 0 !important;
}
.no-pd-left {
  padding: 0 !important;
}

.sidebar {
  display: flex;
}

@media screen and (max-width: 700px) {
  .sidebar {
    display: none;
  }
}
</style>
