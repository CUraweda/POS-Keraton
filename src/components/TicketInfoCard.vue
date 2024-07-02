<script setup>
import 'swiper/swiper-bundle.css'
import { onMounted, ref } from 'vue'
import { Virtual, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import ReportHelper from '@/utilities/ReportHelper'
import GlobalHelper from '@/utilities/GlobalHelper'

// const getSlidesView = () => {
//   const length = orderInfoCardData.value.length
//   if (length > 3) return 3
//   else return length
// }
</script>

<template>
  <Swiper
    :modules="[Virtual, Pagination, Navigation]"
    :space-between="10"
    :slides-per-view="cardLength"
    pagination
    navigation
    virtual
  >
    <SwiperSlide v-for="(item, index) in infoCardDatas" :key="index">
      <div class="ticket-info-card__container flex fd-col pd-1" v-if="statusTransaksi">
        <p class="ticket-info-card__title">{{ item.name }}</p>
        <span class="ticket-info-card__details align-self-center">{{ item.sum }}</span>
        <p class="ticket-info-card__desc align-self-f-end">/ tiket</p>
      </div>

      <div v-else>Tidak Ada Transaksi</div>
    </SwiperSlide>
  </Swiper>
</template>

<script>
import { ref } from 'vue'
import GlobalHelper from '@/utilities/GlobalHelper'

const { DB_BASE_URL, DETAILTRANS_BASE_URL } = GlobalHelper

export default {
  data() {
    return {
      infoCardDatas: [],
      cardLength: 0,
      statusTransaksi: false
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch(
          `${DB_BASE_URL.value}/${DETAILTRANS_BASE_URL.value}/category-sell`
        )
        if (!response.ok) throw new Error('Gagal mem-fetch Data')
        const responseData = await response.json()
        this.infoCardDatas = this.formatToInfoCard(responseData.data)
        this.cardLength = this.infoCardDatas.length
        this.handleCard()
      } catch (err) {
        console.log(err)
      }
    },
    formatToInfoCard(datas) {
      let infoCardData = {}
      for (let data of datas) {
        const categoryName = data.order.category.name
        if (!infoCardData[categoryName])
          infoCardData[categoryName] = {
            name: categoryName,
            sum: 0
          }
        infoCardData[categoryName].sum += data.amount
      }
      return Object.values(infoCardData)
    },
    handleCard() {
      this.statusTransaksi = this.infoCardDatas.length > 0
    }
  }
}
</script>

<style scoped>
p,
span {
  cursor: default;
}

.ticket-info-card__container {
  height: 186px;
  background: linear-gradient(to bottom, rgba(255, 226, 154, 0.9), rgba(254, 209, 96, 0.9));
  border-radius: 15px;
}

.ticket-info-card__title {
  font-size: 12px;
  line-height: 18px;
  width: fit-content;
  padding: 0 8px;
  border-radius: 5px;
  background-color: rgba(254, 209, 96, 1);
  mix-blend-mode: luminosity;
}

.ticket-info-card__details {
  font-size: 96px;
  font-weight: 500;
  line-height: 128px;
}

.ticket-info-card__desc {
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  position: relative;
  bottom: 20px;
}
</style>
