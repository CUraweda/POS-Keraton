import { ref, computed } from 'vue'
import GlobalHelper from './GlobalHelper'
import LoginHelper from './LoginHelper'
import DashboardHelper from './DashboardHelper'
import html2pdf from 'html2pdf.js'

const {
  DB_BASE_URL,
  GUIDE_BASE_URL,
  NATIONALITY_BASE_URL,
  TRANSACTION_BASE_URL,
  DETAILTRANS_BASE_URL,
  showLoader,
  sendQueue,
  assignAlert
} = GlobalHelper

const { userData, userCarts, getCookie } = LoginHelper

/* NationalityDropdown Helper */
const nationalityData = ref([])
const selectedNationality = ref()

const fetchNationalityData = async () => {
  try {
    const response = await fetch(
      `${DB_BASE_URL.value}/${NATIONALITY_BASE_URL.value}/nationality-list`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    nationalityData.value = res.data
    console.log(nationalityData)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const nationalityQuery = ref('')
const nationalityResult = ref([])
const isNationalityDropdownOpen = ref(false)
const showFlag = ref(false)
const selectedFlagImageUrl = ref('')

const loadNationalityData = () => {
  if (nationalityQuery.value.trim() !== '') {
    isNationalityDropdownOpen.value = true
    const filteredData = nationalityData.value.filter((nationality) => {
      return nationality.name.toLowerCase().includes(nationalityQuery.value.trim().toLowerCase())
    })

    console.log(filteredData)
    nationalityResult.value = filteredData
    isNationalityDropdownOpen.value = nationalityResult.value.length > 0
  } else {
    nationalityResult.value = []
    isNationalityDropdownOpen.value = false
  }
}
const openNationalityDropdown = () => {
  if (nationalityQuery.value.trim() === '') {
    isNationalityDropdownOpen.value = true
    nationalityResult.value = nationalityData.value
  } else {
    isNationalityDropdownOpen.value = true
    loadNationalityData()
  }
}
const closeNationalityDropdown = () => {
  isNationalityDropdownOpen.value = false
  nationalityResult.value = []
}
const getFlagImageUrl = (countryCode) => {
  const flagCode = countryCode

  return `https://flagcdn.com/48x36/${flagCode}.png`
}
const getNationality = (nationalityId, nationalityName, countryCode) => {
  nationalityQuery.value = nationalityName
  nationalityResult.value = []
  isNationalityDropdownOpen.value = false
  showFlag.value = true

  const flagImageUrl = getFlagImageUrl(countryCode)

  selectedFlagImageUrl.value = flagImageUrl
  selectedNationality.value = nationalityId
}
const closeDropdownOutside = (event) => {
  const dropdownContainer = document.querySelector('.nationality-dropdown__container')
  if (dropdownContainer && !dropdownContainer.contains(event.target)) {
    closeNationalityDropdown()
  }
}

/* CheckoutView Helper */
const getUserCarts = () => {
  if (userCarts.value) {
    for (let item of userCarts.value) {
      ; (item.nationalityId = undefined),
        (item.cityName = undefined),
        (item.guideId = item.guideId || '')
      item.guideName = item.guideName || ''
    }
    console.log(userCarts.value)
    return userCarts.value
  }
  return []
}

function addTicket(index) {
  if (userCarts.value[index].amount >= maxTickets.value) {
    assignAlert(
      true,
      'Error',
      'danger',
      `Maaf, tiket tidak bisa melebihi ${maxTickets.value} tiket!`
    )
    userCarts.value[index].amount = maxTickets.value
  } else {
    userCarts.value[index].amount++
  }
  DashboardHelper.saveToUserCarts()
}

function reduceTicket(index) {
  if (userCarts.value[index].amount > 0) {
    userCarts.value[index].amount--
    if (userCarts.value[index].amount === 0) {
      userCarts.value.splice(index, 1)
    }
  }
  DashboardHelper.saveToUserCarts()
}

const custName = ref('')
const custEmail = ref('')
const custNumber = ref('')
const asalKota = ref('')
const selectedDate = ref(null)
const discountValue = ref(0)
const cashbackValue = ref(0)
const cityName = ref('')

const biayaLayanan = ref(0)
const biayaJasa = ref(0)
const biayaJasaCard = ref(0.015)
const maxTickets = ref()
const fetchFeeSettings = () => {
  const savedBiayaLayanan = localStorage.getItem('biayaLayanan')
  if (savedBiayaLayanan) {
    biayaLayanan.value = parseInt(savedBiayaLayanan)
  }
  const savedBiayaJasa = localStorage.getItem('biayaJasa')
  if (savedBiayaJasa) {
    biayaJasa.value = parseInt(savedBiayaJasa)
  }
  const savedMaxTickets = localStorage.getItem('maxTickets')
  if (savedMaxTickets) {
    maxTickets.value = parseInt(savedMaxTickets)
  }
  const savedBiayaJasaCard = localStorage.getItem('biayaJasaCard')
  if (savedBiayaJasaCard) {
    biayaJasaCard.value = parseInt(biayaJasaCard)
  }
}

const formatCurrency = (amount) => {
  return parseInt(amount).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const totalHarga = computed(() => {
  let total = 0
  for (const ticket of userCarts.value) {
    total += ticket.price * ticket.amount
  }
  return total
})

const totalBiaya = computed(() => {
  const diskon = (totalHarga.value * discountValue.value) / 100
  const biayaJasaAplikasi =
    paymentSelection.value === 'Cash' ? biayaJasa.value : totalHarga.value * biayaJasaCard.value
  console.log(paymentSelection.value)
  return totalHarga.value - diskon + biayaLayanan.value + biayaJasaAplikasi
})

const totalTagihan = computed(() => {
  const diskon = (totalHarga.value * discountValue.value) / 100
  let taxes = 0
  const taxesIdentifier = paymentSelection != 'Cash' ? 'nonCash' : 'cash'
  if (listOfTaxes[taxesIdentifier]) {
    for (let tax of listOfTaxes[taxesIdentifier]) {
      taxes += tax.multiply ? totalTagihan.value * tax.tax : totalTagihan.value + tax.tax
    }
  }
  return totalHarga.value - diskon + biayaLayanan.value + taxes
})

const totalTicketCount = computed(() => {
  let totalCount = 0
  for (const ticket of userCarts.value) {
    totalCount += ticket.amount
  }
  return Number(totalCount)
})

//Payment Method Selection
const listOfTaxes = ref({})
const paymentSelection = ref('Cash')
const paymentSelect = ref(false)
const paymentTaxIdentifier = ref('cash')
const showPaymentSelect = () => {
  paymentSelect.value = !paymentSelect.value
}
const selectPayment = (paymentMethod) => {
  paymentSelection.value = paymentMethod
  switch (paymentMethod) {
    case 'Kartu Kredit/Debit':
      paymentTaxIdentifier.value = 'nonCash'
      break
    default:
      paymentTaxIdentifier.value = 'cash'
      break
  }
  paymentSelect.value = false
}

const fetchTaxes = async () => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/list-tax`)
    if (!response.ok) throw Error('Terjadi kesalahan')
    const responseData = await response.json()
    listOfTaxes.value.cash = responseData.data.data.cash.filter((tax) => tax.paidBy === 'user')
    listOfTaxes.value.nonCash = responseData.data.data.nonCash.filter(
      (tax) => tax.paidBy === 'user'
    )
  } catch (err) {
    console.log(err)
  }
}

const checkoutStatus = ref('')
const paymentStatus = ref('')
const recentTransactionId = ref('')

const createTransaction = async () => {
  const order = userCarts.value
    .filter((item) => item.amount > 0)
    .map((item) => ({
      id: item.id,
      ...(item.nationalityId && { nationalityId: item.nationalityId }),
      ...(item.cityName && { cityName: item.cityName }),
      price: item.price,
      amount: item.amount,
      guideId: item.guideId
    }))

  console.log(getCookie('token'))

  try {
    if (order.length < 1) throw Error('No Item To Checkout')
    showLoader.value = true
    const response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/create-transaction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getCookie('token')
        },
        body: JSON.stringify({
          // customer: {
          //   name: custName.value,
          //   email: custEmail.value,
          //   number: custNumber.value
          // },
          // userId: userData.value.id,
          // kotaPengunjung: asalKota.value,
          // nationalityId: selectedNationality.value,
          // plannedDate: selectedDate.value,
          // additionalFee: Number(paymentSelection.value == 'Cash' ? biayaLayanan.value + biayaJasa.value : biayaJasaCard.value + biayaLayanan.value),
          // total: totalTagihan.value.toFixed(2),
          // method: paymentSelection.value.toUpperCase(),
          // status: paymentStatus.value ? paymentStatus.value : 'DAPAT_DIGUNAKAN',
          // discount:
          //   discountValue.value > 0
          //     ? `${(totalHarga.value * discountValue.value) / 100} | ${discountValue.value}`
          //     : '0 | 0%',
          // cashback:
          //   cashbackValue.value > 0
          //     ? `${(totalTagihan.value * cashbackValue.value) / 100} | ${cashbackValue.value}`
          //     : '0 | 0%',
          // order: order
          customer: {
            name: custName.value,
            email: custEmail.value,
            number: custNumber.value
          },
          user: { connect: { id: userData.value.id } },
          plannedDate: new Date(selectedDate.value),
          method: paymentSelection.value.toUpperCase(),
          status: paymentStatus.value ? paymentStatus.value : 'DAPAT_DIGUNAKAN',
          discount: +discountValue.value,
          cashback: +cashbackValue.value,
          order: order
        })
      }
    )

    if (!response.ok) {
      checkoutStatus.value = 'salah'
      showLoader.value = false
      throw new Error('Failed to create transaction. Please try again.')
    }

    const res = await response.json()
    recentTransactionId.value = res.data

    checkoutStatus.value = 'boleh'
    showLoader.value = false
    userCarts.value = []
    DashboardHelper.updateUserCarts(userCarts.value)
  } catch (error) {
    console.log(error)
  }
}

const fetchGuideData = async () => {
  try {
    const response = await fetch(`${DB_BASE_URL.value}/${GUIDE_BASE_URL.value}/guide-list`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    guideData.value = res.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

//Guide Selection
const guideData = ref([])
const guideSelection = ref([])
const guideSelect = ref(false)

const guideSelectors = ref(true)
const guideSelectBio = ref(false)
const guideSelectTicket = ref(false)

const selectedGuide = ref([])

const guideSelectPage = () => {
  guideSelect.value = !guideSelect.value
}

const guideSelectPageBio = (guide) => {
  guideSelectBio.value = !guideSelectBio.value
  guideSelectors.value = !guideSelectors.value
  selectedGuide.value = guide
}
const guideSelectPageTicket = () => {
  guideSelectTicket.value = !guideSelectTicket.value
  guideSelectBio.value = !guideSelectBio.value
  guideSelectors.value = false
}

const isGuideChecked = computed(() => {
  return (guideId) => {
    return guideSelection.value.some((guide) => guide.id === guideId)
  }
})

const updateItems = (props) => {
  userCarts.value[props].guideId = selectedGuide.value.id
  userCarts.value[props].guideName = selectedGuide.value.name
}

const addGuide = (index) => {
  const existingIndex = userCarts.value.findIndex((item) => item.guideId === selectedGuide.value.id)
  const previousSelectionIndex = guideSelection.value.findIndex(
    (guide) => guide.id === userCarts.value[index].guideId
  )
  if (existingIndex === -1) {
    updateItems(index)
  } else {
    updateItems(existingIndex)
  }
  if (previousSelectionIndex !== -1) {
    guideSelection.value.splice(previousSelectionIndex, 1)
  }
  guideSelection.value.push({ ...selectedGuide.value })
  guideSelectTicket.value = false
  guideSelectBio.value = false
  guideSelectors.value = true
}

const formattedGuideSelection = computed(() => {
  return guideSelection.value.map((guide) => guide.name).join(', ')
})

function determineAge(birthdate) {
  const birthDate = new Date(birthdate)
  const currentDate = new Date()

  const age = currentDate.getFullYear() - birthDate.getFullYear()

  const isBirthdayPassed =
    currentDate.getMonth() > birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() >= birthDate.getDate())

  const finalAge = isBirthdayPassed ? age : age - 1

  return finalAge
}

function formatGender(gender) {
  if (gender === 'MALE') return 'L'
  else if (gender === 'FEMALE') return 'P'
  return '?'
}

const unavailableGuideData = ref([])
const fetchUnavailableGuide = async () => {
  try {
    showLoader.value = true

    const response = await fetch(
      `${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/unavailable-guide?date=${selectedDate.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      showLoader.value = false
      throw new Error('Failed to fetch unavailable guide. Please try again.')
    }
    const res = await response.json()
    unavailableGuideData.value = res.data
    showLoader.value = false
  } catch (error) {
    console.log(error)
  }
}
const checkGuideAvailability = (id) => {
  return unavailableGuideData.value.some((data) => (data.guide ? data.guide.id === id : false))
}

const ticketsData = ref([])
const emailCooldown = ref(false)

const sendEmailToUser = async () => {
  try {
    const queueExist = sendQueue.value.findIndex(
      (queue) =>
        queue.uuid === ticketsData.value.id && queue.email === ticketsData.value.customer.email
    )
    if (queueExist !== -1) {
      sendQueue.value.splice(queueExist, 1)
    }

    sendQueue.value.push({
      uuid: ticketsData.value.id,
      email: ticketsData.value.customer.email,
      sent: false,
      status: ''
    })
    sendQueue.value.push({
      uuid: ticketsData.value.id,
      email: ticketsData.value.customer.email,
      sent: false,
      status: ''
    })
    emailCooldown.value = true
    let response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/generate-email-invoice/${ticketsData.value.id}`
    )

    if (!response.ok) {
      emailCooldown.value = false
      const index = sendQueue.value.findIndex(
        (queue) =>
          queue.uuid === ticketsData.value.id && queue.email === ticketsData.value.customer.email
      )
      if (index !== -1) {
        sendQueue.value[index] = { ...sendQueue.value[index], sent: true, status: 'failed' }
      }
      assignAlert(
        true,
        'Error',
        'danger',
        `Gagal mengirim email ke ${ticketsData.value.customer.email}!`
      )

      throw new Error('Failed to send email!')
    }

    const res = await response.json()
    console.log(res)
    emailCooldown.value = false
    const index = sendQueue.value.findIndex(
      (queue) =>
        queue.uuid === ticketsData.value.id && queue.email === ticketsData.value.customer.email
    )
    if (index !== -1) {
      sendQueue.value[index] = { ...sendQueue.value[index], sent: true, status: 'success' }
    }
    assignAlert(
      true,
      'Success',
      'success',
      `Berhasil mengirim email ke ${ticketsData.value.customer.email}!`
    )
    console.log('Email sent successfully:', res.message)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

const printTickets = async () => {
  // try {
  //   let response = await fetch(
  //     `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/print-transaction`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         ...ticketsData.value
  //       })
  //     }
  //   )
  //   if (!response.ok) {
  //     showLoader.value = false
  //     throw new Error('Failed to print data!')
  //   }
  // } catch (error) {
  //   console.error('Error fetch data:', error)
  // }
}

export default {
  selectedNationality,
  fetchNationalityData,
  nationalityQuery,
  nationalityResult,
  isNationalityDropdownOpen,
  showFlag,
  selectedFlagImageUrl,
  loadNationalityData,
  openNationalityDropdown,
  getFlagImageUrl,
  getNationality,
  closeDropdownOutside,
  getUserCarts,
  fetchTaxes,
  listOfTaxes,
  paymentSelection,
  paymentSelect,
  showPaymentSelect,
  selectPayment,
  addTicket,
  reduceTicket,
  custName,
  asalKota,
  custEmail,
  selectedDate,
  discountValue,
  cashbackValue,
  biayaLayanan,
  biayaJasa,
  maxTickets,
  fetchFeeSettings,
  nationalityData,
  formatCurrency,
  totalHarga,
  totalTagihan,
  totalBiaya,
  totalTicketCount,
  recentTransactionId,
  paymentTaxIdentifier,
  createTransaction,
  checkoutStatus,
  guideData,
  selectedGuide,
  guideSelect,
  guideSelectPage,
  guideSelection,
  guideSelectBio,
  guideSelectPageBio,
  guideSelectors,
  guideSelectTicket,
  guideSelectPageTicket,
  addGuide,
  isGuideChecked,
  formattedGuideSelection,
  fetchGuideData,
  determineAge,
  formatGender,
  fetchUnavailableGuide,
  unavailableGuideData,
  checkGuideAvailability,
  ticketsData,
  emailCooldown,
  sendEmailToUser,
  printTickets,
  biayaJasaCard
}
