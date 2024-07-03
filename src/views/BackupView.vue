<script setup>
import { ref, computed, onMounted, watchEffect, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalHelper from '@/utilities/GlobalHelper'

const { DB_BASE_URL, LOGS_BASE_URL, showLoader } = GlobalHelper
const router = useRouter()
const logsData = ref([])
const labels = ref(['User', 'Order', 'Events'])
const searchQuery = ref('')
const currentData = ref([])
const headers = ref([])
const rawSearch = ref('')
const actionArray = ref([
  {
    action: 'CREATE'
  },
  {
    action: 'UPDATE'
  },
  {
    action: 'DELETE'
  }
])

const activeLabel = ref('User')

const fetchData = async (label) => {
  activeLabel.value = label
  try {
    showLoader.value = true
    let url = `${DB_BASE_URL.value}/${LOGS_BASE_URL.value}/database-logs`

    switch (label) {
      case 'User':
        url = `${DB_BASE_URL.value}/${LOGS_BASE_URL.value}/database-logs?action=DELETE`
        break
      case 'Order':
        url = `${DB_BASE_URL.value}/${LOGS_BASE_URL.value}/database-logs?action=CREATE`
        break
      case 'Events':
        url = `${DB_BASE_URL.value}/${LOGS_BASE_URL.value}/database-logs?action=UPDATE`
        break
    }

    const response = await fetch(url)
    if (!response) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    currentData.value = res.data
    headers.value = res.data.length > 0 ? Object.keys(res.data[0]) : []

    showLoader.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const confirmAlert = ref(false)
//alert
const showConfirmation = () => {
  // idTrans.value = id
  // status.value = stats
  confirmAlert.value = true
}
const confirm = () => {
  confirmAlert.value = false
  // updateStatus(idTrans.value, status.value)
}

// Fetch default data (User) on component mount
onMounted(() => {
  fetchData(activeLabel.value)
})
// Pagination Start
const rowsPerPage = 10
const currentPage = ref(1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  const end = start + rowsPerPage
  return currentData.value.slice(start, end)
})
const totalPages = computed(() => {
  return Math.ceil(currentData.value.length / rowsPerPage)
})
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
  }
}
const visiblePages = computed(() => {
  const maxVisible = 3
  let startPage = Math.max(currentPage.value - Math.floor(maxVisible / 2), 1)
  let endPage = startPage + maxVisible - 1

  if (endPage > totalPages.value) {
    endPage = totalPages.value
    startPage = Math.max(endPage - maxVisible + 1, 1)
  }

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})
watchEffect(() => {})
onUnmounted(() => {})
</script>

<template>
  <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
    <div class="add__alert-confirmation">
      <h5>Apakah yakin ingin mengubah status</h5>
      <!-- <input
        type="number"
        v-model="inputValue"
        style="border-width: 2px"
        placeholder="Masukkan nominal..."
      /> -->
      <div class="button-group">
        <button @click="confirmAlert = false">Cancel</button>
        <button @click="confirm()">Yes</button>
      </div>
    </div>
  </div>
  <div
    class="breadcrumb flex align-items-center gap[0.5] cursor-pointer"
    @click="router.push('/settings')"
  >
    <ph-caret-left size="24" weight="bold" />
    <p>Kembali</p>
  </div>
  <h5 class="fw-600 sm-top-1"></h5>
  <div style="display: flex; width: 98%; justify-content: space-between; overflow-x: auto">
    <div>
      <button
        v-for="(label, index) in labels"
        :key="index"
        @click="fetchData(label)"
        class="add__preview_button"
        :style="{ backgroundColor: activeLabel === label ? 'lightblue' : '' }"
      >
        {{ label }}
      </button>
    </div>
    <div>
      <button class="add__preview_button" type="submit" @click="showConfirmation()">Backup</button>
    </div>
  </div>
  <div class="database-logs__content pd-right-1 sm-top-2">
    <table v-if="currentData.length > 0">
      <thead>
        <th>User</th>
        <th>Aksi</th>
        <th>Aktivitas</th>
        <th>Page</th>
        <th>Status</th>
        <th>Tanggal</th>
      </thead>
      <tbody>
        <template v-for="logData in paginatedData" :key="logData.user">
          <tr>
            <td>{{ logData.user.email }}</td>
            <td>{{ logData.action }}</td>
            <td>{{ logData.activity }}</td>
            <td>{{ logData.changedAt }}</td>
            <td>
              <div
                class="logdata-status"
                :class="{
                  'status-success': logData.status === 'Success',
                  'status-failed': logData.status === 'Failed'
                }"
              >
                {{ logData.status }}
              </div>
            </td>
          </tr>
        </template>
      </tbody>
      <tbody></tbody>
    </table>
    <div v-else>Data tidak ditemukan</div>

    <div class="pagination-container">
      <button
        class="pagination-button"
        @click="changePage(currentPage - 1)"
        :class="{ invisible: currentPage === 1 }"
      >
        <ph-caret-left />
      </button>
      <div class="pagination-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ active: page === currentPage }"
        >
          {{ page }}
        </button>
      </div>
      <button
        class="pagination-button"
        @click="changePage(currentPage + 1)"
        :class="{ invisible: currentPage === totalPages || currentPage === 1 }"
      >
        <ph-caret-right />
      </button>
    </div>
  </div>
