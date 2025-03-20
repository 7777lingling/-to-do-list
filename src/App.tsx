import { useEffect, useState } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
  category: string
  createdAt: number
  completedAt?: number
  priority: 'low' | 'medium' | 'high'
  isEditing?: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    return savedTodos ? JSON.parse(savedTodos) : []
  })
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('工作')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('全部')
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'completedAt'>('createdAt')
  const [showCompleted, setShowCompleted] = useState(true)
  
  const categories = ['工作', '生活', '學習', '其他']
  const priorities = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' }
  ]
  
// 將 useEffect 的導入移至文件頂部與其他導入語句一起
// 將此導入語句移至文件頂部

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))    
  }, [todos])

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: input.trim(), 
        completed: false,
        category,
        priority,
        createdAt: Date.now()
      }])
      setInput('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        completedAt: !todo.completed ? Date.now() : undefined 
      } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const editTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isEditing: true } : todo
    ))
  }

  const updateTodo = (id: number, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText, isEditing: false } : todo
    ))
  }

  const filteredAndSortedTodos = todos
    .filter(todo => 
      todo.text.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterCategory === '全部' || todo.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'completedAt') {
        if (!b.completedAt && !a.completedAt) return b.createdAt - a.createdAt
        if (!b.completedAt) return 1
        if (!a.completedAt) return -1
        return b.completedAt - a.completedAt
      }
      return b.createdAt - a.createdAt
    })

  return (
    <div className="todo-container">
      <h1>待辦事項清單</h1>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新增待辦事項"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="priority-select"
        >
          {priorities.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button onClick={addTodo}>新增</button>
      </div>
      <div className="filter-container">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜尋待辦事項"
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="全部">全部分類</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'priority')}
          className="sort-select"
        >
          <option value="createdAt">按建立時間</option>
          <option value="completedAt">按完成時間</option>
          <option value="priority">按優先級</option>
        </select>
      </div>
      <ul className="todo-list">
        {filteredAndSortedTodos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <div className="todo-content">
              {todo.isEditing ? (
                <input
                  type="text"
                  defaultValue={todo.text}
                  className="edit-input"
                  onBlur={(e) => updateTodo(todo.id, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && updateTodo(todo.id, e.currentTarget.value)}
                  autoFocus
                />
              ) : (
                <span className="todo-text" onDoubleClick={() => editTodo(todo.id)}>{todo.text}</span>
              )}
              <div className="todo-meta">
                <span className="todo-category">{todo.category}</span>
                <span className={`todo-priority priority-${todo.priority}`}>
                  {priorities.find(p => p.value === todo.priority)?.label}
                </span>
                <span className="todo-date">
                  建立: {new Date(todo.createdAt).toLocaleDateString()}
                  {todo.completedAt && (
                    <> | 完成: {new Date(todo.completedAt).toLocaleDateString()}</>
                  )}
                </span>
              </div>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="delete-button">刪除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
