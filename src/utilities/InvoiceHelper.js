import { ref, computed } from 'vue'
import GlobalHelper from '@/utilities/GlobalHelper'

const { DB_BASE_URL, TRANSACTION_BASE_URL, showLoader } = GlobalHelper

const dataInvoice = ref([])
const lengthdata = ref(0)
const data = ref([])
const listOfTaxes = ref({ cash: [], nonCash: [] })
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const getSearchQuery = (query) => {
  getSearchQuery.value = query
}
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return dataInvoice.value.slice(start, end)
})


const fetchTransactionList = async ({ limit, page }) => {
  showLoader.value = true
  try {
    let url = `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/detail-invoice?search=${encodeURIComponent(searchQuery.value)}&limit=${limit}`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch data')
    
    const res = await response.json()
    dataInvoice.value = res.data
    
    totalPages.value = limit === 'All' ? 1 : Math.ceil(dataInvoice.value.length / limit)
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    showLoader.value = false
  }
}


const mapInvoiceOrders = (data) => {
  console.log(data)
  if (data.detailTrans.length > 0) {
    return data.detailTrans
      .map((item) => {
        const orderName = item?.order ? item.order.name : item.event.name
        const orderCategoryName = item.order ? item.order.category.name : 'Event'

        return `${orderName} (${orderCategoryName}) x ${item.amount}`
      })
      .join(', ')
  }
  return ''
}
const mapInvoiceDetails = (data) => {
  if (data.detailTrans.length > 0) {
    let discountAmount = 0
    if (data.discount)
      discountAmount = parseInt(data.discount.split('|')[1].trim().replace('%', ''))
    return data.detailTrans.map((item) => {
      const orderName = item.order ? item.order.name : item.event.name
      const orderCategoryName = item.order ? item.order.category.name : 'Event'
      const guideName = item.guide ? item.guide.name : ''
      const orderPrice = Number(item.order ? item.order.price : item.event.price).toLocaleString(
        'id-ID'
      )
      const orderAmount = Number(item.amount).toLocaleString('id-ID')
      const orderDiscount = Number(
        ((item.order ? item.order.price : item.event.price) * orderAmount * discountAmount) / 100
      ).toLocaleString('id-ID')
      const formattedDiscount = `Rp. ${orderDiscount},00 (${discountAmount}%)`
      const totalPrice = Number(
        item.amount * (item.order ? item.order.price : item.event.price)
      ).toLocaleString('id-ID')

      return {
        order: `${orderName} (${orderCategoryName}) : ${item.amount} Tiket`,
        guide: guideName,
        price: orderPrice,
        amount: orderAmount,
        discountAmount: discountAmount,
        discount: formattedDiscount,
        totalPrice: totalPrice
      }
    })
  }
  return []
}

const searchQuery = ref("")
console.log(searchQuery)
const resetSearch = () => {
  searchQuery.value = ''
}

const selectedItem = ref(null)

const splitDate = (dateTime) => {
  const parts = dateTime.split('T')
  const dateParts = parts[0].split('-')
  const timeParts = parts[1].split(':')

  // Memformat tanggal (dd/mm/yyyy)
  const day = dateParts[2]
  const month = dateParts[1]
  const year = dateParts[0]
  const formattedDate = `${day}/${month}/${year}`

  // Memformat waktu (hh.mm)
  const hours = timeParts[0]
  const minutes = timeParts[1]
  const formattedTime = `${hours}.${minutes}`

  return [formattedDate, formattedTime]
}

const formatDate = (dateTime) => {
  const date = new Date(dateTime)
  date.setHours(date.getHours() - 7)

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

  // Memformat tanggal (dd month yy)
  const day = String(date.getDate()).padStart(2, '0')
  const month = monthNames[date.getMonth()]
  const year = String(date.getFullYear())
  const formattedDate = `${day} ${month} ${year}`

  // Memformat waktu (hh.mm)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const formattedTime = `${hours}.${minutes}`

  return `${formattedDate} / ${formattedTime}`
}

const showDetail = (item) => {
  try {
    selectedItem.value = {
      cashier: `${item.user.name} (${item.user.email})`,
      customer: `${item.customer?.name || item.user.name} (${item.customer?.email || item.user.email})`,
      reservation: mapInvoiceDetails(item),
      appointment: formatDate(item.plannedDate),
      paymentMethod: item.method,
      number: item.customer?.number ? item.customer.number : item.user.number,
      qr:
        Array.isArray(item.BarcodeUsage) && item.BarcodeUsage.length > 0
          ? item.BarcodeUsage[0].qrPath
          : item.qr[0],
      payment: capitalizeFirstLetter(item.method),
      total: `Rp. ${Number(item.total).toLocaleString('id-ID')}`
    }
    console.log(selectedItem)
    showDetailPopup()
  } catch (err) {
    console.log(err)
  }
}

/* InvoiceDetail Helper */
const showPopup = ref(false)

const showDetailPopup = () => {
  showPopup.value = true
}

const closeDetailPopup = () => {
  showPopup.value = false
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const deleteTransaction = async (id) => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/delete-transaction/${id}`, {
      method: 'GET'
    })
    if (!response.ok) throw Error('Terjadi kesalahan saat melakukan fetching')
    fetchTransactionList()
  } catch (err) {
    console.log(err)
  }
}
export default {
  currentPage,
  pageSize,
  paginatedData,
  totalPages,
  dataInvoice,
  getSearchQuery,
  fetchTransactionList,
  searchQuery,
  resetSearch,
  mapInvoiceOrders,
  mapInvoiceDetails,
  selectedItem,
  deleteTransaction,
  splitDate,
  listOfTaxes,
  showDetail,
  showPopup,
  data,
  showDetailPopup,
  closeDetailPopup,
  capitalizeFirstLetter
}
