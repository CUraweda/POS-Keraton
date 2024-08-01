<template>
  <div>
    <div class="ticket-info-card">
      <div v-if="statusTransaksi">
        <button @click="scrollLeft" class="scroll-left">
          <span class="material-symbols-outlined"> arrow_back_ios </span>
        </button>
        <div
          v-if="statusTransaksi"
          class="ticket-info-card__wrapper"
          ref="cardWrapper"
          style="position: relative; overflow-x: scroll; padding-inline: auto"
        >
          <div v-for="(item, index) in infoCardDatas" :key="index">
            <div class="ticket-info-card__container fd-col pd-1">
              <p class="ticket-info-card__title">{{ item.name }}</p>
              <span class="ticket-info-card__details align-self-center">{{ item.sum }}</span>
              <p class="ticket-info-card__desc align-self-f-end">/ tiket</p>
            </div>
          </div>
        </div>
        <button @click="scrollRight" class="scroll-right">
          <span class="material-symbols-outlined"> arrow_forward_ios </span>
        </button>
      </div>
      <div v-else style="margin-inline: 3rem; width: 30rem">Tidak Ada Transaksi</div>
    </div>
  </div>
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
      statusTransaksi: ref(false)
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

        // this.statusTransaksi.value = this.cardLength > 0
        handleCard()
      } catch (err) {
        console.log(err)
      }
    },
    formatToInfoCard(datas) {
      let infoCardData = {}
      for (let data of datas) {
        const categoryName = data.order ? data.order.category.name : 'Event'
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
      console.log(this.statusTransaksi)
    },
    scrollLeft() {
      this.$refs.cardWrapper.scrollLeft -= 250 // Sesuaikan nilai dengan lebar card
    },
    scrollRight() {
      this.$refs.cardWrapper.scrollLeft += 250 // Sesuaikan nilai dengan lebar card
    }
  }
}
</script>

<style scoped>
p,
span {
  cursor: default;
}
/* .ticket-info-card__wrapper {
  display: flex;
  overflow-x: scroll;
  -ms-overflow-style: none;
  width: 250px;
} */

.ticket-info-card__wrapper::-webkit-scrollbar {
  height: 6px;
}

.ticket-info-card__wrapper::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}
.ticket-info-card__container {
  margin: 10px;
  padding-inline: 20px;
  width: 220px;
  height: 186px;
  display: flex;
  background: linear-gradient(to bottom, rgba(255, 226, 154, 0.9), rgba(254, 209, 96, 0.9));
  border-radius: 15px;
}
.scroll-left {
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 10px;
  cursor: pointer;
}
.scroll-right {
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 10px;
  cursor: pointer;
}
@media screen and (max-width: 1087px) {
  .ticket-info-card {
    display: block;
  }
  .scroll-left {
    display: none;
  }

  .scroll-right {
    display: none;
  }
  .ticket-info-card__wrapper {
    display: block;
    overflow-x: unset;
  }
  .ticket-info-card__container {
    display: block;
    text-align: center;
    width: 100%;
    margin: 0 0 10px 0;
  }
}

@media screen and (min-width: 1900px) {
  .ticket-info-card {
    display: flex;
  }
  .ticket-info-card__wrapper {
    padding-inline: auto;
    width: 45rem;
    display: flex;
    overflow-x: scroll;
    -ms-overflow-style: none;
  }
}

@media (min-width: 1087px) and (max-width: 1899px) {
  .ticket-info-card {
    display: flex;
  }
  .ticket-info-card__wrapper {
    width: 30rem;
    display: flex;
    overflow-x: scroll;
    -ms-overflow-style: none;
  }
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
