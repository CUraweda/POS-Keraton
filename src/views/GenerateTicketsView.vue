<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GlobalHelper from '@/utilities/GlobalHelper'
import CheckoutHelper from '@/utilities/CheckoutHelper'
import DashboardHelper from '@/utilities/DashboardHelper'
import LoginHelper from '@/utilities/LoginHelper'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const { DB_BASE_URL, TRANSACTION_BASE_URL, showLoader, getImageURL } = GlobalHelper
const { ticketsData, emailCooldown, sendEmailToUser } = CheckoutHelper

const router = useRouter()
const route = useRoute()
const generatePDFcooldown = ref(false)
let customerName = ''
let customerEmail = ''
let arrayTiket = []

const formatCurrency = (amount) => {
  return Number(amount).toLocaleString('id-ID')
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

const calculateTotal = (price, amount) => {
  return formatCurrency(price * amount)
}

const toHomepage = async () => {
  LoginHelper.userCarts.value = []
  await DashboardHelper.saveToUserCarts()
  await router.replace('/')
}

const fetchTickets = async (id) => {
  try {
    showLoader.value = true
    const response = await fetch(
      `${DB_BASE_URL.value}/${TRANSACTION_BASE_URL.value}/generate-tickets/${encodeURIComponent(id)}`
    )
    if (!response.ok) {
      showLoader.value = false
      throw new Error('Failed to fetch data')
    }
    const res = await response.json()
    ticketsData.value = res.data

    const detail = res.data.detailTrans

    detail.forEach((item) => {
      if (item.order && item.order.desc) {
        // Split setiap .order.desc dan masukkan hasilnya sebagai subarray ke arrayTiket
        arrayTiket.push(item.order.desc.split(','))
      }
    })

    console.log(arrayTiket)

    customerName = res.data.customer.name
    customerEmail = res.data.customer.email

    showLoader.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const isLoading = ref(false)

const addElementToPDF = (element, pdf) => {
  return new Promise((resolve) => {
    html2canvas(element, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 80
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        resolve(imgHeight)
      })
      .catch((error) => {
        console.error('Error generating canvas:', error)
        resolve()
      })
  })
}

const PrintCut = async (idComponen1, idComponen2) => {
  try {
    const pdf = new jsPDF('p', 'mm', [80, 300])
    const ticketElement = document.getElementById(idComponen1)
    if (ticketElement) {
      await addElementToPDF(ticketElement, pdf)
    }

    const tiketPotongElements = document.querySelectorAll(idComponen2)

    if (tiketPotongElements.length > 0) {
      pdf.addPage()
    }

    for (let index = 0; index < tiketPotongElements.length; index++) {
      if (index > 0) {
        pdf.addPage()
      }
      await addElementToPDF(tiketPotongElements[index], pdf)
    }

    const pdfOutput = pdf.output('blob')
    const url = URL.createObjectURL(pdfOutput)
    const printWindow = window.open(url, '_blank')

    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        URL.revokeObjectURL(url)
      }
    }

    printWindow.onerror = () => {
      console.error("Print window couldn't be opened. Please check your popup blocker.")
      isLoading.value = false
    }
  } catch (err) {
    console.error(err)
    isLoading.value = false
  }
}

const PrintNonCut = async (idComponen) => {
  try {
    const ticketElement = document.getElementById(idComponen)
    if (!ticketElement) {
      console.error('Element not found')
      return
    }

    // Konversi elemen ke gambar menggunakan html2canvas
    const canvas = await html2canvas(ticketElement, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    // Hitung tinggi PDF berdasarkan tinggi canvas
    const widthInMm = 80
    const heightInMm = (canvas.height * 80) / canvas.width

    const pdf = new jsPDF('p', 'mm', [widthInMm, heightInMm])
    pdf.addImage(imgData, 'PNG', 0, 0, widthInMm, heightInMm)

    const pdfOutput = pdf.output('blob')
    const url = URL.createObjectURL(pdfOutput)
    const printWindow = window.open(url, '_blank')

    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
        URL.revokeObjectURL(url)
      }
    }

    printWindow.onerror = () => {
      console.error("Print window couldn't be opened. Please check your popup blocker.")
      isLoading.value = false
    }
  } catch (err) {
    console.error(err)
    isLoading.value = false
  }
}

