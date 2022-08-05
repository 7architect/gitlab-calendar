const user = ref<string>(localStorage.getItem('u') || '')
export const setUser = (username: string) => {
  user.value = username
  localStorage.setItem('u', username)
}
export const useUser = () => user
