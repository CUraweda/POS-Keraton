import { ref } from 'vue'
import * as XLSX from 'xlsx'
import GlobalHelper from './GlobalHelper'

const { DB_BASE_URL, TRANSACTION_BASE_URL, ORDER_BASE_URL, DETAILTRANS_BASE_URL, showLoader } =
  GlobalHelper

const today = new Date()
const filterDate = ref()
today.setHours(7, 0, 0, 0)
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1
const monthName = today.toLocaleString('id-ID', { month: 'long' })
const revenueKeraton = ref()

/* Report Global Helper */
const capitalizeFirstLetter = (str) => {
  const lowercaseStr = str.toLowerCase()
  return lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1)
}
const formatDate = (dateStr) => {
  return dateStr.split('T')[0].replace(/-/g, '/')
}
const formatCurrency = (amount) => {
  return Number(amount).toLocaleString('id-ID')
}

/* ReportView Helper */
const incomeRevenue = ref(0)


const fetchIncomeRevenue = async () => {
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/income-revenue-curaweda`
    )
    if (!response.ok) throw Error('Failed to fetch Data')
    const responseData = await response.json()
    revenueKeraton.value = responseData.data.revenueKeraton
    incomeRevenue.value = responseData.data.total
    console.log(revenueKeraton)
  } catch (err) {
    console.log(err)
  }
}

const generateExcel = async () => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/table-data`);
    if (!response.ok) throw new Error('Failed to fetch data');

    const responseData = await response.json();
    const workbook = XLSX.utils.book_new();
    const tableSheetData = [];

    setMonthLocaleString()
    let rowIndex = 1;
    let currentTransactionId;

    // Adding headers to the sheet data
    tableSheetData.push(["No.", "Tanggal", "Pelanggan", "Nama Tiket", "Ketersediaan Item", "Jenis Tiket", "Pembayaran", "Jumlah", "Harga", "Total", "Total Dibayar", "Dihapus"]);

    responseData.data.forEach((data, i) => {
      const row = [];
      let numTabel = "", total = "";

      // Check if it's a new transaction
      if (data.transactionId !== currentTransactionId) {
        numTabel = rowIndex;
        total = +data.transaction.total;
        rowIndex++;
      }

      row.push(numTabel);
      row.push(data.transaction.plannedDate.split('T')[0]);
      row.push(data.transaction.customer?.name || data.transaction.user.name);
      row.push(data.order.name);
      row.push(data.order.deleted ? "Tidak" : "Aktif")
      row.push(data.order.category.name);
      row.push(data.transaction.method);
      row.push(data.amount);
      row.push(formatCurrency(data.order.price));
      row.push(formatCurrency(data.amount * data.order.price));
      row.push(formatCurrency(total));
      row.push(data.transaction.deleted ? "✅" : "--")
      // IF the data.deleted is true then make all the cell to get filled with red 

      currentTransactionId = data.transactionId;
      tableSheetData.push(row);
    });

    // Create worksheet and add data to it
    const worksheet = XLSX.utils.aoa_to_sheet(tableSheetData);

    // Auto size columns
    const colWidths = tableSheetData[0].map((_, colIndex) => {
      const colValues = tableSheetData.map(row => row[colIndex] ? row[colIndex].toString() : '');
      const maxLength = Math.max(...colValues.map(val => val.length));
      return { wch: maxLength + 2 }; // Adding padding for better spacing
    });
    worksheet['!cols'] = colWidths;

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendapatan Tiket Tahun 2024');

    // SUMMARY SHEET
    let yearlyTempData = yearlyData.value
    let monthlyTempData = monthlyData.value
    const summaryTableData = [
      [`Tabel Tingkat Keramaian ${selectedYear.value}`],
      ['Bulan', ...yearlyCategory.value, 'Total']
    ]

    // YEAR SUMMARY
    const yearlyTotals = new Array(yearlyCategory.value.length).fill(0)
    yearlyTempData.forEach((item) => {
      const rowData = [item.name]
      let total = 0
      item.data.forEach((value, colIndex) => {
        rowData.push(value)
        total += value
        yearlyTotals[colIndex] += value
      })
      rowData.push(total)
      summaryTableData.push(rowData)
    })
    summaryTableData.push(['Total', ...yearlyTotals, yearlyTotals.reduce((a, b) => a + b, 0)])
    
    
    // MONTH SUMMARY
    summaryTableData.push(
      [''],
      [`Tabel Tingkat Keramaian Bulan ${selectedMonthName.value}`],
      ['Tanggal', ...monthlyCategory.value, 'Total']
    )
    const monthlyTotals = new Array(monthlyCategory.value.length).fill(0)
    
    monthlyTempData.forEach((item) => {
      const rowData = [item.name]
      let total = 0
      item.data.forEach((value, colIndex) => {
        rowData.push(value)
        total += value
        monthlyTotals[colIndex] += value
      })
      rowData.push(total)
      summaryTableData.push(rowData)
    })
    summaryTableData.push(['Total', ...monthlyTotals, monthlyTotals.reduce((a, b) => a + b, 0)])

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryTableData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Transaksi')
    
    // Write workbook to file
    XLSX.writeFile(workbook, `Pendapatan_Tiket ${new Date().toISOString()}.xlsx`);
  } catch (err) {
    console.error(err);
  }
}


