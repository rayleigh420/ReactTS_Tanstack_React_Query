import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "react-toastify";
import { addTodo } from "../../api/todosApi";
import { Todo } from "../../types/todoType";

const AddTodoForm = ({ page }: { page: number }) => {

    const [newTodo, setNewTodo] = useState<string>('')
    const queryClient = useQueryClient();

    const addTodoMutate = useMutation({
        mutationFn: (initialTodo: Todo) => addTodo(initialTodo),
        onSuccess: (data) => {
            // Vi ta can id do json-server tra ve nen dung pessimistic update
            let previousTodo: Todo[] = queryClient.getQueryData(['todos', page])!
            queryClient.setQueryData(['todos', page], [data, ...previousTodo])
            toast.success('Add new todo successed!')
        },
        onError: () => {
            toast.warn('Something Wrong!')
        },
        onSettled: () => {
            // Van nen fetch ngam lai du cho co loi hay khong, dieu nay lam cho data dong bo hon
            // Tuy nhien vi day la pessimistic update, ta nhan data tu server sau do ms update
            // Nen khong can thiet phai invalidates lai
            queryClient.invalidateQueries({ queryKey: ['todos', page] })
        }
    })

    const changeTodo = (e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newTodo.length > 0) {
            addTodoMutate.mutate({
                userId: 1,
                title: newTodo,
                completed: false
            }, {
                onSuccess: () => setNewTodo('')
            })

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