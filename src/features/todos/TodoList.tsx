import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery } from "@tanstack/react-query"
import { ReactNode } from "react"
import { getTodo } from "../../api/todosApi"
import { Todo } from "../../types/todoType"
import AddTodoForm from "./AddTodoForm"

const TodoList = () => {

    const { data: todos, isLoading, isFetching, isError, isSuccess, error } = useQuery({
        queryKey: ['todos'],
        queryFn: () => getTodo(),
        select: data => data?.sort((a: Todo, b: Todo) => b.id! - a.id!)
    })

    const changeComplete = (todo: Todo) => {

    }

    const deleteTodos = (todo: Todo) => {

    }

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
        content = <p>Error</p>
    }

    return (
        <main>
            <h1>Todo List</h1>
            <AddTodoForm />
            {content}
        </main>
    )
}

export default TodoList