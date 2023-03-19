import { Todo } from "../types/todoType";
import axios from "../utils/axios";

export const getTodo = async (page: number, signal?: AbortSignal) => {
    try {
        const result = await axios.get<Todo[]>(`/todos?_page=${page}&_limit=10&_sort=id&_order=desc`)
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

export const updateTodo = async (initialTodo: Todo) => {
    try {
        const result = await axios.put<Todo>(`todos/${initialTodo.id}`, initialTodo)
        return result.data
    } catch (e) {
        console.log(e)
    }
}

export const deleteTodo = async (initialTodo: Todo) => {
    try {
        const result = await axios.delete<Todo>(`todos/${initialTodo.id}`)
        return result.data
    } catch (e) {
        console.log(e)
    }
}