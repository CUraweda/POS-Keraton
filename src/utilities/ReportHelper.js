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
  const date = new Date(dateStr)

  // Mendapatkan komponen tanggal, bulan, tahun, jam, menit, dan detik
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Bulan dimulai dari 0
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
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
    const response = await fetch(
      `${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/table-data-all`
    )
    const responseNational = await fetch(
      `${DB_BASE_URL.value}/keraton-pos/nationality/nationality-list`
    )
    if (!response.ok) throw new Error('Failed to fetch data')

    const responseData = await response.json()
    const responseRegion = await responseNational.json()
    const workbook = XLSX.utils.book_new()
    const tableSheetData = []

    setMonthLocaleString()
    let rowIndex = 1
    let currentTransactionId
    let ticketsSoldment = {}

    // Adding headers to the sheet data
    tableSheetData.push([
      'No.',
      'Tanggal',
      'Pelanggan',
      'Asal Kota',
      'Asal Negara',
      'Nama Tiket',
      'Ketersediaan Item',
      'Jenis Tiket',
      'Pembayaran',
      'Jumlah',
      'Harga',
      'Total',
      'Total Dibayar',
      'Dihapus',
      'Lokasi',
      'Timestamp'
    ])

    console.log(responseData.data)

    let regionDatas = {}
    responseRegion.data.forEach((data) => {
      regionDatas[data.id] = data.name
    })

    responseData.data.forEach((data, i) => {
      const row = []
      let numTabel = '',
        total = ''
      // Check if it's a new transaction
      if (data.transactionId !== currentTransactionId) {
        numTabel = rowIndex
        total = +data.transaction.total
        rowIndex++
      }

      row.push(numTabel)
      row.push(formatDate(data.transaction.plannedDate))
      row.push(data.transaction.customer?.name || data.transaction.user?.name)
      row.push(data.cityName ?? '-')
      row.push(data.nationalityId ? regionDatas[data.nationalityId] : '-')
      row.push(data.order?.name || data.event.name)
      row.push(
        data.order
          ? data.order.deleted
            ? 'Tidak'
            : 'Aktif'
          : data.event.deleted
            ? 'Tidak'
            : 'Aktif'
      )
      row.push(data.order?.category.name || 'Event')
      row.push(data.transaction.method)
      row.push(data.amount)
      row.push(formatCurrency(data.order?.price || data.event.price))
      row.push(formatCurrency(data.amount * (data.order?.price || data.event.price)))
      row.push(formatCurrency(total))
      row.push(data.transaction.deleted ? 'Ya' : 'Tidak')
      row.push(data.cityName)
      row.push(formatDate(data.transaction.createdDate))
      // IF the data.deleted is true then make all the cell to get filled with red

      if (!ticketsSoldment[data.order?.name || data.event.name])
        ticketsSoldment[data.order?.name || data.event.name] = {
          name: data.order?.name || data.event.name,
          price: data.order?.price || data.event.price,
          soldAmount: 0,
          revenueTotal: 0,
          revenueKeraton: 0,
          revenueCuraweda: 0
        }
      if (!data.transaction.deleted) {
        ticketsSoldment[data.order?.name || data.event.name].soldAmount += data.amount
        ticketsSoldment[data.order?.name || data.event.name].revenueTotal +=
          data.amount * (data.order?.price || data.event.price)
        ticketsSoldment[data.order?.name || data.event.name].revenueKeraton +=
          data.transaction.keratonIncome.COH + data.transaction.keratonIncome.CIA
        ticketsSoldment[data.order?.name || data.event.name].revenueCuraweda +=
          data.transaction.curawedaIncome.COH + data.transaction.curawedaIncome.CIA
        currentTransactionId = data.transactionId
      }
      tableSheetData.push(row);
    });

    console.log(tableSheetData)
    // Create worksheet and add data to it
    const worksheet = XLSX.utils.aoa_to_sheet(tableSheetData)

    // Auto size columns
    const colWidths = tableSheetData[0].map((_, colIndex) => {
      const colValues = tableSheetData.map((row) => (row[colIndex] ? row[colIndex].toString() : ''))
      const maxLength = Math.max(...colValues.map((val) => val.length))
      return { wch: maxLength + 2 } // Adding padding for better spacing
    })
    worksheet['!cols'] = colWidths

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendapatan Tiket Tahun 2024')

    // TICKET SHEET
    const ticketSheetData = [
      [
        'Nama Tiket',
        'Harga Tiket',
        'Total Penjualan',
        'Revenue Penjualan',
        'Revenue Keraton',
        'Revenue Curaweda'
      ]
    ]
    for (let ticketData of Object.values(ticketsSoldment)) {
      ticketSheetData.push(Object.values(ticketData))
    }
    const ticketSheets = XLSX.utils.aoa_to_sheet(ticketSheetData)
    const ticketColWidth = ticketSheetData[0].map((_, colIndex) => {
      const colValues = ticketSheetData.map((row) =>
        row[colIndex] ? row[colIndex].toString() : ''
      )
      const maxLength = Math.max(...colValues.map((val) => val.length))
      return { wch: maxLength + 2 } // Adding padding for better spacing
    })
    ticketSheets['!cols'] = ticketColWidth
    XLSX.utils.book_append_sheet(workbook, ticketSheets, 'Penjualan Tiket Tahun 2024')

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
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Rekapan Transaksi')

    //DATA PENGUNJUNG
    const pengunjungExcelData = [
      [`Tabel Data Pengunjung ${selectedYear.value}`],
      ['Negara', 'Jumlah', 'Kota', 'Jumlah']

    ]
    const responsePengunjung = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/get-all-detail`
    )
    if (!responsePengunjung.ok) throw new Error('Gagal Fetching Data')
    const pengunjungData = await responsePengunjung.json()

    let rawTabel = { city: {}, country: {}, cityLength: 0, countryLength: 0 }, rawFormatedTabel = []
    for (let data of pengunjungData.data) {
      let identifier = 'city', dataName = data.cityName
      if (data.nationalityId) {
        identifier = 'country'
        dataName = data.nationality.name
      }

      if (!rawTabel[identifier][dataName]) {
        rawTabel[identifier][dataName] = {
          amount: 0,
          name: dataName
        }
        rawTabel[`${identifier}Length`]++
      }
      rawTabel[identifier][dataName].amount += data.amount
    }
    const highestLenght = Math.max(rawTabel.cityLength, rawTabel.countryLength)
    const cityData = Object.values(rawTabel.city)
    const countryData = Object.values(rawTabel.country)
    for (let num = 0; num < highestLenght; num++) {
      pengunjungExcelData.push([countryData[num]?.name || "", countryData[num]?.amount || '', cityData[num]?.name || '', cityData[num]?.amount || ''])
    }

    const pengungjungSheets = XLSX.utils.aoa_to_sheet(pengunjungExcelData)
    // Auto size columns
    const colWidthPengujung = pengunjungExcelData.map((_, colIndex) => {
      const colValues = pengunjungExcelData.map(row => row[colIndex] ? row[colIndex].toString() : '');
      const maxLength = Math.max(...colValues.map(val => val.length));
      return { wch: maxLength + 2 }; // Adding padding for better spacing
    });
    pengungjungSheets['!cols'] = colWidthPengujung;
    XLSX.utils.book_append_sheet(workbook, pengungjungSheets, `Data Pengunjung Bulan ${selectedMonthName.value}`)
    // Write workbook to file
    XLSX.writeFile(workbook, `Pendapatan_Tiket ${new Date().toISOString()}.xlsx`)
  } catch (err) {
    console.error(err)
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
  tableDataFilter.value['category'] = category.value
  fetchTableDataReport(tableDataFilter.value)
}

const tableDataFilter = ref({
  limit: null,
  startDate: null,
  endDate: null,
  optiondropdown: null
})

const fetchTableDataReport = async (filter = tableDataFilter.value) => {
  try {
    console.log(filter)
    let url = `${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/table-data?`
    if (category.value) {
      url += `&category=${encodeURIComponent(category.value)}`
    }
    if (filter.startDate) {
      filter.startDate = filter.startDate.split('T')[0]
      url += `&startDate=${filter.startDate}`
    }
    if (filter.endDate) {
      filter.endDate = filter.endDate.split('T')[0]
      url += `&endDate=${filter.endDate}`
    }
    if (filter.limit) {
      url += `&limit=${filter.limit}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch data Report')

    const res = await response.json()
    if (res.data) {
      activityReportData.value = res.data
    }
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
const exportToExcel = () => {
  const data = activityReportData.value.map((item, index) => ({
    No: index + 1,
    Pembelian: item.order ? item.order.name : item.event.name,
    Kategori: item.order ? item.order.category.name : 'Event',
    Tanggal: formatDate(item.transaction.plannedDate),
    Jumlah: item.amount,
    Total: (item.order ? item.order.price : item.event.price) * item.amount
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const maxLengths = data.reduce((lengths, row) => {
    Object.keys(row).forEach((key, i) => {
      lengths[i] = Math.max(lengths[i] || 0, row[key].toString().length)
    })
    return lengths
  }, [])
  ws['!cols'] = maxLengths.map((length) => ({ width: length }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  const formattedStartDate = tableDataFilter.value.startDate
    ? tableDataFilter.value.startDate.split('T')[0]
    : 'N/A'
  const formattedEndDate = tableDataFilter.value.endDate
    ? tableDataFilter.value.endDate.split('T')[0]
    : 'N/A'
  const fileName = `Report_${formattedStartDate}_to_${formattedEndDate}.xlsx`

  XLSX.writeFile(wb, fileName)
}

export default {
  exportToExcel,
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
  tableDataFilter,
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
