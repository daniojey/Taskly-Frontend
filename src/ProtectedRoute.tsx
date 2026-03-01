import { useContext, useEffect } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "./AuthContext"
import { useUser } from "./common/stores/AuthStore"

interface ProtectedRouteProps {
    children: HTMLElement
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const user = useUser((state) => state.user)
    const {showLoading} = useContext(AuthContext)
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