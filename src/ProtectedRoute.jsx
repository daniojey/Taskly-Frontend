import { useContext, useEffect } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "./AuthContext"

function ProtectedRoute({ children }) {
    const {showLoading, user} = useContext(AuthContext)
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