<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import Chart from '@/components/Chart.vue'
import TicketInfoCard from '@/components/TicketInfoCard.vue'
import TableReport from '@/components/TableReport.vue'
import CategoryDropdown from '@/components/CategoryDropdown.vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import ReportHelper from '@/utilities/ReportHelper'
import html2canvas from 'html2canvas'
import { useRouter, useRoute } from 'vue-router'
const {
  DB_BASE_URL,
  GUIDE_BASE_URL,
  NATIONALITY_BASE_URL,
  TRANSACTION_BASE_URL,
  DETAILTRANS_BASE_URL,
  showLoader,
  TRANSFER_URL,
  sendQueue,
  assignAlert
} = GlobalHelper
const {
  incomeRevenue,
  fetchIncomeRevenue,
  formatCurrency,
  currentYear,
  selectedYear,
  targetYears,
  yearlyCategory,
  yearlyData,
  fetchTargetYears,
  changeSelectedYear,
  fetchYearlyChartData,
  revenueKeraton,
  currentMonth,
  filterDate,
  selectedMonth,
  selectedMonthName,
  targetMonths,
  monthlyCategory,
  monthlyData,
  fetchTargetMonths,
  fetchTableDataReport,
  fetchOrderInfoCardData,
  setMonthLocaleString,
  changeSelectedMonth,
  fetchMonthlyChartData,
  generateExcel,
  printData,
  updateCategory,
  tableDataFilter,
  totalSum,
  exportToExcel
} = ReportHelper

const checkData = async () => {
  try {
    isShowChart.value = false
    await fetchIncomeRevenue()
    await fetchTargetYears()
    await fetchTargetMonths()
    selectedYear.value = currentYear
    selectedMonth.value = currentMonth
    setMonthLocaleString()
    await fetchTableDataReport({})
    await fetchYearlyChartData()
    await fetchOrderInfoCardData()
    await fetchMonthlyChartData()
    isShowChart.value = true
  } catch (error) {
    console.error(error)
  }
}
watch(
  () => selectedYear.value,
  (newVal) => {
    changeSelectedYear(newVal)
  }
)
watch(
  () => selectedMonth.value,
  (newVal) => {
    changeSelectedMonth(newVal)
  }
)
const startDate = ref()
const endDate = ref()
const isLoadingKeramaian = ref(false)
const isLoading = ref(false)
const optiondropdown = ref(null)
const inputValue = ref('')
const confirmAlert = ref(false)
const router = useRouter()
const showDetail = ref(false)
const isShowChart = ref(false)
const yearDropdownOpen = ref(false)
const monthDropdownOpen = ref(false)
const showTransfer = ref(false)
const toggleShow = () => {
  showDetail.value = !showDetail.value
}
const getPrint = async () => {
  isLoading.value = true
  await router.push('/rekap')
  isLoading.value = false
}
const getPrintKeramaian = async () => {
  isLoadingKeramaian.value = true
  await router.push('/rekap-keramaian')
  isLoadingKeramaian.value = false
}
const toggleYearDropdown = () => {
  yearDropdownOpen.value = !yearDropdownOpen.value
}
const toggleMonthDropdown = () => {
  monthDropdownOpen.value = !monthDropdownOpen.value
}
const closeDropdownOnClickOutside = (event) => {
  if (
    !event.target.closest('.filter__input-dropdown') &&
    !event.target.closest('.filter__input-dropdown_menu')
  ) {
    yearDropdownOpen.value = false
    monthDropdownOpen.value = false
  }
}
const selectYearOption = (year) => {
  changeSelectedYear(year)
  yearDropdownOpen.value = false
}
const selectMonthOption = (month) => {
  selectedMonthName.value = month
  changeSelectedMonth(month)
  monthDropdownOpen.value = false
}
// const takeScreenshot = async (elementId) => {
//   const element = document.getElementById(elementId)
//   try {
//     const canvas = await html2canvas(element)
//     canvas.toBlob((blob) => {
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `Report Tahun ${selectedYear.value} Bulan ${selectedMonthName.value}.png`
//       document.body.appendChild(a)
//       a.click()
//       window.URL.revokeObjectURL(url)
//       console.log('Screenshot saved as image file!')
//     }, 'image/png')
//   } catch (error) {
//     console.error('Error saving screenshot as image file:', error)
//   }
// }
const incomeRevenueClass = () => {
  const length = incomeRevenue.value.toString().length
  if (length > 18) {
    return 'fs-h5'
  } else if (length > 15) {
    return 'fs-h4'
  } else if (length > 12) {
    return 'fs-h3'
  } else if (length > 9) {
    return 'fs-h2'
  }
}

