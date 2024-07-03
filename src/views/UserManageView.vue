<template>
  <div>
    <button @click="showDialog = true">Open Dialog yahhh</button>

    <div class="database-logs__content pd-right-1 sm-top-2">
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
            <td>Detail</td>
          </tr>
        </tbody>
      </table>

      <!-- Primary Dialog -->
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
      </transition>

      <!-- Secondary Dialog -->
      <transition name="dialog-fade">
        <div v-if="showCategoryDialog" class="secondary-dialog">
          <div class="card" style="width: 40rem">
            <div style="display: flex; align-items: center; justify-content: space-between">
              <h5>Set Category</h5>
              <ph-x
                :size="30"
                color="var(--color-primary)"
                @click="closeCategoryDialog"
                style="cursor: pointer"
              />
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem">
              <div>
                <img src="../assets/images/bg-keraton.png" style="width: 10rem; height: 12rem" />
                <h6 style="margin-top: 1rem">Nadif</h6>
                <h6 style="margin-top: 1rem">NadifGaming@gmail.com</h6>
              </div>

              <div>
                <div>
                  <h6>Shown Category:</h6>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      flex-wrap: wrap;
                      margin-top: 0.1rem;
                    "
                  >
                    <div
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 1rem;
                      "
                    >
                      Test
                    </div>
                    <div
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 1rem;
                      "
                    >
                      Test
                    </div>
                    <div
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 1rem;
                      "
                    >
                      Test
                    </div>
                    <div
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 1rem;
                      "
                    >
                      Test
                    </div>
                    <div
                      style="
                        background: #ffd978;
                        color: black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 1rem;
                      "
                    >
                      Test
                    </div>
                  </div>
                </div>

                <div
                  class="w-full"
                  style="
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
                  >
                    <span style="margin-right: 0.5rem">Umum</span>
                    <input type="checkbox" />
                  </label>

                  <label
                    style="display: flex; align-items: center; justify-content: space-between"
                    class="w-full"
                  >
                    <span style="margin-right: 0.5rem">Mancanegara</span>
                    <input type="checkbox" />
                  </label>

                  <label
                    style="display: flex; align-items: center; justify-content: space-between"
                    class="w-full"
                  >
                    <span style="margin-right: 0.5rem">Suvenir</span>
                    <input type="checkbox" />
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

const { DB_BASE_URL } = GlobalHelper

export default {
  data() {
    return {
      showDialog: ref(false),
      showCategoryDialog: ref(false),
      userData: [],
      selectedUser: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const url = `${DB_BASE_URL.value}/keraton/user`
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        this.userData = response.data.data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    openUserDialog(user) {
      this.selectedUser = user
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
      this.showCategoryDialog = false
    },
    openCategoryDialog() {
      this.showCategoryDialog = true
    },
    closeCategoryDialog() {
      this.showCategoryDialog = false
    }
  }
}
</script>

<style scoped>
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
</style>
