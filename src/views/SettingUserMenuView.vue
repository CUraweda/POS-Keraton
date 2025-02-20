<template>
  <div class="container">
    <!-- Breadcrumb -->
    <div
      class="breadcrumb flex align-items-center gap-1 cursor-pointer"
      @click="navigateToSettings()"
    >
      <ph-caret-left size="24" weight="bold" />
      <p>Kembali</p>
    </div>

    <!-- Tabel Data User -->
    <div class="c_container pd-right-1 sm-top-2">
      <table class="custom-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in userDatas" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="openRouteDialog(user)" class="set-category-btn">Set Route</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog Route Permission -->
    <transition name="dialog-fade">
      <div v-if="showMenuDialog" class="secondary-dialog">
        <div class="card">
          <div class="dialog-header">
            <h6>Set Route</h6>
            <ph-x
              :size="30"
              color="var(--color-primary)"
              @click="closeRouteDialog"
              style="cursor: pointer"
            />
          </div>

          <div class="dialog-body">
            <div>
              <!-- <img src="../assets/images/bg-keraton.png" class="dialog-image" /> -->
              <div class="dialog-user-info">
                <div>
                  <div>{{ selectedUser.name }}</div>
                  <div>{{ selectedUser.email }}</div>
                </div>
                <button @click="updateRoutes" class="update-btn">Update Route</button>
              </div>
            </div>

            <div class="route-container">
              <!-- Search Filter -->
              <input v-model="searchRoute" class="route-search" placeholder="Search Route..." />

              <!-- Checkbox List -->
              <div class="route-list">
                <label class="checkbox-item" v-for="(route, i) in filteredRoutes" :key="i">
                  <span>{{ route.name }}</span>
                  <input
                    type="checkbox"
                    :value="route?.sideBarNo"
                    v-model="selectedUser.shownRoutes"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LoginHelper from '@/utilities/LoginHelper'
import GlobalHelper from '@/utilities/GlobalHelper'

const { getCookie } = LoginHelper
const { DB_BASE_URL, USER_BASE_URL, assignAlert } = GlobalHelper

export default {
  data() {
    return {
      userDatas: [],
      allRoutes: [], // Semua route yang ada di aplikasi
      selectedUser: {},
      showMenuDialog: false, // State untuk menampilkan dialog route
      searchRoute: '' // State untuk pencarian route
    }
  },
  mounted() {
    this.router = useRouter()
    this.fetchData()
    this.fetchRoutes()
  },
  computed: {
    filteredRoutes() {
      return this.allRoutes.filter((route) =>
        route.name.toLowerCase().includes(this.searchRoute.toLowerCase())
      )
    }
  },
  methods: {
    async fetchData() {
      try {
        const usersResponse = await fetch(
          `${DB_BASE_URL.value}/${USER_BASE_URL.value}/get-user-data`,
          {
            headers: {
              Authorization: getCookie('token')
            }
          }
        )

        if (!usersResponse.ok) throw Error('Failed to fetch data')
        const responseData = await usersResponse.json()
        console.log('User Data:', responseData.data)

        this.userDatas = responseData.data.map((user) => ({
          ...user,
          shownRoutes: user.shownPOSMenu ? user.shownPOSMenu.split(',') : []
        }))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },

    fetchRoutes() {
      this.allRoutes = this.router
        .getRoutes()
        .filter((route) => route.meta?.sideBarNo) // Hanya ambil yang memiliki sideBarNo
        .map((route) => ({
          name: route.name || route.path,
          path: route.path,
          sideBarNo: route.meta.sideBarNo
        }))

      // Cek apakah ada route dengan path '/'
      const berandaRoute = this.router.getRoutes().find((route) => route.path === '/')
      if (berandaRoute) {
        // Tambahkan secara manual jika ditemukan
        this.allRoutes.unshift({
          name: berandaRoute.name || 'Dashboard',
          path: berandaRoute.path,
          sideBarNo: '0' // Gunakan nomor khusus, misal 0 untuk Beranda
        })
      }
    },

    openRouteDialog(user) {
      this.selectedUser = {
        ...user,
        shownRoutes: user.shownRoutes || []
      }
      this.showMenuDialog = true
    },

    closeRouteDialog() {
      this.showMenuDialog = false
    },

    async updateRoutes() {
      try {
        if (!this.selectedUser?.id) throw Error('Please choose user first')

        const body = {
          shownPOSMenu: this.selectedUser.shownRoutes.join(',')
        }

        const updateUser = await fetch(
          `${DB_BASE_URL.value}/${USER_BASE_URL.value}/create-update-user/${this.selectedUser.id}`,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json',
              Authorization: getCookie('token')
            }
          }
        )

        if (!updateUser.ok) throw Error('Error while updating user')

        this.closeRouteDialog()
        this.fetchData()
        assignAlert(true, 'Success', 'success', `Routes updated successfully`)
      } catch (error) {
        assignAlert(true, 'Error', 'danger', `Failed to update routes: ${error.message}`)
        console.error('Error updating routes:', error)
      }
    }
  }
}
</script>

<style scoped>
.route-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
}

.route-search {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
}

.route-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkbox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container {
  margin-left: 8rem;
  padding: 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #4b5563;
}

.c_container {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
}

.custom-table th,
.custom-table td {
  padding: 12px 15px;
  text-align: left;
}

.custom-table thead {
  background-color: #f3f4f6;
  color: #4b5563;
}

.custom-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.3s;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.set-category-btn {
  background: #ffd978;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
}

.secondary-dialog {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-out;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.dialog-image {
  width: 10rem;
  height: 12rem;
  border-radius: 0.2rem;
}

.dialog-user-info {
  display: flex;
  justify-content: space-between;
  height: 100%;
  flex-direction: column;
}

.update-btn {
  background: #ffd978;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  margin-top: 1rem;
  cursor: pointer;
}

.selected-category {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.3rem;
}

.category-item {
  background: #ffd978;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
}

.category-checkbox {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}
</style>
