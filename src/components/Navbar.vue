<template>
  <div>
    <nav class="mobile-navbar">
      <button @click="toggleMenu" class="menu-button">☰</button>
      <div v-if="menuOpen" class="menu">
        <ul>
          <li><a href="#home">Pemandu</a></li>
          <li><a href="#pesanan">Pesanan</a></li>
          <li><a href="#backup">Backup Data</a></li>
          <li><a href="#kategori">Kategori</a></li>
          <li><a href="#tipe">Tipe</a></li>
          <li><a href="#sub-tipe">Sub Tipe</a></li>
          <li><a href="#catatan">Catatan Basis Data</a></li>
          <li><a href="#manage-user">Manage User</a></li>
        </ul>
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
  background-color: #ffeb3b; /* Adjust the color to match your design */
  padding: 10px;
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.menu {
  background-color: white;
  border: 1px solid #ddd;
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
@media (max-width: 768px) {
  .mobile-navbar {
    display: block;
  }
}
</style>