watch(
  () => optiondropdown.value,
  (newVal) => {
    tableDataFilter.value['optiondropdown'] = newVal
    fetchTableDataReport()
  }
)

watch(
  () => startDate.value,
  (newVal) => {
    tableDataFilter.value['startDate'] = newVal
    fetchTableDataReport()
  }
)

watch(
  () => endDate.value,
  (newVal) => {
    tableDataFilter.value['endDate'] = newVal
    fetchTableDataReport()
  }
)

onUnmounted(() => {
  window.removeEventListener('click', closeDropdownOnClickOutside)
})

onMounted(() => {
  checkData()
  fetchTableDataReport()
  window.addEventListener('click', closeDropdownOnClickOutside)
  setMonthLocaleString()
})

const showtransfer = () => {
  showTransfer.value = !showTransfer.value
}
const confirm = () => {
  confirmAlert.value = !confirmAlert.value
}
const transfer = async () => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/keraton-pos/curaweda-income/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // paymentAmount: inputValue.value,
        paymentMethod: 'BJB'
      })
    })
    if (!response.ok) {
      throw new Error('Failed transfer')
    }
  } catch (err) {
    console.error(err)
  } finally {
  }
}
const submitOrder = () => {
  confirmAlert.value = false
  transfer()
}

const filterData = () => {
  fetchTableDataReport({ startDate: startDate.value, endDate: endDate.value })
}

// watch([startDate, endDate], ([newStartDate, newEndDate]) => {
//   fetchTableDataReport({ startDate: newStartDate, endDate: newEndDate })
// })
watch(startDate, (newFilterDate) => {
  tableDataFilter.value['startDate'] = newFilterDate
  fetchTableDataReport(tableDataFilter.value)
})
watch(endDate, (newFilterDate) => {
  tableDataFilter.value['endDate'] = newFilterDate
  fetchTableDataReport(tableDataFilter.value)
})
</script>

