<template>
  <div style="width: 100%">
    <div class="add__alert-confirmation_overlay" v-if="confirmAlertUpload">
      <div class="settings_modal-container fee">
        <div
          style="display: flex; align-items: center; width: 100%; justify-content: space-between"
        >
          <h5 class="fw-600">Upload</h5>
          <ph-x class="cursor-pointer" :size="20" weight="bold" @click="showUpload()" />
        </div>
        <div style="width: 100%; min-height: 100px; padding: 10px">
          <div style="display: block; gap: 30px">
            <div class="dashboard__card-container" style="width: 100%">
              <button
                v-for="(label, dataRefIndex) in importJSONDatas?.dataReferences"
                :key="dataRefIndex"
                @click="selectDataReferenceBackup(label.dbName)"
                class="add__preview_button"
                :style="{
                  backgroundColor: currentDataReferenceBackup === label.dbName ? '#fef08a' : '',
                  color: currentDataReferenceBackup === label.dbName ? '#a16207' : ''
                }"
              >
                {{ label.dbName }}
              </button>
            </div>
            <div style="display: flex; margin-top: 50px; gap: 10px">
              <div style="width: 20%; margin-top: 50px">
                <div
                  class="drag-area"
                  @click="browseFile"
                  @dragover.prevent="dragOver"
                  @dragenter="dragEnter"
                  @dragleave="dragLeave"
                  :class="{ active: isDragOver }"
                >
                  <a class="browse__placeholder">
                    <div>
                      <PhFile :size="48" weight="regular" class="icon" />
                    </div>
                    <header>
                      {{ dragText }}
                    </header>
                    <input
                      ref="fileInput"
                      type="file"
                      name="file"
                      id="file"
                      @change="handleFileChange"
                      hidden
                    />
                  </a>
                </div>
                <div style="display: block; text-align: left; padding-top: 10px">
                  <div style="margin-top: 10px">
                    <p>Dibuat Tanggal:</p>
                    <p>{{ importJSONDatas?.createdAt || 'YYYY-MM-DD' }}</p>
                  </div>
                  <div style="margin-top: 10px">
                    <p>Dibuat Oleh :</p>
                    <p>{{ importJSONDatas?.createdBy || '---' }}</p>
                  </div>
                  <div style="margin-top: 10px">
                    <p>Platform:</p>
                    <p>{{ importJSONDatas?.creatorData }}</p>
                  </div>
                </div>
              </div>
              <div class="c_container">
                <table
                  v-if="importJSONDatas && tableImportDatas.row.length > 0"
                  class="dashboard__card-container2"
                >
                  <thead>
                    <tr>
                      <template v-for="(col, i) in tableImportDatas.column" :key="i">
                        <th v-if="isObject(col)" :key="i">
                          {{ col.label }}
                        </th>
                        <th v-else>
                          {{ col }}
                        </th>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, rowIndex) in tableImportDatas.row" :key="rowIndex">
                      <tr>
                        <td v-for="(colName, index) in tableImportDatas.column" :key="index">
                          <template v-if="isObject(row[colName])">
                            <input v-model="row[colName].value" />
                            <button @click="handleButtonClick(row, colName)">Submit</button>
                          </template>
                          <template v-else>
                            {{ row[colName] }}
                          </template>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
                <div v-else>Tidak ada data yang tersedia.</div>
              </div>
            </div>
          </div>

          <button
            v-if="jsonFile"
            class="add__preview_button"
            style="display: flex; align-items: center; gap: 2px; margin-top: 30px"
            type="submit"
            @click="confirmAlertBackup = true"
          >
            <PhUpload :size="18" />
            <div>Upload</div>
          </button>
        </div>
      </div>
    </div>
    <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
      <div class="add__alert-confirmation">
        <h5>Apakah anda akan membackup data sekarang?</h5>
        <div class="button-group">
          <button @click="confirmAlert = false">Cancel</button>
          <button @click="backupData()">Yes</button>
        </div>
      </div>
    </div>
    <div class="add__alert-confirmation_overlay" v-if="confirmAlertBackup">
      <div class="add__alert-confirmation">
        <h5>Apakah ada yakin menggunakan data {{ dragText }} untuk dibackup?</h5>
        <p>Peringatan bahwa jika ada kesalahan, maka transfer data akan diberhentikan</p>
        <div class="button-group">
          <button @click="confirmAlertBackup = false">Cancel</button>
          <button @click="backupDataToDB()">Yes</button>
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
        @click="selectDataReferences(label.dataRef, dataRefIndex, label.relationLoad)"
        class="add__preview_button"
        :style="{
          backgroundColor: label?.selected
            ? '#329873'
            : currentDataReference === label.dataRef
              ? '#fef08a'
              : '',
          color: label?.selected ? '#000' : currentDataReference === label.dataRef ? '#a16207' : ''
        }"
      >
        {{ label.label }}
      </button>
    </div>
    <div class="database-logs__content pd-right-1 sm-top-2 dashboard__card-container">
      <table class="tableContainer" v-if="tableDatas.row.length > 0">
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
      <button class="icons fab_add5" name="Select All" @click="selectAll()">
        <span class="material-symbols-outlined"> done_all </span>
      </button>
      <!-- <button
        class="icons fab_add4"
        name="Select"
        @click="addToSelectedBackup(currentDataReference)"
      >
        <span class="material-symbols-outlined"> check </span>
      </button> -->
      <button class="icons fab_add3" type="submit" @click="showConfirmation()" name="Download">
        <span class="material-symbols-outlined"> download_2 </span>
      </button>
      <button class="icons fab_add2" type="submit" @click="showUpload()" name="Upload">
        <span class="material-symbols-outlined"> upload_2 </span>
      </button>
      <button class="icons fab_add" @click="floating2" name="Sorting">
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
import LoginHelper from '@/utilities/LoginHelper'
const { getCookie } = LoginHelper
const { DB_BASE_URL, showLoader } = GlobalHelper
export default {
  data() {
    return {
      jsonChanges: ref(false),
      listOfDataReference: ref([]),
      listOfDataReferenceImport: ref([]),
      listOfSelectedReference: ref([]),
      selectedDataReferences: ref({}),
      isDragOver: false,
      guideSelectedImage: ref(),
      guideSelectedImageURL: ref(),
      dragText: ref('Drag & Drop to Upload File'),
      floatingdetail: ref(false),
      confirmAlertUpload: ref(false),
      currentBackups: ref({
        createdBy: '',
        createdAt: new Date().toISOString(),
        creatorData: window.navigator.userAgent
      }),
      confirmAlertBackup: ref(false),
      floating: ref(false),
      confirmAlert: ref(false),
      currentDataReference: ref(),
      selectedDataRefIndex: ref(),
      currentRelationshipLoad: ref(),
      currentDataReferenceBackup: ref(),
      tableDatas: {
        column: [],
        row: []
      },

      //JSON IMPORT PART
      jsonFile: ref(),
      importJSONDatas: ref(),
      tableImportDatas: ref({
        column: [],
        row: []
      })
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    isObject(value) {
      return typeof value === 'object' && value !== null
    },
    handleButtonClick(row, colName) {
      console.log('Button clicked for row:', row, 'column:', colName)
    },
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
          this.currentRelationshipLoad = this.listOfDataReference[0].relationshipLoad
        }
        if (this.currentDataReference) {
          const responseDataRef = await fetch(
            `${DB_BASE_URL.value}/keraton-pos/backup/get-dataref/${this.currentDataReference}`
          )
          if (!responseDataRef.ok) throw Error('Failed to fetch Data Reference')
          const responseData = await responseDataRef.json()
          this.tableDatas = this.formatToTableData(responseData.data)
        }
        showLoader.value = false
      } catch (err) {
        showLoader.value = false
        console.log(err)
      }
    },
    async selectAll() {
      try {
        const promises = this.listOfDataReference.map(async (data, i) => {
          await fetch(`${DB_BASE_URL.value}/keraton-pos/backup/get-dataref/${data.dataRef}`)
            .then(async (res) => {
              const responseData = await res.json()
              this.selectedDataReferences[data.dataRef] = {
                databaseReferenceTabel: data.dataRef,
                relationshipLoad: data.relationLoad,
                backupDatas: responseData.data
              }
              this.listOfDataReference[i].selected = true
            })
            .catch((err) => {
              console.log(err)
            })
        })
        await Promise.all(promises)
      } catch (err) {
        console.log(err)
      }
    },
    addToSelectedBackup(dataName) {
      this.listOfDataReference[this.selectedDataRefIndex || 0].selected = true
      this.selectedDataReferences[dataName] = {
        databaseReferenceTabel: dataName,
        relationshipLoad: this.currentRelationshipLoad,
        backupDatas: this.tableDatas.row
      }
      console.log(this.selectedDataReferences)
    },
    selectDataReferences(dataName, dataRefIndex, relationshipLoad) {
      this.selectedDataRefIndex = dataRefIndex
      this.currentDataReference = dataName
      this.currentRelationshipLoad = relationshipLoad
      this.fetchData()
    },
    selectDataReferenceBackup(label) {
      this.currentDataReferenceBackup = label
      const rawData = this.importJSONDatas.backups[label].backupDatas
      console.log(rawData)
      this.tableImportDatas.column = Object.keys(rawData[0])
      this.tableImportDatas.row = rawData
    },
    formatToListDataRef(arrayDatas) {
      return arrayDatas.map((item) => ({
        label: item.name,
        relationLoad: item.relationships,
        dataRef: item.name.charAt(0).toLowerCase() + item.name.slice(1)
      }))
    },
    formatToTableData(arrayDatas) {
      if (!arrayDatas || arrayDatas.length < 1) return { column: [], row: [] }
      const firstReferenceData = arrayDatas[0]
      if (!firstReferenceData) throw new Error('No Data to process')
      const column = Object.keys(firstReferenceData)
      return { column, row: arrayDatas }
    },
    async backupDataToDB() {
      try {
        if (!this.jsonFile) throw Error('Please specify the JSON file')
        const formData = new FormData()
        formData.append('jsonFile', this.jsonFile)
        const response = await fetch(`${DB_BASE_URL.value}/keraton-pos/backup/backup-data`, {
          method: 'POST',
          body: formData,
          headers: {
            token: getCookie('token')
          }
        })
        if (!response.ok) throw Error('Failed to backup data')
        this.confirmAlertBackup = false
        this.confirmAlertUpload = false
        this.fetchData()
      } catch (err) {
        console.log(err)
      }
    },
    backupData() {
      this.currentBackups.dataReferences = Object.values(this.selectedDataReferences).map(
        (data) => ({
          dbName: data.databaseReferenceTabel,
          load: data.relationshipLoad
        })
      )
      this.currentBackups.backups = this.selectedDataReferences
      const blob = new Blob([JSON.stringify(this.currentBackups)], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `BACKUP-KERATON | ${new Date().toISOString()}.json`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.confirmAlert = false
      this.listOfSelectedReference = []
      this.selectedDataReferences = {}
    },
    navigateToSettings() {
      this.$router.push('/settings')
    },
    showConfirmation() {
      this.confirmAlert = !this.confirmAlert
    },
    showUpload() {
      this.confirmAlertUpload = !this.confirmAlertUpload
    },
    action() {
      this.floating = !this.floating
    },
    floating2() {
      this.floatingdetail = !this.floatingdetail
    },
    browseFile() {
      this.$refs.fileInput.click()
    },
    dragEnter() {
      this.isDragOver = true
      this.dragText = 'Drop to Upload File'
    },
    dragLeave() {
      this.isDragOver = false
      this.dragText = 'Drag & Drop to Upload File'
    },
    dragOver() {
      this.isDragOver = true
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file && file.type != 'application/json') throw Error('Please upload a json file')
      this.dragText = file.name
      this.jsonFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const rawJSONData = JSON.parse(e.target.result)
          const firstDataRef = rawJSONData.dataReferences[0].dbName
          this.currentDataReferenceBackup = firstDataRef
          this.tableImportDatas.column = Object.keys(
            rawJSONData.backups[firstDataRef].backupDatas[0]
          )
          this.tableImportDatas.row = rawJSONData.backups[firstDataRef].backupDatas
          this.importJSONDatas = rawJSONData
        } catch (error) {
          return console.log(error)
        }
      }
      reader.readAsText(file)
    },
    changeProperties(newPropName, oldPropName, refName) {
      if (newPropName === oldPropName) {
        if (this.importJSONDatas.backups[refName]) throw 'no reference data'
        const referenceData = this.importJSONDatas.backups[refName].backupDatas.map((backup) => {
          if (!backup.Data) throw 'No properties name'
          return { ...backup, [newPropName]: backupData }
        })
        this.importJSONDatas.backup[refName].backupDatas = referenceData
        tihs.jsonChanges = true
      }
    },
    changeValue(value, propName, refName, refIndex) {
      this.importJSONDatas.backup[refName].backupDatas[refIndex][propName] = value
      tihs.jsonChanges = true
    }
  }
}
</script>

