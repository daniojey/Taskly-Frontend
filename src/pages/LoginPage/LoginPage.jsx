import { useContext, useState } from "react"
import { AuthContext } from "../../AuthContext"
import { useNavigate } from "react-router"

function LoginPage() {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()


    const onSubmit = async (e) => {
        e.preventDefault()
        const success = await login(username, password)

        if (success) {
            console.log('Login successful')

            navigate('/');
        }
    }


    return (
        <div>
            <form onSubmit={onSubmit}>
                <input type="text" name="username" id='username' onChange={(e) => setUsername(e.target.value)}/>
                <input type="password" name="password" id='password' onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">SUBMIT</button>
            </form>
        </div>
    )
}


export default LoginPage