<template>
  <div class="report__container flex fd-col align-items-center justify-content-center gap[2.25]">
    <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
      <div class="add__alert-confirmation">
        <h5>Apakah yakin ingin memindahkan dari cash ke account?</h5>
        <!-- <input
          type="number"
          v-model="inputValue"
          style="border-width: 2px"
          placeholder="Masukkan nominal..."
        /> -->
        <div class="button-group">
          <button @click="confirmAlert = false">Cancel</button>
          <button @click="submitOrder()">Yes</button>
        </div>
      </div>
    </div>
    <div class="report-information__container flex fd-row gap-2 justify-content-sb">
      <div class="report-information__income-container w-half flex fd-col gap-1">
        <div class="report-information__income-revenue flex fd-col pd-2">
          <div style="justify-content: space-between; display: flex">
            <h5>Pendapatan hari ini</h5>
            <button @click="showtransfer()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="currentColor"
                class="bi bi-arrow-down"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 3.5a.5.5 0 0 0-.5-.5H5.707l-.354-.354a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 1 0-.708-.708l-.354.354H8.5a.5.5 0 0 0-.5.5z"
                />
              </svg>
            </button>
          </div>
          <div class="report-information__income-text flex fd-row">
            <h5 class="fw-600">Rp</h5>
            <span class="fs-display fw-600" :class="incomeRevenueClass()">{{
              formatCurrency(incomeRevenue)
            }}</span>
          </div>
          <div v-if="showTransfer" class="block fd-row detail-section" style="padding-top: 10px">
            <div style="font-weight: 700">Cash On Hand</div>
            <div class="flex">
              <div style="font-size: 20px; font-weight: 600">Rp</div>
              <h3 class="fw-600" :class="incomeRevenueClass()">
                {{ formatCurrency(revenueKeraton.COH) }}
              </h3>
            </div>
            <div style="font-weight: 700">Cash On Account</div>

            <div class="flex" style="padding-top: 10px">
              <div style="font-size: 20px; font-weight: 600">Rp</div>
              <h3 class="fw-600" :class="incomeRevenueClass()">
                {{ formatCurrency(revenueKeraton.CIA) }}
              </h3>
            </div>
            <button
              @click="confirm()"
              weight="bold"
              style="
                background-color: var(--color-primary);
                height: fit-content;
                border-radius: 5px;
                margin-top: 20px;
                padding: 8px;
                font-weight: 600;
                box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.062);
                margin-inline: auto;
              "
              type="submit"
            >
              Transfer
            </button>
          </div>
        </div>
        <div class="report-information__ticket-sold flex fd-col pd-2">
          <h5>Total tiket terjual</h5>
          <h4 class="fw-600">{{ totalSum() }} Tiket</h4>
        </div>
      </div>
      <div class="report-information__ticketing-container w-half flex fd-col gap[0.5] pd-2">
        <h5>Tiket terjual</h5>
        <div class="report-information__ticketing-card">
          <TicketInfoCard />
        </div>
      </div>
    </div>
    <div class="report-revenue__container flex fd-col">
      <div
        id="report__screenshot-target"
        v-if="isShowChart"
        class="report-revenue__chart-container flex fd-row align-items-center justify-content-center gap[1.5]"
      >
        <div
          class="report-revenue__chart flex fd-col align-items-center justify-content-center gap-1"
        >
          <Chart
            :targetDate="selectedYear"
            :dataSeries="yearlyData"
            :dataCategory="yearlyCategory"
          />
          <div class="filter__input-dropdown">
            <input
              readonly
              @click="toggleYearDropdown()"
              :value="selectedYear"
              placeholder="Pilih Tahun"
              id="filter-year"
            />
            <!-- <div class="select-icon">
              <div class="arrow-icon" :class="{ active: yearDropdownOpen }">
                <ph-caret-down :size="14" weight="bold" class="icon" />
              </div>
            </div> -->
            <div class="filter__input-dropdown_menu" :class="{ active: yearDropdownOpen }">
              <p
                v-for="(year, index) in targetYears"
                :key="index"
                :value="year"
                @click="selectYearOption(year)"
              >
                {{ year }}
              </p>
            </div>
          </div>
        </div>
        <div
          class="report-revenue__chart flex fd-col align-items-center justify-content-center gap-1"
        >
          <Chart
            :targetDate="selectedMonthName"
            :dataSeries="monthlyData"
            :dataCategory="monthlyCategory"
          />
          <div class="filter__input-dropdown">
            <input
              readonly
              @click="toggleMonthDropdown()"
              :value="selectedMonthName"
              placeholder="Pilih Bulan"
              id="filter-month"
            />
            <!-- <div class="select-icon">
              <div class="arrow-icon" :class="{ active: monthDropdownOpen }">
                <ph-caret-down :size="14" weight="bold" class="icon" />
              </div>
            </div> -->
            <div class="filter__input-dropdown_menu" :class="{ active: monthDropdownOpen }">
              <p
                v-for="(month, index) in targetMonths"
                :key="index"
                :value="month"
                @click="selectMonthOption(month)"
              >
                {{ month }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 90%">
        <div
          class="report-revenue__icons flex fd-row align-self-f-end gap-1 pd-sd-1 pd-top-1 align-items-center"
        >
          <!-- <span
          class="icons"
          name="Screenshot Grafik"
          @click="takeScreenshot('report__screenshot-target')"
        >
          <ph-camera :size="32" weight="bold" />
        </span> -->
          <span
            v-if="!isLoadingKeramaian"
            class="icons"
            name="Print Data Penjualan Tiket"
            @click="getPrintKeramaian"
          >
            <ph-printer :size="32" weight="bold" />
          </span>
          <span v-else>loading...</span>
          <!-- <span class="icons" name="Print Data Keramaian" @click="printDataKeramaian"
          ><ph-printer :size="32" weight="bold"
        /></span> -->
          <span v-if="!isLoading" class="icons" name="Print Data Pengunjung" @click="getPrint">
            <ph-printer :size="32" weight="bold" />
          </span>
          <span v-else>loading...</span>
          <!-- <span class="icons" name="Print Data Keramaian" @click="printData"
          ><ph-printer :size="32" weight="bold"
        /></span> -->
          <span class="icons" name="Ekspor ke Excel" @click="generateExcel">
            <ph-microsoft-excel-logo :size="32" weight="fill" fill="green" />
          </span>
        </div>
      </div>
    </div>
    <div class="report-activity__container flex fd-col gap-1">
      <div class="report-activity__head fd-row gap[1.5] align-items-center">
        <p class="report-activity__head-text">Aktivitas Terbaru</p>
        <div
          style="
            margin-top: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
          "
        >
          <div style="display: flex; width: 100%; flex-wrap: wrap; align-items: center; gap: 10px">
            <!-- <form @submit.prevent="filterData">
              <label for="filterDate" style="margin-inline: 10px">Select Date:</label>
              <input type="date" v-model="filterDate" id="filterDate" style="width: 10rem" />
            </form> -->

            <CategoryDropdown
              :categoryWidth="'280px'"
              @option-selected="updateCategory"
              v-model="optiondropdown"
            />
            <form
              @submit.prevent="filterData"
              style="
                gap: 10px;
                display: flex-wrap;
                flex-wrap: wrap;
                text-align: center;
                align-items: center;
              "
            >
              <label for="startDate" style="margin-inline: 10px">Start Date:</label>
              <input type="date" v-model="startDate" id="startDate" />

              <label for="endDate" style="margin-inline: 10px">End Date:</label>
              <input type="date" v-model="endDate" id="endDate" />

              <!-- <button
                type="submit"
                style="
                  background-color: var(--color-primary);
                  height: fit-content;
                  border-radius: 5px;
                  padding: 8px;
                  font-weight: 600;
                  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.062);
                  margin-inline: 10px;
                "
              >
                Filter
              </button> -->
            </form>
          </div>
          <div>
            <span class="icons" name="Export to Excel" @click="exportToExcel">
              <ph-microsoft-excel-logo :size="32" weight="fill" fill="green" />
            </span>
          </div>
        </div>
        <div class="report-activity__table-container">
          <TableReport :data="activityReportData" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report__container {
  margin-left: 6rem;
}