/* ChartReport Helper*/
const selectedYear = ref(0)
const selectedMonth = ref(0)
const selectedMonthName = ref('')
const targetYears = ref([])
const yearlyCategory = ref([])
const yearlyData = ref([])

const targetMonths = ref([])
const monthlyCategory = ref([])
const monthlyData = ref([])

const fetchTargetYears = async () => {
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/target-revenue/year`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    if (!targetYears.value.includes(currentYear)) {
      targetYears.value.push(currentYear)
    }
    targetYears.value = res.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const changeSelectedYear = async (year) => {
  try {
    selectedYear.value = year
    showLoader.value = true
    await fetchYearlyChartData()
    await fetchMonthlyChartData()
  } catch (error) {
    console.error(error)
  }
}
const fetchYearlyChartData = async () => {
  yearlyCategory.value = []
  yearlyData.value = []
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${ORDER_BASE_URL.value}/chart-data/${encodeURIComponent(selectedYear.value)}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    yearlyCategory.value = res.data.yearlyCategory
    yearlyData.value = res.data.yearlyData
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const fetchTargetMonths = async () => {
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/target-revenue/month`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ]

    const formattedMonths = res.data.map((month) => {
      return monthNames[parseInt(month) - 1]
    })
    const currentMonthName = monthNames[new Date().getMonth()]
    if (!formattedMonths.includes(currentMonthName)) {
      formattedMonths.push(currentMonthName)
    }
    targetMonths.value = formattedMonths
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const changeSelectedMonth = async (monthName) => {
  try {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ]

    const monthIndex = monthNames.indexOf(monthName)

    if (monthIndex !== -1) {
      selectedMonth.value = monthIndex + 1
    } else {
      console.error('Invalid month name:', monthName)
      return
    }

    showLoader.value = true
    await fetchYearlyChartData()
    await fetchMonthlyChartData()
  } catch (error) {
    console.error(error)
  }
}
const setMonthLocaleString = () => {
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]
  selectedMonthName.value = monthNames[new Date().getMonth()]
}
const fetchMonthlyChartData = async () => {
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${ORDER_BASE_URL.value}/chart-data/${encodeURIComponent(selectedYear.value)}/${encodeURIComponent(selectedMonth.value)}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    monthlyCategory.value = res.data.monthlyCategory
    monthlyData.value = res.data.monthlyData
    showLoader.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

/* TableReport Helper */
const activityReportData = ref([])
const category = ref('')

const updateCategory = (value) => {
  category.value = value[0].name
  fetchTableDataReport()
}

const fetchTableDataReport = async () => {
  try {
    let url = `${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/table-data?`
    if (category.value && category.value !== '') {
      url += `category=${encodeURIComponent(category.value)}`
    }
    if(filterDate.value) url += `date=${filterDate.value}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch data Report')
    }
    const res = await response.json()
    if (res.data) activityReportData.value = res.data.slice(0, 200)
  } catch (error) {
    console.error('Error fetching data Report:', error)
  }
}

/* TicketInfoCard Helper */
const orderInfoCardData = ref([])
const totalSum = () => {
  return orderInfoCardData.value.reduce((total, item) => {
    return total + item.amount
  }, 0)
}

const fetchOrderInfoCardData = async () => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/${ORDER_BASE_URL.value}/recent-purchase`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    orderInfoCardData.value = res.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

export default {
  incomeRevenue,
  fetchIncomeRevenue,
  generateExcel,
  currentYear,
  selectedYear,
  targetYears,
  yearlyCategory,
  yearlyData,
  changeSelectedYear,
  fetchTargetYears,
  fetchYearlyChartData,
  currentMonth,
  monthName,
  selectedMonth,
  selectedMonthName,
  targetMonths,
  monthlyCategory,
  monthlyData,
  filterDate,
  changeSelectedMonth,
  fetchTargetMonths,
  revenueKeraton,
  setMonthLocaleString,
  fetchMonthlyChartData,
  activityReportData,
  fetchTableDataReport,
  category,
  updateCategory,
  capitalizeFirstLetter,
  formatDate,
  formatCurrency,
  orderInfoCardData,
  totalSum,
  fetchOrderInfoCardData
}
