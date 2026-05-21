import { healthSchema } from '@todo-list/shared'
import './App.css'

function App() {
  const health = healthSchema.parse({ status: 'ok' })

  return (
    <main className="app">
      <h1>todo-list</h1>
      <p>Web app is running. Shared package import verified: {health.status}</p>
    </main>
  )
}

export default App