@media screen and (max-width: 700px) {
  .report__container {
    margin-left: 0;
  }
}
input[type='date'] {
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #7a7a7a;
  background-color: #fff;
  transition:
    border-color 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.report-information__income-revenue {
  cursor: pointer;
  width: 100%;
}

.detail-section {
  margin-top: 10px;
}

.report-information__income-revenue,
.report-information__ticket-sold,
.report-information__ticketing-container {
  border-radius: 20px;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25);
}
.report-revenue__icons .icons {
  font-size: 32px;
  position: relative;
}
.report-revenue__icons .icons:hover {
  opacity: 70%;
  cursor: pointer;
}
.report-revenue__icons .icons:hover::after {
  content: attr(name);
  position: absolute;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%);
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
.report-activity__head-text {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}
.report-activity__table-container {
  height: 374px;
  border-radius: 20px;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25);
  padding: 1rem;
}
.filter__input-dropdown {
  height: 2rem;
  border-radius: 0.5rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: transparent;
  position: relative;
  border: 1px solid black;
}
.filter__input-dropdown input {
  cursor: pointer;
}
input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 0;
  height: 100%;
  border-radius: 0.5rem;
  padding: 0.5rem;
}
.filter__input-dropdown input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}
.filter__input-dropdown .select-icon {
  position: absolute;
  width: 100%;

  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.arrow-icon {
  transition: all 300ms ease;
}
.arrow-icon.active {
  transform: rotate(180deg);
}
.filter__input-dropdown .select-icon i {
  font-size: 18px;
}
.filter__input-dropdown_menu {
  position: absolute;
  top: 2.6rem;
  background-color: white;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border-radius: 0.5rem;
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    box-shadow 0.2s ease;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0);
}

