import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { ReactNode, useState } from "react"
import { getTodo } from "../../api/todosApi"
import { Todo } from "../../types/todoType"
import AddTodoForm from "./AddTodoForm"

const TodoList = () => {
    const [page, setPage] = useState<number>(1)

    // data 2 trạng thái là data có và data không có trong cache
    // data có trong cache có 2 loại là data cũ và data còn mới (stale time)
    // Neu data cũ thì khi ta mount vào component react-query vẫn xác định là data có nhưng data cũ
    // Khi data có sẵn trong cache thì isLoading = false. Tuy nhiên nếu data cũ thì vẫn bị fetch data ngầm bằng queryFn
    // Chính vì vậy isFetching = true. Lúc đó nếu data từ server mới hơn khi cache sẽ tiếp tục cập nhật.

    const { data: todos, isLoading, isFetching, isError, isSuccess, error, } = useQuery({
        queryKey: ['todos', page],
        queryFn: () => getTodo(page),
        select: data => data?.sort((a: Todo, b: Todo) => b.id! - a.id!)
    })

    const changeComplete = (todo: Todo) => {

    }

    const deleteTodos = (todo: Todo) => {

    }

    console.log(todos)

    let content;
    if (isLoading) {
        content = <p>Loading</p>
    } else if (isSuccess) {
        content = todos?.map(todo => (
            <article key={todo.id}>
                <div className="todo">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        id={String(todo.id)}
                        onChange={() =>
                            changeComplete({ ...todo, completed: !todo.completed })
                        }
                    />
                    <label htmlFor={String(todo.id)}>{todo.title}</label>
                </div>
                <button className="trash">
                    <FontAwesomeIcon icon={faTrash} onClick={() => deleteTodos(todo)} />
                </button>
            </article>
        ))
    } else if (isError) {
        if (axios.isAxiosError(error)) {
            content = <p>{error.message}</p>
        }
    }

    return (
        <main>
            <h1>Todo List</h1>
            <AddTodoForm />
            {content}
            <div>
                <button onClick={() => setPage(prev => prev - 1)} disabled={page == 1}>Prev</button>
                <button onClick={() => setPage(prev => prev + 1)} disabled={page == 3}>Next</button>
            </div>
        </main>
    )
}

export default TodoList