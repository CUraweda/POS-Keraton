<script setup>
import { onMounted, watch, ref } from 'vue'
import invoiceDetail from '@/components/InvoiceDetail.vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import InvoiceHelper from '@/utilities/InvoiceHelper'
import LoginHelper from '@/utilities/LoginHelper'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = route.name
const { DB_BASE_URL, TRANSACTION_BASE_URL, showLoader } = GlobalHelper

// Destructure methods and refs from InvoiceHelper
const {
  dataInvoice,
  paginatedData,
  getSearchQuery,
  searchQuery,
  fetchTransactionList,
  deleteTransaction,
  fetchTaxes,
  mapInvoiceOrders,
  splitDate,
  showDetail,
  currentPage,
  pageSize,
  totalPages
} = InvoiceHelper

const { userData } = LoginHelper

// Pagination state
const limitOptions = [10, 20, 50, 70, 100, 'All']
const selectedLimit = ref(limitOptions[0])

const fetchData = async () => {
  const limit = selectedLimit.value === 'All' ? '0' : selectedLimit.value
  await fetchTransactionList({ page: currentPage.value, limit })
}
// Watch for search query changes and fetch data
watch(searchQuery, (newValue) => {
  if (typeof newValue === 'string') {
    searchQuery.value = newValue.toLowerCase()
    fetchTransactionList({ page: currentPage.value, limit: selectedLimit.value })
    getSearchQuery(searchQuery.value)
  }
})

// Define methods for pagination
// const fetchData = async () => {
//   GlobalHelper.showLoader.value = true
//   await fetchTransactionList({ page: currentPage.value, limit: selectedLimit.value })
//   GlobalHelper.showLoader.value = false
// }

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

const confirmAlert = ref(false)
const idData = ref(null)
const name = ref(null)

const confirmDelete = (data) => {
  idData.value = data.id
  name.value = data.customer.name
  confirmAlert.value = true
}

const confirm = () => {
  confirmAlert.value = false
  deleteTransaction(idData.value)
}

const handleLimitChange = async (event) => {
  selectedLimit.value = event.target.value
  currentPage.value = 1 // Reset to first page when limit changes
  await fetchData()
}

// Fetch data and taxes on component mount
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
    <div class="add__alert-confirmation">
      <h5>Apakah yakin ingin menghapus invoice dengan nama {{ name }}?</h5>
      <div class="button-group">
        <button @click="confirmAlert = false">Cancel</button>
        <button @click="confirm()">Yes</button>
      </div>
    </div>
  </div>
  <div class="invoice-container" style="padding: 2rem">
    <div style="justify-content: space-between; display: flex; width: 100%">
      <div style="text-transform: capitalize; font-weight: 500; font-size: 1.875rem; width: 100%">
        {{ currentRoute }}
      </div>
      <div class="invoice-search flex align-items-center" style="width: 30%">
        <i class="ri-search-line invoice-search__icon"></i>
        <input
          type="text"
          class="invoice-search__input-field"
          v-model="searchQuery"
          placeholder="Cari..."
          id="search"
          autocomplete="search"
        />
        <ph-x v-if="searchQuery" class="cursor-pointer" @click="resetSearch()" :size="16"></ph-x>
      </div>
    </div>

    <div class="report-activity__filters">
      <label for="limit-select" class="limit-select-label">Items per page:</label>
      <div class="dropdown-container">
        <select
          id="limit-select"
          v-model="selectedLimit"
          @change="handleLimitChange"
          class="dropdown category__input-dropdown"
        >
          <option v-for="option in limitOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <span class="dropdown-arrow">&#9662;</span>
      </div>
    </div>

    <div style="overflow-x: auto; width: 100%">
      <div class="invoice-table" style="overflow-x: auto">
        <table>
          <thead>
            <tr class="invoice-table__row-header">
              <th class="invoice-table__header">No.</th>
              <th class="invoice-table__header">UID</th>
              <th class="invoice-table__header">Nama</th>
              <th class="invoice-table__header">Pembelian</th>
              <th class="invoice-table__header">Tanggal</th>
              <th class="invoice-table__header">Jadwal</th>
              <th class="invoice-table__header">Email</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, indexItem) in dataInvoice" :key="indexItem">
              <tr v-if="mapInvoiceOrders(item)" class="invoice-table__row-data">
                <td class="invoice-table__data">
                  {{ indexItem + 1 + (currentPage - 1) * pageSize }}
                </td>
                <td class="invoice-table__data">{{ item.id }}</td>
                <td class="invoice-table__data">
                  {{ item.customer ? item.customer.name : item.user.name }}
                </td>
                <td class="invoice-table__data">{{ mapInvoiceOrders(item) }}</td>
                <td class="invoice-table__data">{{ splitDate(item.plannedDate)[0] }}</td>
                <td class="invoice-table__data">{{ splitDate(item.plannedDate)[1] }}</td>
                <td class="invoice-table__data">
                  {{ item.customer ? item.customer.email : item.user.email }} <br />
                  <div style="display: flex; gap: 10px; justify-content: center">
                    <button class="btn-primary invoice-table__button" @click="showDetail(item)">
                      Detail
                    </button>
                    <button
                      class="btn-primary invoice-table__button"
                      @click="confirmDelete(item)"
                      v-if="userData.role !== 'CASHIER'"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div> -->
  </div>
  <!-- Pagination Controls -->
  <!-- <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
          Next
        </button>
      </div> -->

  <!-- <div class="report-activity__filters">
        <label for="limit-select" class="limit-select">Items per page:</label>
        <select
          id="limit-select"
          v-model="selectedLimit"
          @change="handleLimitChange"
          class="dropdown category__input-dropdown"
        >
          <option v-for="option in limitOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div> -->
  <!-- Confirm Delete Dialog -->
  <div v-if="confirmAlert" class="confirm-dialog">
    <p>Are you sure you want to delete {{ name }}?</p>
    <button @click="confirm">Yes</button>
    <button @click="confirmAlert = false">No</button>
  </div>

  <invoiceDetail :selectedItem="selectedItem" ref="detailPopup" />