.filter__input-dropdown_menu.active {
  max-height: 200px;
  overflow-y: scroll;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.2);
}
.filter__input-dropdown_menu.active::-webkit-scrollbar {
  width: 4px;
}
.filter__input-dropdown_menu.active::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
  max-width: 1200px;
}
.filter__input-dropdown_menu.active::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.filter__input-dropdown_menu p {
  padding: 0.3rem 0.6rem;
}
.filter__input-dropdown_menu p:hover {
  background-color: rgb(233, 233, 233);
}
.filter__input-dropdown_menu p:hover:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}
.filter__input-dropdown_menu p:hover:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
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

.report-information__container {
  display: flex;
  flex-direction: column;
  width: fit-content;
  gap: 2rem;
}

.report-information__income-container,
.report-information__ticketing-container {
  width: 100%;
  display: flex;
  gap: 1rem;
}

.report-information__income-revenue,
.report-information__ticket-sold,
.report-information__ticketing-container {
  border-radius: 20px;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25);
  padding: 1rem;
}

.report-revenue__container {
  display: flex;
  align-items: center;
}

.report-activity__container {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-revenue__chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.report-revenue__icons {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end;
  margin-top: 1rem;
}

.report-activity__head {
  display: flexbox;
  align-items: center;
  width: 100%;
  margin: auto;
  justify-content: space-between;
}

.filter__input-dropdown {
  position: relative;
  max-width: 200px;
  border: 1px solid black;
  border-radius: 0.5rem;
  background-color: transparent;
}

.filter__input-dropdown input {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.filter__input-dropdown_menu {
  position: absolute;
  top: 2.6rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  display: none;
}

.filter__input-dropdown_menu.active {
  display: block;
}

@media (max-width: 1087px) {
  .report-information__container {
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}
@media (min-width: 1900px) {
  .report-revenue__chart-container {
    flex-direction: row;
    justify-content: center;
    margin-left: 0px;
  }
}

@media (max-width: 970px) {
  .report-revenue__chart-container {
    margin: 20px;
  }

  .report-activity__container {
    width: 90%;
  }
}

@media (min-width: 1200px) {
  .report-activity__table-container {
    width: 100%;
    height: 374px;
    border-radius: 20px;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25);
    padding: 1rem;
  }
}

@media (min-width: 1087px) {
  .fs-display {
    font-size: 50px;
  }
}

@media (min-width: 1080px) and (max-width: 1900px) {
  .report-information__container {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (min-width: 1900px) and (max-width: 2500px) {
  .report-information__container {
    flex-direction: row;
    justify-content: space-between;
    width: 109rem;
  }
}
@media (min-width: 2500px) {
  .report-information__container {
    flex-direction: row;
    justify-content: space-between;
    width: 109rem;
  }
}
@media (max-width: 704px) {
  .fs-display {
    font-size: xx-large;
  }
}
@keyframes arrow-move {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.arrow-button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: relative;
}

/* Ikona panah */
.arrow-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 5px;
  animation: arrow-move 0.5s infinite;
}
</style>