</template>

<style scoped>
.add__alert-confirmation_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background-color: rgb(0, 0, 0, 0.2);
  z-index: 9999;
}

.add__alert-confirmation {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translate(-50%);
  background-color: #ffffff;
  border: 1px solid rgba(255, 226, 154, 0.9);
  padding: 1rem;
  border-radius: 0.5rem;
}
.add__alert-confirmation .button-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: end;
  margin-top: 1rem;
}

.add__alert-confirmation .button-group button {
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--color-primary);
  filter: saturate(10);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.add__alert-confirmation .button-group button:first-child {
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #8f8f8f;
  color: #ffffff;
}

.add__preview_button {
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 0;
  margin-inline: 5px;
  font-size: 18px;
  line-height: 28px;
  box-shadow: #000;
  background-color: #d9d9d9;
}

.database-logs__content_cta-search,
.action-filter__cta {
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  border-radius: 0.5rem;
}
.database-logs__content_cta-search {
  width: 2rem;
}
.action-filter__input-dropdown {
  position: relative;
  height: 2rem;
  width: 15rem;
  border-radius: 0.5rem;
  border: 1px solid black;
  cursor: pointer;
}

.action-filter__input-dropdown input {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: transparent;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.arrow-icon {
  transition: all 300ms ease;
}

.arrow-icon.active {
  transform: rotate(180deg);
}

.action-filter__input-dropdown_menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: white;
  border-radius: 0.5rem;
  display: none;
  overflow: hidden;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.2);
  z-index: 200;
}

.action-filter__input-dropdown_menu.active {
  display: block;
}

.action-filter__input-dropdown_menu p {
  padding: 0.3rem 0.6rem;
}

.action-filter__input-dropdown_menu p:hover {
  background-color: rgb(233, 233, 233);
}

.action-filter__input-dropdown_menu p:hover:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.action-filter__input-dropdown_menu p:hover:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

table {
  border-collapse: collapse;
  outline: 0;
  margin-top: 1rem;
  width: 100%;
  box-shadow: 1px 5px 10px 1px #0000012c;
  border-radius: 0.5rem;

  /* border-top-left-radius: 0.5rem;
border-top-right-radius: 0.5rem;  */
  padding: 1rem;
}
thead {
  border-bottom: 1px solid #000;
}
th {
  height: 3rem;
  font-weight: 600;
}
th:nth-child(3) {
  text-align: start;
  padding: 0 1rem;
}
tr {
  max-height: 2rem;
}
td {
  max-height: 1.5rem;
  height: 1.5rem;
  text-align: center;
  max-width: 15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1rem;
  font-size: clamp(10px, 1vw, 14px);
}

td:nth-child(3) {
  text-align: start;
}

td:nth-child(1) {
  max-width: 10rem;
}
td:nth-child(5) {
  max-width: 4.5rem;
}
td:hover:nth-child(1),
td:hover:nth-child(3) {
  position: relative;
  overflow: visible;
  white-space: normal;
}
td:hover:nth-child(3) {
  padding: 0 1rem;
}
.logdata-status span {
  font-weight: 600;
  text-align: center;
  display: flex;
  justify-content: center;
  align-self: center;
}

.status-success {
  color: #1d8335;
  background-color: #36d65b7a;
  border-radius: 1rem;
  padding-inline: 4px;
}
.status-failed {
  color: #831d1d;
  background-color: #d636367a;
  border-radius: 1rem;
  padding-inline: 4px;
}
.pagination-container {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pagination-container button {
  width: 2.5rem;
  height: 2.5rem;
  box-shadow: 1px 5px 10px 1px #0000012c;
  border-radius: 0.5rem;
}

.pagination-container button.active {
  background-color: var(--color-primary);
  color: white;
}

.pagination-button.invisible {
  visibility: hidden;
}

.pagination-container button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}
</style>
