import { useContext, useState } from "react"
import { AuthContext } from "../../AuthContext"
import { useNavigate } from "react-router"
import './LoginPage.css'

const welcomeText = ['W', 'e', 'l', 'c', 'o', 'm', 'e', '', 'b', 'a', 'c', 'k']

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
                <div className="login-page__title-container">
                    {welcomeText.length > 0 && welcomeText.map((item, index) => (
                        item !== '' ? (
                            <h2 style={{ animationDelay: `${0.1 * index}s` }}>{item}</h2>
                        ) : (
                            <span></span>
                        )
                    ))}
                </div>

                <form onSubmit={onSubmit} className="login-form">
                    <h2>Sign in</h2>

                    <div className="login-from-field">
                        <label htmlFor="username">Username</label>
                        <input className="holy_input" type="text" name="username" id='username' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUsername(e.target.value)
                        }} />
                    </div>


                    <div className="login-from-field">
                        <label htmlFor="password">password</label>
                        <input
                            className="holy_input"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id='password'
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(e.target.value)
                            }} />


                    </div>

                    <div
                        className={`holy_checkbox ${showPassword ? 'active' : ''}`}
                    >
                        <span onClick={() => setShowPassword(!showPassword)}>show password</span>
                        <input
                            id="lb-1"
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            />
                        <label
                            htmlFor="lb-1"
                        >
                        </label>
                    </div>

                    <div id="register-div" onClick={() => navigate('/register/')}>
                        don`t have an account ? register
                    </div>
                    
                    <div className="login-from-field-button">
                        <button type="submit">SUBMIT</button>
                    </div>
                </form>

            </div>
        </div>
    )
}


export default LoginPage