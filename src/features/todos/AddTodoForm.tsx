import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, FormEvent, useState } from "react"

const AddTodoForm = () => {

    const [newTodo, setNewTodo] = useState<string>('')

    const changeTodo = (e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newTodo.length > 0) {

            setNewTodo('')
        }

    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-todo">Enter a new todo item</label>
            <div className="new-todo">
                <input
                    type="text"
                    id="new-todo"
                    placeholder="Enter new todo"
                    value={newTodo}
                    onChange={changeTodo}
                />
            </div>
            <button className="submit">
                <FontAwesomeIcon icon={faUpload} />
            </button>
            {/* <button onClick={handleErrorTodo}>Error</button> */}
        </form>
    )
}

export default AddTodoForm