const formatUniqeCode = (date, name) => {
  const tanggal = date ? new Date(date) : new Date()
  const nameuser = name ? name.split(' ')[0] : 'NC'

  const formattedDate =
    nameuser +
    tanggal.toISOString().slice(2, 10).replace(/-/g, '') +
    '-' +
    tanggal.toTimeString().slice(0, 8).replace(/:/g, '')

  return formattedDate
}

onMounted(() => {
  fetchTickets(route.params.id)
})
</script>

<template>
  <div class="generate-tickets__container flex fd-col h-full">
    <div class="generate-tickets__header flex align-items-center pd-1">
      <h3 class="fw-600">Generate Tickets</h3>
    </div>
    <div class="generate-tickets__content pd-sd-2 pd-block-1">
      <div class="preview flex fd-col gap-1 pd-1">
        <h5>Pratinjau</h5>
        <div
          v-for="(ticket, index) in ticketsData.detailTrans"
          :key="index"
          class="generate-tickets__detail-transaction flex justify-content-sb"
        >
          <div class="flex gap-1">
            <img
              :src="
                ticket.order.image
                  ? getImageURL(ticket.order.image)
                  : 'https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png'
              "
              class="generate-tickets__detail-transaction-image"
            />
            <div class="flex fd-col">
              <p class="fw-600">{{ `${ticket.order.name} (${ticket.order.category.name})` }}</p>
              <p>{{ `${formatCurrency(ticket.order.price)} x ${ticket.amount} Tiket` }}</p>
              <p>Rp {{ calculateTotal(ticket.order.price, ticket.amount) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="generate-tickets__cta-container flex align-items-center justify-content-center gap-1"
    >
      <button
        class="generate-tickets__btn-print flex align-items-center gap[0.5]"
        @click="PrintCut('ticket', '#tiket-potong')"
        v-if="!generatePDFcooldown"
      >
        <p class="fw-700">Ticket Auto Cut ( Potrait )</p>
        <ph-printer :size="32" />
      </button>
      <button
        class="generate-tickets__btn-print flex align-items-center gap[0.5]"
        @click="PrintNonCut('tiket-full')"
        v-if="!generatePDFcooldown"
      >
        <p class="fw-700">Ticket non Cut ( potrait )</p>
        <ph-printer :size="32" />
      </button>

      <div v-else>
        <p class="fw-700">Generate PDF<span class="send-email__text-cooldown"></span></p>
      </div>
      <button class="generate-tickets__btn-email">
        <div
          v-if="!emailCooldown"
          @click="sendEmailToUser()"
          class="flex align-items-center gap[0.5]"
        >
          <p class="fw-700">Kirim ke Email</p>
          <ph-paper-plane-tilt :size="32" />
        </div>
        <div v-else>
          <p class="fw-700">Mengirim Email<span class="send-email__text-cooldown"></span></p>
        </div>
      </button>
    </div>
    <button
      class="generate-tickets__return-btn flex align-self-center align-items-center justify-content-center gap[0.5] sm-top-2"
      @click="toHomepage"
    >
      <ph-caret-left :size="16" weight="bold" />
      <p>Kembali ke Dashboard</p>
    </button>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <div style="width: 100%; justify-content: center; display: flex; margin-top: 2rem">
      <div style="border: 2px solid black">
        <div id="tiket-full">
          <div ref="ticketRef" id="ticket" style="width: fit-content; height: fit-content">
            <div>
              <div style="display: grid; width: 100%; overflow-x: auto; flex-wrap: wrap">
                <div style="gap: 5px">
                  <section class="ticket">
                    <div style="display: block; width: 100%; justify-content: center">
                      <div style="display: flex; width: 100%">
                        <img
                          src="../assets/images/vectordesign.svg"
                          alt="Keraton Kasepuhan Cirebon"
                          style="
                            width: 120px;
                            height: 120px;
                            margin-inline: auto;
                            margin-top: 10px;
                            margin-bottom: 10px;
                          "
                        />
                      </div>
                      <div style="width: 90%; margin: auto">
                        <h5>
                          Jl. Kasepuhan No.43, Kasepuhan, Kec. Lemahwungkuk, Kota Cirebon, Jawa
                          Barat
                        </h5>
                        <p class="desc">Selamat datang di wisata Keraton Kesepuhan Cirebon</p>
                      </div>
                      <p class="text"></p>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">
                          #{{ formatUniqeCode(ticketsData.createdDate, customerName) }}
                        </p>
                      </div>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Customer</p>
                        <p
                          class="descList"
                          style="display: inline; max-width: 40%; text-align: right"
                        >
                          {{ customerName }}
                        </p>
                      </div>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Email</p>
                        <p class="descList" style="display: inline; text-align: right">
                          {{ customerEmail }}
                        </p>
                      </div>
                      <section
                        class="separator"
                        style="margin-inline: auto; margin-top: 8px"
                      ></section>
                      <div
                        style="width: 95%; margin: auto"
                        v-for="(ticket, index) in ticketsData.detailTrans"
                        :key="index"
                      >
                        <div style="display: flex; justify-content: space-between; width: 100%">
                          <p class="descList">
                            {{
                              `${ticket.order.name} (${ticket.order.category.name}) x ${ticket.amount} Tiket`
                            }}
                          </p>
                          <p
                            class="descList"
                            style="display: inline; max-width: 45%; text-align: right"
                          >
                            {{ `Rp.${formatCurrency(ticket.order.price)}` }}
                          </p>
                        </div>
                      </div>
                      <section
                        class="separator"
                        style="margin-inline: auto; margin-top: 8px"
                      ></section>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Pembayaran</p>
                        <p
                          class="descList"
                          style="display: inline; max-width: 40%; text-align: right"
                        >
                          {{ ticketsData.method }}
                        </p>
                      </div>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Potongan</p>
                        <p
                          class="descList"
                          style="display: inline; max-width: 40%; text-align: right"
                        >
                          {{ ticketsData.discount ? ticketsData.discount.split('|')[1] : '0%' }}
                        </p>
                      </div>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 95%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Cashback</p>
                        <p
                          class="descList"
                          style="display: inline; max-width: 40%; text-align: right"
                        >
                          {{ ticketsData.cashback ? ticketsData.cashback.split('|')[1] : '0%' }}
                        </p>
                      </div>
                      <div
                        style="
                          display: flex;
                          justify-content: space-between;
                          width: 90%;
                          margin-inline: auto;
                        "
                      >
                        <p class="descList">Total</p>
                        <p
                          class="descList"
                          style="display: inline; max-width: 50%; text-align: right"
                        >
                          {{
                            `Rp.${formatCurrency(+ticketsData.total + ticketsData.additionalFee)}`
                          }}
                        </p>
                      </div>
                      <section
                        class="separator"
                        style="margin-inline: auto; margin-top: 8px"
                      ></section>

                      <div style="width: 100%; margin: auto">
                        <p class="desc">www.keraton-kasepuhan.com</p>
                        <p class="desc">
                          *Tiket yang sudah dibeli tidak dapat ditukar atau dikembalikan<br />Berlaku
                          hanya pada tanggal yang tertera pada tiket ini
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="(ticket, index) in ticketsData.detailTrans"
            :key="index"
            style="width: fit-content; height: fit-content"
          >
            <div v-for="(itemName, number) in arrayTiket[index]" :key="number">
              <div id="tiket-potong" v-for="n in ticket.amount" :key="n">
                <section class="ticket">
                  <div style="display: block; width: 100%; justify-content: center">
                    <section
                      class="separator"
                      style="margin-inline: auto; margin-top: 8px"
                    ></section>
                    <div style="width: 100%; margin: auto" class="tiket-potong">
                      <div class="header">
                        <p class="text">Tiket Masuk {{ itemName }}</p>
                        <p class="text">
                          #{{ formatUniqeCode(ticketsData.createdDate, customerName) }}
                        </p>
                      </div>
                      <div class="body">
                        <img
                          id="qrImage"
                          :src="ticketsData.qrImage"
                          style="width: 100px; height: 100px"
                          alt="Keraton Kasepuhan Cirebon"
                        />
                        <div>
                          <p class="body-desc">
                            {{ customerName }}
                          </p>
                          <p class="body-desc">
                            {{ customerEmail }}
                          </p>
                          <p class="body-desc">
                            {{
                              ticketsData.createdDate ? formatDate(ticketsData.createdDate) : '0%'
                            }}
                          </p>
                          <h5
                            style="text-transform: uppercase; font-size: x-small; margin-top: 10px"
                          >
                            Enjoy The Tour!
                          </h5>
                        </div>
                      </div>
                    </div>
                    <section
                      class="separator"
                      style="margin-inline: auto; margin-top: 8px"
                    ></section>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      style="
        width: 100%;
        justify-content: center;
        display: flex;
        margin-top: 5rem;
        margin-bottom: 5rem;
        flex-direction: column;
        align-items: center;
      "
    >
      <p>Driver Printer ( Recomended IWARE IW-j82BT )</p>
      <a href="https://drive.google.com/file/d/1G2fwzPr9087BNZm9DNEttVANdH1AQGyT/view?usp=drive_link" target="_blank"> Android </a>
      <a href="https://drive.google.com/file/d/1LjcxpPEO1wjFGdVCRQEm2fNyHbqJMgY5/view?usp=drive_link" target="_blank"> Windows </a>
    </div>
  </div>
</template>
<style scoped>
.rotated-text {
  transform: rotate(90deg);
  text-align: center; /* Mengatur agar teks tetap berada di tengah */
  display: inline-block; /* Membuat elemen bisa dirotasi */
}

.generate-tickets__cta-container {
  width: 100%;
  padding: 1rem;
  flex-wrap: wrap;
}
.generate-tickets__return-btn {
  background-color: var(--color-primary);
  width: fit-content;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.generate-tickets__header {
  border-bottom: 1px solid black;
}

.generate-tickets__detail-transaction {
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.generate-tickets__detail-transaction-image {
  height: 70px;
  width: 100px;
}

.generate-tickets__detail-transaction-btn {
  padding: 0.5rem;
  background-color: var(--color-primary);
  border-radius: 0.25rem;
}

.generate-tickets__btn-print,
.generate-tickets__btn-email {
  min-width: 12rem;
  height: 5rem;
  border: 2px solid #e6be58;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.generate-tickets__btn-print:hover,
.generate-tickets__btn-email:hover {
  border-color: #ffdd8f;
}

.send-email__text-cooldown::after {
  content: '.';
  animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
  0% {
    content: '.';
  }

  33% {
    content: '..';
  }

  66% {
    content: '...';
  }
}

.send-email-overview__modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* ticket design new */
.ticket {
  width: 256px;
  height: fit-content;
}

.ticket h5 {
  font-size: x-small;
  padding: 5px;
  line-height: 1.5;
  font-weight: 600;
  text-align: center;
}

.tiket-potong .header .text {
  font-size: 10px;
  text-align: center;
  line-height: 1.5;
  text-transform: uppercase;
  font-weight: 600;
}

.tiket-potong .body {
  display: flex;
  margin-top: 5px;
}
.tiket-potong .body p {
  font-size: 10px;
  line-height: 1.5;
}

.ticket .desc {
  padding: 5px;
  font-size: x-small;
  width: 80%;
  margin: auto;
  line-height: 1.5;

  text-align: center;
}

.descList {
  font-size: small;
  padding: 5px;
  font-size: x-small;
  width: 100%;
  margin: auto;
  line-height: 1.5;
  text-align: left;
}

.separator {
  width: 90%;
  border-bottom: 2px dashed #000;
  margin: 5px 0;
}

@media print {
  .only-pdf {
    page-break-after: always;
    display: block !important;
  }
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-left-color: #000;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
