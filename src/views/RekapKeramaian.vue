<template>
  <div
    style="
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 5px;
    "
  >
    <div style="width: 95%; display: flex; gap: 20px; justify-content: center">
      <!-- <div style="height: 1080px; justify-content: center; align-content: center"> -->
      <Chart
        :targetDate="currentYear"
        :dataSeries="yearlyData"
        :dataCategory="yearlyCategory"
        :width="widthcart"
      />
      <!-- </div> -->
      <Chart
        :targetDate="monthName"
        :dataSeries="monthlyData"
        :dataCategory="monthlyCategory"
        :width="widthcart"
      />
    </div>

    <h2>Data Penjualan Tiket Tahun {{ currentYear }}</h2>
    <table class="history-report-table" style="margin-top: 2rem">
      <thead>
        <tr>
          <th>Tipe</th>
          <th v-for="(header, i) in yearlyCategory" :key="i">{{ header }}</th>
          <!-- <th>Mancanegara 'Dalam Negri</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(year, i) in yearlyData" :key="i">
          <td>{{ year.name }}</td>
          <td v-for="(yearData, i) in year.data" :key="i">{{ yearData }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Data Penjualan Tiket Bulan {{ monthName }}</h2>
    <table class="history-report-table" style="margin-top: 2rem">
      <thead>
        <tr>
          <th>Tipe</th>
          <th v-for="(header, i) in monthlyCategory" :key="i">{{ header }}</th>
          <!-- <th>Mancanegara 'Dalam Negri</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(month, i) in monthlyData" :key="i">
          <td>{{ month.name }}</td>
          <td v-for="(monthData, i) in month.data" :key="i">{{ monthData }}</td>
        </tr>
      </tbody>
    </table>

    <!-- <h2 style="margin-top: 2rem">Data Tingkat Keramaian Bulan</h2>
      <table class="history-report-table" style="margin-top: 2rem">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Umum</th>
            <th>Pelajar</th>
            <th>Mancanegara 'Luar Negri'</th>
            <th>Mancanegara 'Dalam Negri</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in historyRecords" :key="record.date">
            <td>{{ record.date }}</td>
            <td>{{ formatCurrency(record.revenueKeraton.COH) }}</td>
            <td>{{ formatCurrency(record.revenueKeraton.CIA) }}</td>
            <td>{{ formatCurrency(record.revenueCuraweda) }}</td>
            <td>{{ formatCurrency(record.totalRevenue) }}</td>
          </tr>
        </tbody>
      </table> -->
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from '@/components/Chart.vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import ReportHelper from '@/utilities/ReportHelper'
const { selectedMonth, selectedYear, selectedMonthName } = ReportHelper
const { DB_BASE_URL, ORDER_BASE_URL } = GlobalHelper

const yearlyData = ref([])
const yearlyCategory = ref([])
const monthlyData = ref([])
const monthlyCategory = ref([])
const currentYear = ref(selectedMonth.value ? selectedMonth.value : new Date().getFullYear())
const currentMonth = ref(selectedYear.value ? selectedYear.value : new Date().getMonth() + 1)
const monthName = ref(
  selectedMonthName.value
    ? selectedMonthName.value.toLocaleString('id-ID', { month: 'long' })
    : new Date().toLocaleString('id-ID', { month: 'long' })
)
const widthcart = ref('250')

const fetchData = async () => {
  try {
    const responseYear = await fetch(
      `${DB_BASE_URL.value}/${ORDER_BASE_URL.value}/chart-data/${encodeURIComponent(currentYear.value)}`
    )
    const responseMonth = await fetch(
      `${DB_BASE_URL.value}/${ORDER_BASE_URL.value}/chart-data/${encodeURIComponent(currentYear.value)}/${encodeURIComponent(currentMonth.value)}`
    )
    if (!responseYear.ok) throw new Error('Failed to fetch data')
    if (!responseMonth.ok) throw new Error('Failed to fetch data')
    const resYear = await responseYear.json()
    const resMonth = await responseMonth.json()
    yearlyCategory.value = resYear.data.yearlyCategory
    yearlyData.value = resYear.data.yearlyData
    monthlyCategory.value = resMonth.data.monthlyCategory
    monthlyData.value = resMonth.data.monthlyData
  } catch (err) {
    console.log(err)
  }
}

watch(
  [selectedMonth, selectedYear],
  ([newMonth, newYear]) => {
    currentMonth.value = newMonth
    currentYear.value = newYear
    fetchData()
  },
  { immediate: true }
)

onMounted(() => {
  fetchData().then(() => {
    window.print()
  })
})
</script>

<style scoped>
.history-report-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.history-report-table th,
.history-report-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.history-report-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}
</style>
