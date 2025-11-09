import { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import axios from 'axios'
import { Link } from 'react-router-dom'
import type { Devices } from '../types/devices'

export const DevicesList = () => {
  const [devices, setDevices] = useState<Devices[]>([])

  useEffect(() => {
    axios
      .get('https://dev-space.su/api/v1/a/devices/')
      .then(response => {
        setDevices(response.data)
      })
      .catch(error => {
        console.error('Ошибка при получении списка устройств', error)
      })
  }, [])

  return (
    <div>
      <h2>Список устройств</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя устройства</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(device => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.name}</td>
              <td>
                <Link to={`${device.id}/`}>
                  <Button variant="info">Просмотреть игроков</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