<style scoped>
.icons:hover::after {
  content: attr(name);
  position: absolute;
  left: 20%;
  transform: translateX(-140%);
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

.a_container {
  display: flex;
  margin-top: 10px;
  gap: 10px;
}

.b_container {
  width: 20%;
  margin-top: 40px;
}

.c_container {
  width: 80%;
  overflow-x: auto;
  padding: 20px;
  overflow-y: auto;
  height: 500px;
  margin: 30px;
}

@media (max-width: 768px) {
  .a_container {
    display: block;
  }

  .b_container {
    width: 100%;
  }

  .c_container {
    width: 100%;
    margin: 10px;
  }
}

.dashboard__card-container2,
.containerwrap {
  -ms-overflow-style: none;
  white-space: nowrap;
  padding: 0.5rem;
  width: 100%;
  overflow-x: auto;
  gap: 1rem;
  flex: 1;
}

.dashboard__card-container2 {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) lightgrey;
}

.dashboard__card-container2.expanded {
  overflow-x: scroll;
  overflow-y: scroll;
}

.tableImport,
.containerwrap .dashboard__card-container2::-webkit-scrollbar {
  height: 6px;
}

.tableImport,
.containerwrap .dashboard__card-container2::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}

.input-image-preview {
  position: relative;
}

.image-preview-label {
  margin-bottom: 0.5rem;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.2);
}

