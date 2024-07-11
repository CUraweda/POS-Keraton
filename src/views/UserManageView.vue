<template>
  <div class="container">
    <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
      <div class="add__alert-confirmation">
        <h5>Apakah anda ingin merubah kategori ini?</h5>
        <div class="button-group">
          <button @click="confirmAlert = false">Cancel</button>
          <button @click="updateCategory()">Yes</button>
        </div>
      </div>
    </div>
    <div
      class="breadcrumb flex align-items-center gap[0.5] cursor-pointer"
      @click="navigateToSettings()"
    >
      <ph-caret-left size="24" weight="bold" />
      <p>Kembali</p>
    </div>
    <div class="c_container pd-right-1 sm-top-2">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userData" :key="user.id" @click="openUserDialog(user)">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button
                @click="openCategoryDialog(user)"
                style="
                  background: #ffd978;
                  color: black;
                  padding: 0.5rem 1rem;
                  border-radius: 1rem;
                  margin-top: 1rem;
                "
              >
                Set Category
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Primary Dialog
      <transition name="dialog-fade">
        <div v-if="showDialog" class="dialog">
          <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between">
              <h5>List User</h5>
              <ph-x
                :size="30"
                color="var(--color-primary)"
                @click="closeDialog"
                style="cursor: pointer"
              />
            </div>
            <div style="margin-top: 1rem">
              <div class="user-card">
                <div class="user-info">
                  <p>Nadif</p>
                </div>
                <button @click="openCategoryDialog" class="set-category-btn">Set Category</button>
              </div>
            </div>
          </div>
        </div>
      </transition> -->

      <!-- Secondary Dialog -->
      <transition name="dialog-fade">
        <div v-if="showCategoryDialog" class="secondary-dialog">
          <div class="card" style="width: fit-content; height: fit-content">
            <div style="display: flex; align-items: center; justify-content: space-between">
              <h6>Set Category</h6>
              <ph-x
                :size="30"
                color="var(--color-primary)"
                @click="closeCategoryDialog"
                style="cursor: pointer"
              />
            </div>
            <div style="display: flex; margin-top: 0.5rem; gap: 5rem">
              <div>
                <img
                  src="../assets/images/bg-keraton.png"
                  style="width: 10rem; height: 12rem; border-radius: 0.2rem"
                />
                <div style="display: flex; flex-direction: column; height: 100%">
                  <div>
                    <div style="margin-top: 1rem">{{ selectedUser.name }}</div>
                    <div style="margin-top: 1rem">{{ selectedUser.email }}</div>
                  </div>

                  <button
                    @click="setconfirm"
                    style="
                      background: #ffd978;
                      color: black;
                      padding: 0.5rem 1rem;
                      border-radius: 1rem;
                      margin-top: 1rem;
                    "
                  >
                    Update
                  </button>
                </div>
              </div>

              <div>
                <div>
                  <h6>Shown Category:</h6>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      width: 15rem;
                      flex-wrap: wrap;
                      margin-top: 0.3rem;
                    "
                  >
                    <div
                      v-for="(selectedData, i) in selectedUser.shownCategory.id"
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.5rem 1rem;
                        border-radius: 0.4rem;
                      "
                      :key="i"
                    >
                      {{ selectedData }}
                    </div>
                  </div>
                </div>

                <div
                  style="
                    width: 15rem;
                    background: white;
                    margin-top: 1rem;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                  "
                >
                  <label
                    style="display: flex; align-items: center; justify-content: space-between"
                    class="w-full"
                    v-for="(category, i) in categoryDatas"
                    :key="i"
                  >
                    <span style="margin-right: 0.5rem">{{ category.name }}</span>
                    <input
                      type="checkbox"
                      :value="category.id"
                      v-model="selectedUser.shownCategory.id"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import GlobalHelper from '@/utilities/GlobalHelper'
import LoginHelper from '@/utilities/LoginHelper'

const { getCookie } = LoginHelper
const { DB_BASE_URL, USER_BASE_URL, CATEGORY_BASE_URL, assignAlert } = GlobalHelper

export default {
  data() {
    return {
      confirmAlert: ref(false),
      showDialog: ref(false),
      showCategoryDialog: ref(false),
      userData: [],
      categoryDatas: [],
      selectedUser: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const categoryResponse = await fetch(
          `${DB_BASE_URL.value}/${CATEGORY_BASE_URL.value}/category-details`
        )
        const response = await fetch(`${DB_BASE_URL.value}/${USER_BASE_URL.value}/get-user-data`, {
          headers: {
            Authorization: getCookie('token')
          }
        })
        if (!response.ok) throw Error('Failed to fetch data')
        if (!categoryResponse.ok) throw Error('Failed to fetch Category data')
        const categoryData = await categoryResponse.json()
        const responseData = await response.json()
        this.userData = responseData.data.map((data) => ({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          shownCategory: {
            id: data.shownCategory?.id || []
          }
        }))
        this.categoryDatas = categoryData.data
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    async updateUser(body) {
      try {
        const { id } = this.selectedUser
        if (!id) throw Error('Id didnt exist, please send id')
        const response = await fetch(
          `${DB_BASE_URL.value}/${USER_BASE_URL.value}/update-user-data/${id}`,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              Authorization: getCookie('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        if (!response.ok) throw Error('Gagal mengupdate data')

        this.fetchData()
        this.confirmAlert = !this.confirmAlert
        this.showCategoryDialog = false
        assignAlert(true, 'Sukses', 'success', `Berhasil mengubah data user`)
      } catch (err) {
        assignAlert(true, 'Error', 'danger', `Gagal mengubah data user: ${err.message}`)
        console.log(err)
      }
    },
    setconfirm() {
      this.confirmAlert = !this.confirmAlert
    },
    navigateToSettings() {
      this.$router.push('/settings')
    },
    updateCategory() {
      const shownCategory = this.selectedUser.shownCategory
      this.updateUser({ shownCategory })
    },
    openUserDialog(user) {
      this.selectedUser = user
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
      this.showCategoryDialog = false
      this.fetchData()
    },
    openCategoryDialog(userData) {
      let userCopyData = userData
      this.selectedUser = userCopyData
      this.showCategoryDialog = true
    },
    closeCategoryDialog() {
      this.showCategoryDialog = false
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.container {
  margin-left: 8rem;
}

@media screen and (max-width: 700px) {
  .container {
    margin-left: 1rem;
  }
}

.c_container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
}

.dialog {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.secondary-dialog {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.card {
  background: white;
  padding: 20px;
  width: fit-content;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-out;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter,
.dialog-fade-leave-to {
  opacity: 0;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px 10px;
}

.user-info {
  flex-grow: 1;
  width: 15rem;
}

.set-category-btn {
  background-color: var(--color-primary);
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

table {
  border-collapse: collapse;
  outline: 0;
  margin-top: 1rem;
  width: 100%;
  box-shadow: 1px 5px 10px 1px #0000012c;
  border-radius: 0.5rem;
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
</style>
