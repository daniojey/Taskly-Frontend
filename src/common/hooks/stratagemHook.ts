import { useNavigate } from "react-router"

type NameTypes = 'groups' | 'active tasks' | 'need motivation'

export const useStratagem = () => {
    const navigate = useNavigate()

    const executeCommand = (is_base: boolean = false , url: string) => {
        console.log(is_base, url)
        switch (is_base) {
            case true:
                navigate(url)
                break
            case false:
                window.open(url, '_blank')
                break
        }
    }
        

    return {
        executeCommand
    }
}