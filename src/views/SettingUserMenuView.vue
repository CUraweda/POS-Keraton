<template>
    <div class="container">
    </div>
  </template>
  
  <script>
 const { useRouter } = require('vue-router')
const { getCookie } = LoginHelper
  const { DB_BASE_URL, USER_BASE_URL, CATEGORY_BASE_URL, assignAlert } = GlobalHelper
  
  const router = useRouter()
  export default {
    data() {
      return {
        userData: {},
        selectedUser: {},
        selectedUserPOSMenu: [],
        sidebarRoutes: [],
        userDatas: [],
    }
    },
    mounted() {
      this.fetchData()
    },
    methods: {
      async fetchData() {
        try {
            const usersResponse = await fetch(`${DB_BASE_URL}/${USER_BASE_URL}`, {
                headers: {
                    Authorization: getCookie("token")
                }
            })
            if(!usersResponse.ok) throw Error("Failed to fetch data")
            const responseData = await usersResponse.json()
            this.userDatas = responseData.data

            //Router
            this.sidebarRoutes = router.getRoutes().filter(route => route.meta?.sideBar)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      },
      async updateUser(){
        try{
            if(!this.selectedUser?.id) throw Error("Please choose user first")
            const updateUser = await fetch(`${DB_BASE_URL}/${USER_BASE_URL}/create-update-user/${this.selectedUser.id}`, {
                method: "POST",
                body: {
                    "shownPOSMenu": this.selectedUserPOSMenu.join(",")
                },
                headers: {
                    Authorization: getCookie('token')
                }
            })
            if(!updateUser.ok) throw Error("Error while updating user")
        }catch(e){
            console.log(e)
        }
      },
      async selectUser(data){
        this.userData = data
        this.selectedUserPOSMenu = data.shownPOSMenu.split(",")
      }
    }
  }
  </script>
  