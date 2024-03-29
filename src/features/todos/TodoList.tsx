import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useIsFetching, useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { ReactNode, useState } from "react"
import { toast } from "react-toastify"
import { deleteTodo, getTodo, updateTodo } from "../../api/todosApi"
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
        queryFn: () => {
            const controller = new AbortController();
            setTimeout(() => {
                controller.abort();
            }, 5000)
            return getTodo(page, controller.signal)
        },
        staleTime: 10 * 1000,           // 10s

        select: (data) => data?.sort((a: Todo, b: Todo) => b.id! - a.id!),

        // Moi lan load qua trang moi thi mac dinh data khong co undefined nen isLoading = true
        // Voi keepPreviousData = true, thi data truoc do se duoc giu lai, khi do mac du data da cu (stale)
        // Nhung data van co nen isLoading = false, khi do ta se khong thay skeleton loading hay giat man hinh UX
        keepPreviousData: true
    })

    const queryClient = useQueryClient()

    const updateTodoMutate = useMutation({
        mutationFn: (initialTodo: Todo) => updateTodo(initialTodo),
        // Truoc khi call api gi do no se cap nhat truoc
        onMutate: async (initialTodo: Todo) => {
            await queryClient.cancelQueries({ queryKey: ['todos', page] })
            const previousTodo: Todo[] = queryClient.getQueryData(['todos', page]) || []

            const newTodoList = [...previousTodo]
            const index = newTodoList.findIndex((todo: Todo) => todo.id == initialTodo.id)
            newTodoList[index].completed = initialTodo.completed

            queryClient.setQueryData(['todos', page], newTodoList)

            // Snap lai previous data
            return { previousTodo }
        },
        // Error thi phai undo lai
        onError: (err: { message: string }, initialTodo, context) => {
            toast.warn(err.message)
            queryClient.setQueryData(['todos', page], context?.previousTodo)
        },
        onSuccess: () => {
            toast.success('Update todo successed!')
        },
        onSettled: () => {
            // Kieu j cx phai fetch lai cho chac an, vi luc ta cap nhat cache theo chu quan khong dua vao data tu server
            queryClient.invalidateQueries({ queryKey: ['todos', page] })
        }
    })

    // Tuong tu
    const deleteTodoMutate = useMutation({
        mutationFn: (initialTodo: Todo) => deleteTodo(initialTodo),
        onMutate: async (initialTodo: Todo) => {
            await queryClient.cancelQueries({ queryKey: ['todos', page] })
            const previousTodo: Todo[] = queryClient.getQueryData(['todos', page]) || []

            const newTodoList = previousTodo.filter((todo: Todo) => todo.id != initialTodo.id)

            queryClient.setQueryData(['todos', page], newTodoList)

            return { previousTodo }
        },
        onError: (err: { message: string }, initialTodo, context) => {
            toast.warn(err.message)
            queryClient.setQueryData(['todos', page], context?.previousTodo)
        },
        onSuccess: () => {
            toast.success("Delete todo successed!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['todos', page] })
        }
    })

    // state time phai lon hon khong, boi vi neu prefetch truoc di nua, neu statle time = 0
    // Thi khi ta 'that su' click vao next hoac prev button thi no van goi la getTodo lan nua. 
    // Luc nay thi no thay statle time da het thi luc do no se call api lai lan nua (lang phi)
    // Dong thoi khi hover lien tuc vao button se khong fetch lai api lien tuc

    // Con cache time o day lam gi. Voi truong hop nguoi dung chi hover vao button chu khong co y tuong bam vao
    // Thi cache chi luu trong 10s thi se xoa data khoi cache de tranh luu qua nhieu

    // Tuy nhien co mot luu y the nay
    // Ta thay getTodo bi goi 2 lan, mot lan hover, sau khi hover ta bam vao thi onclick se goi api
    // Ta thay khi hover co stale time la 10s
    // Tuy nhien khi click thi getTodo query voi stale time mac dinh la 0s
    // Voi truong hop 2 query giong nhau goi lien tiep the nay, neu query sau co stale time < stale time truoc do
    // Thi kha nang cao van la bi fetch lai 
    // Vi du lan dau fetch co stale la 10s, sau khi duoc 7s ta bam vao button, voi lan 2 fetch ta cau hinh stale la 5s
    // Luc nay 7s > 5s => mac dinh la data da cu nen se fetch lai lan nua. Do do neu muon lam prefetch thi phai cau hinh
    // stale time o ca 2 ham query, va stale time cua query sau >= stale time query truoc do

    const prefetchPrevPage = (page: number) => {
        queryClient.prefetchQuery(['todos', page], {
            queryFn: () => getTodo(page),
            staleTime: 10 * 1000,
            cacheTime: 10 * 1000            // 10s
        })
    }

    const prefetchNextPage = (page: number) => {
        queryClient.prefetchQuery(['todos', page], {
            queryFn: () => getTodo(page),
            staleTime: 10 * 1000,
            cacheTime: 10 * 1000,
        })
    }

    // So luong nhung lan "dang duoc" fetching hay mutating
    // Sau khi fetch hoac mutate xong thi so luong ve lai 0
    const isFetchingIndicators = useIsFetching();
    const isMuatatingIndicators = useIsMutating();

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
                            updateTodoMutate.mutate({ ...todo, completed: !todo.completed })
                        }
                    />
                    <label htmlFor={String(todo.id)}>{todo.title}</label>
                </div>
                <button className="trash">
                    <FontAwesomeIcon icon={faTrash} onClick={() => deleteTodoMutate.mutate(todo)} />
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
            <h1>
                Todo List
                <span>Indicators: {isFetchingIndicators + isMuatatingIndicators}</span>
            </h1>
            <AddTodoForm page={page} />
            {content}
            <div>
                <button onClick={() => setPage(prev => prev - 1)} disabled={page == 1} onMouseEnter={() => prefetchPrevPage(page - 1)}>Prev</button>
                <button onClick={() => setPage(prev => prev + 1)} disabled={page == 3} onMouseEnter={() => prefetchNextPage(page + 1)}>Next</button>
            </div>
        </main >
    )
}

export default TodoList