</template>

<style scoped>
report-activity__filters {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.limit-select-label {
  margin-right: 10px;
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 5px 30px 5px 10px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding-right: 30px;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.dropdown:hover,
.dropdown:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.dropdown-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 18px;
  color: #333;
}

.category__input-dropdown {
  transition: all 0.3s ease;
}

.category__input-dropdown:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.btn-pagination {
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: black;
  background-color: var(--color-primary);
  color: rgb(69, 69, 69);
  margin-inline: 0.5rem;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}
.add__alert-confirmation_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background-color: rgb(0, 0, 0, 0.2);
  z-index: 999;
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

.invoice-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  margin-left: 6rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Search */
.invoice-search {
  width: 601px;
  background-color: #d9d9d9;
  border-radius: 10px;
  overflow: hidden;
  height: 42px;
  padding: 0.5rem;
  margin-inline: 0.5rem;
}
.invoice-search__icon {
  align-items: center;
  justify-content: center;
  width: 20px;
  display: flex;
}
.invoice-search__input-field {
  flex: 1;
  border: none;
  width: 95%;
  background-color: #d9d9d9;
  font-family: 'Poppins';
}
.invoice-search__input-field:focus {
  outline: none;
}

/* Invoice Table */
.invoice-table {
  margin-top: 1.5rem;
  padding: 1.1rem;
  width: 100%;
  text-align: left;
}
.invoice-table table {
  width: 100%;
  border-collapse: collapse;
}
.invoice-table__header {
  padding: 7px;
  text-align: center;
  font-size: 20px;
}
.invoice-table__data:first-child,
.invoice-table__header:first-child {
  border-right: 1px solid black;
}
.invoice-table__data:nth-child(2),
.invoice-table__header:nth-child(2),
.invoice-table__data:nth-child(3),
.invoice-table__header:nth-child(3) {
  text-align: left;
  padding-left: 1rem;
}
.invoice-table__row-header,
.invoice-table__row-data:not(:last-child) {
  border-bottom: 1px solid black;
}
.invoice-table__data {
  padding: 7px;
  text-align: center;
  font-size: 20px;
  vertical-align: top;
  max-width: 200px;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-primary {
  background-color: #ffe29a;
  font-family: 'Poppins';
  font-size: 22px;
  border-radius: 5px;
  height: 31px;
  width: 129px;
  margin-top: 10px;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #ffd477;
}
.invoice-table__button {
  background-color: #ffe29a;
  font-family: 'Poppins';
  font-size: 22px;
  border-radius: 5px;
  height: 31px;
  width: 129px;
  margin-top: 10px;
  border: none;
  cursor: pointer;
}
.invoice-table__button:hover {
  background-color: #ffd477;
}

@media screen and (max-width: 700px) {
  .invoice-container {
    margin-left: 0;
  }
}
</style>
