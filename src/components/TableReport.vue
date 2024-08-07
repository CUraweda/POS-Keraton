<script setup>
import { ref, onMounted } from 'vue'
import ReportHelper from '@/utilities/ReportHelper'

const { activityReportData, fetchTableDataReport, formatDate, formatCurrency } = ReportHelper

const limitOptions = [10, 20, 50, 100, 'All']
const selectedLimit = ref(limitOptions[0])

const fetchTableData = async () => {
  const limit = selectedLimit.value === 'All' ? 1000000 : selectedLimit.value
  await fetchTableDataReport({ limit })
}

onMounted(() => {
  fetchTableData()
})

const handleLimitChange = async (event) => {
  selectedLimit.value = event.target.value
  await fetchTableData()
}
</script>

<template>
  <div class="report-activity">
    <div class="report-activity__filters">
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
    </div>
    <div class="report-activity__table">
      <table class="report-activity__table-data">
        <thead>
          <tr class="report-activity__table-header">
            <th>No</th>
            <th>Pembelian</th>
            <th>Kategori</th>
            <th>Tanggal</th>
            <th>Jumlah</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="report-activity__table-items"
            v-for="(item, index) in activityReportData"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td class="to-ellipsis">{{ item.order ? item.order.name : item.event.name }}</td>
            <td>{{ item.order ? item.order.category.name : 'Event' }}</td>
            <td>{{ formatDate(item.transaction.plannedDate) }}</td>
            <td>{{ item.amount }}</td>
            <td>
              {{ formatCurrency((item.order ? item.order.price : item.event.price) * item.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
th,
td {
  cursor: pointer;
}
.category__input-dropdown {
  height: 1.5rem;
  width: 6rem;
  text-align: center;
  border-radius: 0.3rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: transparent;
  position: relative;
}
.limit-select {
  padding-inline: 10px;
}
.report-activity__table {
  max-height: calc(374px - 3rem);
  overflow-y: overlay;
  overflow-x: auto;
}
.report-activity__table::-webkit-scrollbar {
  width: 4px;
}
.report-activity__table::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}
.report-activity__table::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.report-activity__table-data {
  border-collapse: collapse;
  outline: 0;
  overflow-x: auto;
  width: 100%;
}
.report-activity__table-header th {
  font-size: 24px;
  font-weight: 600;
  line-height: 28px;
  background-color: white;
  box-shadow: inset 0 -1px 0 #000000;
  position: sticky;
  z-index: 3;
  top: 0;
}
.report-activity__table-items td {
  font-size: 18px;
  line-height: 28px;
  border-bottom: 1px solid #000;
}
.report-activity__table-header th,
.report-activity__table-items td {
  text-align: center;
  padding: 0.5rem 1.5rem;
}
.report-activity__table-header th:nth-child(2),
.report-activity__table-items td:nth-child(2) {
  max-width: 20rem;
  text-align: start;
  padding-left: 2rem;
}
</style>
