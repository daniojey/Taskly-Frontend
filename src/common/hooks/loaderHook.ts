import { useState } from "react"

export function useLoader() {
    const [loading, setLoading] = useState<boolean>(true)
    const [closeLoading, setCloseLoading] = useState<boolean>(false)

    const onCloseLoading = () => {
        setCloseLoading(true)
        
        setTimeout(() => {
            setLoading(false)
        }, 400)
    }

    return {
        loading,
        closeLoading,
        onCloseLoading
    }
}