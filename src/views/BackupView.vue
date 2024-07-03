<template>
  <div style="width: 100%">
    <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
      <div class="add__alert-confirmation">
        <h5>Apakah anda akan membackup data sekarang?</h5>
        <div class="button-group">
          <button @click="confirmAlert = false">Cancel</button>
          <button @click="backupData()">Yes</button>
        </div>
      </div>
    </div>
    <div style="display: flex; width: 98%; justify-content: space-between; overflow-x: auto">
      <div
        class="breadcrumb flex align-items-center gap[0.5] cursor-pointer"
        @click="navigateToSettings()"
      >
        <ph-caret-left size="24" weight="bold" />
        <p>Kembali</p>
      </div>

      <div></div>
    </div>
    <h5 class="fw-600 sm-top-1"></h5>
    <div class="dashboard__card-container" style="width: 98%">
      <button
        v-for="(label, dataRefIndex) in listOfDataReference"
        :key="dataRefIndex"
        @click="selectDataReferences(label.dataRef)"
        class="add__preview_button"
        :style="{
          backgroundColor: currentDataReference === label.dataRef ? '#fef08a' : '',
          color: currentDataReference === label.dataRef ? '#a16207' : ''
        }"
      >
        {{ label.label }}
      </button>
    </div>
    <div class="database-logs__content pd-right-1 sm-top-2 dashboard__card-container">
      <table v-if="tableDatas.row.length > 0">
        <thead>
          <th v-for="(col, i) in tableDatas.column" :key="i">{{ col }}</th>
        </thead>
        <tbody>
          <template v-for="(row, rowIndex) in tableDatas.row" :key="rowIndex">
            <tr>
              <td v-for="(colName, index) in tableDatas.column" :key="index">{{ row[colName] }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-else>Data tidak ditemukan</div>
    </div>
    <button class="fab" @click="action">
      <span class="material-symbols-outlined"> folder_open </span>
    </button>
    <div v-if="floating">
      <button class="fab_add" @click="addToSelectedBackup(currentDataReference)">
        <span class="material-symbols-outlined"> upload_2 </span>
      </button>
      <button class="fab_add3" type="submit" @click="showConfirmation()">
        <span class="material-symbols-outlined"> download_2 </span>
      </button>
      <button class="fab_add2" @click="floating2">
        <span class="material-symbols-outlined"> sort </span>
      </button>

      <div v-if="floatingdetail" class="fab_detail">
        <div style="display: block; white-space: wrap">
          <button
            v-for="(label, dataRefIndex) in listOfDataReference"
            :key="dataRefIndex"
            @click="selectDataReferences(label.dataRef)"
            class="add__preview_button_float wrap"
            :style="{
              backgroundColor: currentDataReference === label.dataRef ? '#fef08a' : '',
              color: currentDataReference === label.dataRef ? '#a16207' : ''
            }"
          >
            {{ label.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import { useRouter } from 'vue-router'
const { DB_BASE_URL, showLoader } = GlobalHelper
const router = useRouter()
export default {
  data() {
    return {
      listOfDataReference: ref([]),
      selectedDataReferences: ref({}),
      floatingdetail: ref(false),
      currentBackups: ref({
        createdBy: '',
        createdAt: new Date().toISOString(),
        creatorData: window.navigator.userAgent
      }),
      floating: ref(false),
      confirmAlert: ref(false),
      currentDataReference: ref(),
      tableDatas: {
        column: [],
        row: []
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      showLoader.value = true
      try {
        if (this.listOfDataReference.length < 1) {
          const responseListDataRef = await fetch(
            `${DB_BASE_URL.value}/keraton-pos/backup/get-dataref`
          )
          if (!responseListDataRef.ok) throw Error('Failed to fetch list Data Reference')
          const responseData = await responseListDataRef.json()
          this.listOfDataReference = this.formatToListDataRef(responseData.data)
          this.currentDataReference = this.listOfDataReference[0].dataRef
        }
        if (this.currentDataReference) {
          const responseDataRef = await fetch(
            `${DB_BASE_URL.value}/keraton-pos/backup/get-dataref/${this.currentDataReference}`
          )
          if (!responseDataRef.ok) throw Error('Failed to fetch Data Reference')
          const responseData = await responseDataRef.json()
          if (responseData.data.length < 1) throw Error('No Data in this data reference')
          this.tableDatas = this.formatToTableData(responseData.data)
        }
        showLoader.value = false
      } catch (err) {
        showLoader.value = false
        console.log(err)
      }
    },
    addToSelectedBackup(dataName) {
      console.log(dataName)
      this.selectedDataReferences[dataName] = {
        databaseReferenceTabel: dataName,
        backupDatas: this.tableDatas.row
      }
    },
    selectDataReferences(dataName) {
      this.currentDataReference = dataName
      this.fetchData()
    },
    formatToListDataRef(arrayDatas) {
      return arrayDatas.map((item) => ({
        label: item,
        dataRef: item.charAt(0).toLowerCase() + item.slice(1)
      }))
    },
    formatToTableData(arrayDatas) {
      const firstReferenceData = arrayDatas[0]
      if (!firstReferenceData) throw new Error('No Data to process')
      const column = Object.keys(firstReferenceData)
      return { column, row: arrayDatas }
    },
    backupData() {
      const blob = new Blob([this.currentBackups], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = 'data.json'

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    showConfirmation() {
      this.confirmAlert = !this.confirmAlert
    },
    action() {
      this.floating = !this.floating
    },
    floating2() {
      this.floatingdetail = !this.floatingdetail
    },
    navigateToSettings() {
      this.$router.push('/settings')
    }
  }
}
</script>

<style scoped>
.wrap {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  color: rgb(61, 61, 61);
}
.fab_detail::-webkit-scrollbar {
  width: 8px;
}
.fab_detail::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}
.fab_detail::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.201);
}
.fab_add {
  position: fixed;
  bottom: 160px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #d7b405;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}

.fab_add3 {
  position: fixed;
  bottom: 230px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #d7b405;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}
.fab_add2 {
  position: fixed;
  bottom: 90px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #d7b405;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}
.fab_detail {
  position: fixed;
  bottom: 100px;
  right: 100px;
  width: 300px;
  overflow-y: scroll;
  height: 52vh;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.207);
  display: block;
  padding: 5px;
  background-color: #fffffff1;
  border-radius: 2%;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  border: none;
  cursor: pointer;
}
.fab {
  position: fixed;
  bottom: 20px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #d7b405;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}

.fab:hover {
  background-color: #e2cb5a;
}

.fab-icon {
  font-weight: bold;
}

.dashboard__card-container {
  -ms-overflow-style: none;
  white-space: nowrap;
  padding: 0.5rem;
  width: 100%;
  overflow-x: auto;
  gap: 1rem;
  flex: 1;
}
.dashboard__card-container.expanded {
  overflow-x: scroll;
}
.dashboard__card-container::-webkit-scrollbar {
  height: 6px;
}
.dashboard__card-container::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}
.dashboard__card-container::-webkit-scrollbar-thumb {
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.add__alert-confirmation_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background-color: rgb(0, 0, 0, 0.2);
  z-index: 9999;
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

.add__preview_button_float {
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 0;
  font-size: 18px;
  line-height: 28px;
  box-shadow: #000;
  /* background-color: #d9d9d9; */
}

.add__preview_button {
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 0;
  margin-inline: 5px;
  font-size: 18px;
  line-height: 28px;
  box-shadow: #000;
  background-color: #d9d9d9;
}

.database-logs__content_cta-search,
.action-filter__cta {
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  border-radius: 0.5rem;
}

.database-logs__content_cta-search {
  width: 2rem;
}

.action-filter__input-dropdown {
  position: relative;
  height: 2rem;
  width: 15rem;
  border-radius: 0.5rem;
  border: 1px solid black;
  cursor: pointer;
}
.database-logs__content {
  width: 98%;
  padding: 0.6rem;
  overflow-x: auto;
}
.action-filter__input-dropdown input {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: transparent;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

.arrow-icon {
  transition: all 300ms ease;
}

.arrow-icon.active {
  transform: rotate(180deg);
}

.action-filter__input-dropdown_menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: white;
  border-radius: 0.5rem;
  display: none;
  overflow: hidden;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.2);
  z-index: 200;
}

.action-filter__input-dropdown_menu.active {
  display: block;
}

.action-filter__input-dropdown_menu p {
  padding: 0.3rem 0.6rem;
}

.action-filter__input-dropdown_menu p:hover {
  background-color: rgb(233, 233, 233);
}

.action-filter__input-dropdown_menu p:hover:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.action-filter__input-dropdown_menu p:hover:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

table {
  border-collapse: collapse;
  outline: 0;
  margin-top: 1rem;
  width: 100%;
  box-shadow: 1px 5px 10px 1px #0000012c;
  border-radius: 0.5rem;

  /* border-top-left-radius: 0.5rem;
border-top-right-radius: 0.5rem;  */
  padding: 1rem;
}

thead {
  border-bottom: 1px solid #000;
}

th {
  height: 3rem;
  font-weight: 600;
}

th:nth-child(3) {
  text-align: start;
  padding: 0 1rem;
}

tr {
  max-height: 2rem;
}

td {
  max-height: 1.5rem;
  height: 1.5rem;
  text-align: center;
  max-width: 15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1rem;
  font-size: clamp(10px, 1vw, 14px);
}

td:nth-child(3) {
  text-align: start;
}

td:nth-child(1) {
  max-width: 10rem;
}

td:nth-child(5) {
  max-width: 4.5rem;
}

td:hover:nth-child(1),
td:hover:nth-child(3) {
  position: relative;
  overflow: visible;
  white-space: normal;
}

td:hover:nth-child(3) {
  padding: 0 1rem;
}

.logdata-status span {
  font-weight: 600;
  text-align: center;
  display: flex;
  justify-content: center;
  align-self: center;
}

.status-success {
  color: #1d8335;
  background-color: #36d65b7a;
  border-radius: 1rem;
  padding-inline: 4px;
}

.status-failed {
  color: #831d1d;
  background-color: #d636367a;
  border-radius: 1rem;
  padding-inline: 4px;
}

.pagination-container {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pagination-container button {
  width: 2.5rem;
  height: 2.5rem;
  box-shadow: 1px 5px 10px 1px #0000012c;
  border-radius: 0.5rem;
}

.pagination-container button.active {
  background-color: var(--color-primary);
  color: white;
}

.pagination-button.invisible {
  visibility: hidden;
}

.pagination-container button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}
</style>
