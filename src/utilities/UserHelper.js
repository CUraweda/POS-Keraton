import { ref } from 'vue'
import GlobalHelper from './GlobalHelper'

const { DB_BASE_URL } = GlobalHelper

export const fetchUserData = async () => {
  const url = `${DB_BASE_URL.value}/keraton/user`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
