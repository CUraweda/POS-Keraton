<script setup>
import { onMounted, watch, ref } from 'vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import InvoiceDetail from '@/components/InvoiceDetail.vue'
import InvoiceHelper from '@/utilities/InvoiceHelper'
import LoginHelper from '@/utilities/LoginHelper'
import { useRoute } from 'vue-router'

const route = useRoute()

// Akses rute saat ini
const currentRoute = route.name

const {
  dataInvoice,
  getSearchQuery,
  data,
  fetchTransactionList,
  searchQuery,
  resetSearch,
  deleteTransaction,
  fetchTaxes,
  mapInvoiceOrders,
  selectedItem,
  splitDate,
  detailPopup,
  showDetail
} = InvoiceHelper

const { userData, userLogout } = LoginHelper

watch(
  () => searchQuery.value,
  (newValue) => {
    if (typeof newValue === 'string') {
      searchQuery.value = newValue.toLowerCase()
      fetchTransactionList()
      getSearchQuery(searchQuery.value)
      // searchList(searchQuery.value)
    }
  }
)
const idData = ref(null)
const name = ref(null)
const confirmAlert = ref(false)
const confirmDelete = (data) => {
  idData.value = data.id
  name.value = data.customer.name
  confirmAlert.value = true
}
const confirm = () => {
  confirmAlert.value = false
  deleteTransaction(idData.value)
}
onMounted(() => {
  GlobalHelper.showLoader.value = true
  fetchTransactionList()
  fetchTaxes()
})
</script>

<template>
  <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
    <div class="add__alert-confirmation">
      <h5>Apakah yakin ingin menghapus invoice dengan nama {{ name }}?</h5>
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
  <div class="invoice-container">
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

    <!-- Invoice -->
    <div class="invoice-table" style="overflow-x: auto">
      <table>
        <thead>
          <tr class="invoice-table__row-header">
            <th class="invoice-table__header">No.</th>
            <th class="invoice-table__header">Nama</th>
            <th class="invoice-table__header">Pembelian</th>
            <th class="invoice-table__header">Tanggal</th>
            <th class="invoice-table__header">Jadwal</th>
            <th class="invoice-table__header">Email</th>
          </tr>
        </thead>
        <tbody v-if="dataInvoice">
          <template v-for="(item, indexItem) in dataInvoice" :key="indexItem">
            <tr v-if="mapInvoiceOrders(item)" class="invoice-table__row-data">
              <td class="invoice-table__data">{{ indexItem + 1 }}</td>
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
        <tbody v-else>
          Data Tidak ada
        </tbody>
      </table>
    </div>
  </div>
  <InvoiceDetail :selectedItem="selectedItem" ref="detailPopup" />
</template>

<style scoped>
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
  width: 50px;
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
</style>
