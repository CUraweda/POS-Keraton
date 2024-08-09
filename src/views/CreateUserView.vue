<template>
  <div class="container">
    <div class="table-header">
      <button class="add-user-btn" @click="showModal = true">
        <i class="fas fa-plus"></i> Add User
      </button>
    </div>
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
        <tr v-for="user in users" :key="user.id" @click="openUserDialog(user)">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td
            style="
              display: flex;
              align-items: center;
              gap: 1rem;
              justify-content: center;
              padding: 1rem;
            "
          >
            <button class="edit-btn" @click="editUser(user)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="green"
              >
                <path
                  d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                />
              </svg>
            </button>
            <button class="delete-btn" @click="deleteUser(user.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="red"
              >
                <path
                  d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
                />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
        <h2>{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
        <form @submit.prevent="isEdit ? updateUser() : addUser()">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" v-model="form.password" required />
          </div>
          <div class="form-group">
            <label for="role">Role:</label>
            <select v-model="form.role" required>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <button type="submit" class="submit-btn">{{ isEdit ? 'Update' : 'Add' }}</button>
        </form>
      </div>
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
      users: ref([]),
      showModal: false,
      isEdit: false,
      form: {
        id: null,
        name: '',
        email: '',
        password: '',
        role: 'admin'
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch(`${DB_BASE_URL}/${USER_BASE_URL}`, {
          headers: {
            Authorization: getCookie('token')
          }
        })
        const responseData = await response.json()
        this.users = responseData.data.map((data) => ({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        }))
        console.log(this.users)
      } catch (error) {
        console.error(error)
      }
    },
    async addUser() {
      const dataPost = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        role: this.form.role
      }
      try {
        const response = await fetch(`${DB_BASE_URL}/${USER_BASE_URL}`, {
          method: 'POST',
          body: JSON.stringify(dataPost),
          headers: {
            Authorization: getCookie('token'),
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    editUser(user) {
      this.form = { ...user }
      this.isEdit = true
      this.showModal = true
    },
    updateUser() {
      const index = this.users.findIndex((user) => user.id === this.form.id)
      if (index !== -1) {
        this.users.splice(index, 1, this.form)
      }
      this.resetForm()
      this.showModal = false
    },
    deleteUser(id) {
      this.users = this.users.filter((user) => user.id !== id)
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        email: '',
        password: '',
        role: 'admin'
      }
      this.isEdit = false
    }
  }
}
</script>

<style scoped>
.container {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-left: 7rem;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.add-user-btn {
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-user-btn i {
  margin-right: 0.5rem;
}

.add-user-btn:hover {
  background-color: #45a049;
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

.actions button {
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 0.2rem;
}

.edit-btn {
  color: #4caf50;
}

.edit-btn:hover {
  color: #45a049;
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  color: #e31b0c;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 300px;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #45a049;
}

@media screen and (max-width: 700px) {
  .container {
    margin-left: 0;
    padding: 1rem;
  }

  .modal-content {
    width: 90%;
  }
}
</style>
