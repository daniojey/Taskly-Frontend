import { useState } from "react"

export function useLoader(startLoading: boolean = true) {
    const [loading, setLoading] = useState<boolean>(startLoading)
    const [closeLoading, setCloseLoading] = useState<boolean>(false)

    const onCloseLoading = () => {
        setCloseLoading(true)
        
        setTimeout(() => {
            setLoading(false)
        }, 400)
    }

    return {
        loading,
        setLoading,
        closeLoading,
        onCloseLoading
    }
}