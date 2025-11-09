import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { DevicesList } from './components/DevicesList'
import { PlayerBalances } from './components/PlayerBalances/PlayerBalances'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<DevicesList />} />
          <Route path=":deviceId/" element={<PlayerBalances />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  )
}

export default App
