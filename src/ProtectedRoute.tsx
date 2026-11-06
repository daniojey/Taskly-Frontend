import { useContext, useEffect } from "react"
import { useNavigate } from "react-router"
import { useUser } from "./common/stores/AuthStore"
import { useAuth } from "./common/hooks/useAuth"

interface ProtectedRouteProps {
    children: HTMLElement
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const user = useUser((state) => state.user)
    const {showLoading} = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!showLoading && !user) {
            navigate('/login/')
        }
    }, [showLoading, user, navigate])


    return (
        <>
            {!showLoading && children}
        </>
    )
};

export default ProtectedRoute