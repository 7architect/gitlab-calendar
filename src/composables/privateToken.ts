export const token = ref(localStorage.getItem('token'))
export const setToken = (newToken: string) => {
  localStorage.setItem('token', newToken)
  token.value = newToken
}
export const useToken = () => token.value

