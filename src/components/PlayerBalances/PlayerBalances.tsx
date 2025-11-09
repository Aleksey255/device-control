import { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import type { Devices } from '../../types/devices'
import { toast } from 'react-toastify'
import styles from './PlayerBalances.module.css'

export const PlayerBalances = () => {
  // Получаем параметр deviceId из URL
  const { deviceId } = useParams<{ deviceId: string }>()

  // Состояние для хранения данных о игроках
  const [players, setPlayers] = useState<Devices | null>(null)

  // Состояние для хранения сумм пополнений/снятий для каждого игрока
  const [amount, setAmount] = useState<{ [key: number]: string }>({})

  // Эффект для получения данных о игроках при изменении deviceId
  useEffect(() => {
    axios
      .get(`https://dev-space.su/api/v1/a/devices/${deviceId}/`)
      .then(response => {
        setPlayers(response.data)
        // Инициализируем начальные значения для amounts
        if (response.data && response.data.places) {
          const initialAmount: { [key: number]: string } = {}
          response.data.places.forEach((player: { place: number }) => {
            initialAmount[player.place] = '0'
          })
          setAmount(initialAmount)
        }
      })

      .catch(error => {
        console.error('Ошибка при получении списка игроков', error)
        toast.error('Ошибка при получении списка игроков')
      })
  }, [deviceId])

  // Обработчик изменения суммы пополнения/снятия
  const handleAmountChange = (placeId: number, amount: string) => {
    // Оставляем только цифры и точку
    let filteredValue = amount.replace(/[^0-9.]/g, '')
    const parts = filteredValue.split('.')

    // Удаляем нули в начале
    if (parts[0].length > 1 && parts[0][0] === '0') {
      parts[0] = parts[0].replace(/^0+/, '')
      filteredValue = parts.join('.')
    }
    /* Разрешаем ввод только десятичных цифр, так как при вводе больше чем два знака после запятой
может некорректно посчитаться сумма баланса*/
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2)
      filteredValue = parts.join('.')
    }
    // Оставляем только одну точку
    if (parts.length > 2) {
      filteredValue = parts.slice(0, 2).join('.')
    }
    setAmount(prevAmounts => ({
      ...prevAmounts,
      [placeId]: filteredValue,
    }))
  }

  // Функция для пополнения баланса игрока
  const depositBalance = (placeId: number, amount: number) => {
    if (players) {
      const player = players.places.find(player => player.place === placeId)
      if (player) {
        if (amount === 0) {
          toast.warning('Введите корректную сумму')
          return
        }
        const newBalance = player.balances + amount
        updateBalance(placeId, newBalance)
        handleAmountChange(player.place, '0')
      }
    }
  }

  // Функция для снятия баланса игрока
  const withdrawBalance = (placeId: number, amount: number) => {
    if (players) {
      const player = players.places.find(player => player.place === placeId)
      if (player) {
        if (player.balances < amount) {
          toast.error('Недостаточно средств на балансе')
          return
        }
        if (amount === 0) {
          toast.warning('Введите корректную сумму')
          return
        }
        const newBalance = player.balances - amount
        updateBalance(placeId, newBalance)
        handleAmountChange(player.place, '0')
      }
    }
  }

  // Функция для обновления баланса игрока на сервере
  const updateBalance = (placeId: number, newBalance: number) => {
    axios
      .post(
        `https://dev-space.su/api/v1/a/devices/${deviceId}/place/${placeId}/update`,
        { newBalance }
      )
      .then(() => {
        if (players) {
          const updatedPlaces = players.places.map(player =>
            player.place === placeId
              ? { ...player, balances: newBalance }
              : player
          )
          setPlayers({ ...players, places: updatedPlaces })
          toast.success('Баланс успешно обновлен')
        }
      })
      .catch(error => {
        console.error('Ошибка при обновлении баланса', error)
        toast.error('Ошибка при обновлении баланса')
      })
  }
  console.log(amount)
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Link to={'/'}>
            <Button variant="primary" style={{ margin: '10px 0' }}>
              Назад
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Балансы игроков на устройстве {players?.name}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Валюта</th>
                <th>Баланс</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {players?.places.map(player => (
                <tr key={player.place}>
                  <td>{player.place}</td>
                  <td>{player.currency}</td>
                  <td>{player.balances}</td>
                  <td>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="input"
                        value={amount[player.place] || '0'}
                        style={{ maxWidth: '100px' }}
                        onChange={e =>
                          handleAmountChange(player.place, e.target.value)
                        }
                      />
                      <div className={styles.btnWrapper}>
                        <Button
                          variant="primary"
                          onClick={() =>
                            depositBalance(player.place, +amount[player.place])
                          }
                        >
                          Внести
                        </Button>
                        <Button
                          variant="dark"
                          onClick={() =>
                            withdrawBalance(player.place, +amount[player.place])
                          }
                        >
                          Снять
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}
