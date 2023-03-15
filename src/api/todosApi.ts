import { Todo } from "../types/todoType";
import axios from "../utils/axios";

export const getTodo = async () => {
    try {
        const result = await axios.get<Todo[]>('/todos')
        return result.data
    } catch (e) {
        console.log(e)
    }
}

export const addTodo = async (initialTodo: Todo) => {
    try {
        const result = await axios.post<Todo>('/todos', initialTodo)
        return result.data
    } catch (e) {
        console.log(e)
    }
}