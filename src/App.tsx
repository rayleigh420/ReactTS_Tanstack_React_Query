import { useQuery } from '@tanstack/react-query'
import { getTodo } from './api/todosApi'
import './App.css'

function App() {

  const todos = useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodo()
  })

  return (
    <div className="App">
      Hello
      {JSON.stringify(todos)}
    </div>
  )
}

export default App
