export type Devices = {
  id: number
  name: string
  places: Players[]
  created_at: string
  updated_at: string
}
export type Players = {
  device_id: number
  place: number
  currency: string
  balances: number
}
