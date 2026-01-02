import { useContext, useState } from "react"
import { AuthContext } from "../../AuthContext"
import { useNavigate } from "react-router"
import './LoginPage.css'
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon.jsx"

function LoginPage() {
    const [username, setUsername] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await login(username, password)

        if (success) {
            navigate('/');
        }
    }


    return (
        <div className="login-page__background">
            <div className="login-page__body">
                <div className="login-page__image-container">
                    <DynamicPngIcon iconName="backGroundIcon"/>
                    <h2>Welcome Back</h2>
                </div>

                <form onSubmit={onSubmit} className="login-form">
                    <h2>Sign in</h2>

                    <div className="login-from-field">
                        <label htmlFor="username">Username</label>
                        <input  className="neomorphism-input" type="text" name="username" id='username' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUsername(e.target.value)
                        }}/>
                    </div>
                    

                    <div className="login-from-field">
                        <label htmlFor="password">password</label>
                        <input  
                        className="neomorphism-input" 
                        type={showPassword ? 'text' : 'password'}
                        name="password" 
                        id='password' 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setPassword(e.target.value)
                        }}/>

                        <div className="login-form-show-password">
                            <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.checked) { setShowPassword(true) } else { setShowPassword(false) }
                            }}/>
                            <p>show password</p>
                        </div>
                    </div>

                    <div id="register-div" onClick={() => navigate('/register/')}>
                        not account ? register
                    </div>

                    <button type="submit">SUBMIT</button>
                </form>
                
            </div>
        </div>
    )
}


export default LoginPage