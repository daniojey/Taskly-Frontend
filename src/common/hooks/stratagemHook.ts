import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

type NameTypes = 'groups' | 'active tasks' | 'need motivation'

export const useStratagem = () => {
    const navigate = useNavigate()

    const executeCommand = (command: string) => {
        switch (command) {
            case 'groups':
                navigate('/groups/')
                break
            case 'active tasks':
                navigate('/active-tasks/')
                break
            case 'need motivation':
                window.location.href = "https://www.youtube.com/shorts/DCALrMgWNUE"
                break
        }
    }
        

    return {
        executeCommand
    }
}