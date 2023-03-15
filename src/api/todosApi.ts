import { Todo } from "../types/todoType";
import axios from "../utils/axios";

export const getTodo = async () => {
    try {
        const result = await axios.get<Todo>('todos')
        return result
    } catch (e) {
        console.log(e)
    }
}