.drag-area {
  border: 2px dashed #000000;
  height: 193px;
  width: 100%;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.drag-area.active {
  border: 2px dashed #000000;
  background-color: #eaeaea;
}

.drag-area header {
  overflow: hidden;
  width: 90%;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
  color: #000000;
}

.drag-area span {
  font-size: 15px;
  font-weight: 500;
  color: #000000;
  margin: 10px 0 15px 0;
}

.drag-area button {
  padding: 10px 25px;
  font-size: 20px;
  font-weight: 500;
  border: none;
  outline: none;
  background: #ffffff;
  border: 1px dotted #000000;
  color: #000000;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.5s;
}

.drag-area button:hover {
  background: rgb(228, 220, 220);
}

.drag-area img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 5px;
}

a.browse__placeholder {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.settings_modal-container {
  position: fixed;
  padding: 50px;
  top: 5%;
  left: 50%;
  transform: translate(-50%);
  background-color: #ffffff;
  border-radius: 0.5rem;
}

.settings_modal-container.fee {
  width: 90%;
  height: 90%;
  padding: 2rem;
}

.containerwrap {
  overflow-y: auto;
  width: 100%;
  height: 100%;
}

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

.fab_add5 {
  position: fixed;
  bottom: 370px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #7105d7;
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

.fab_add {
  position: fixed;
  bottom: 160px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #05d79b;
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

.fab_add4 {
  position: fixed;
  bottom: 300px;
  right: 35px;
  width: 56px;
  height: 56px;
  background-color: #0fd705;
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
  background-color: #0586d7;
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
  background-color: #d76005;
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

.tableImport {
  -ms-overflow-style: none;
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

.tableImport,
.dashboard__card-container::-webkit-scrollbar {
  height: 6px;
}

.tableImport,
.dashboard__card-container::-webkit-scrollbar-track {
  background-color: lightgrey;
  border-radius: 2px;
}

.tableImport,
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

.tableContainer {
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
