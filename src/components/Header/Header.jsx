import './Header.css'
// import { loading, user} from AuthContext
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { AuthContext } from '../../AuthContext'

function Header() {
    const { loading, user, logout} = useContext(AuthContext);
    const navigate = useNavigate()
    console.log(loading, user)

    const onLogout = () => {
        navigate('/', { replace: true})
        setTimeout(() => {
            logout()
        }, 100)
    }

    return (
        <div className="header">
            <div className="header-title">
                <Link className="header-title-name" to='/'>Taskly</Link>
            </div>
            <div className="header-body">
                <Link to='/'>About</Link>
                {!loading && user && (
                    <Link to='/groups/'>Groups</Link>
                )}
                <Link>Docs</Link>
                <Link>Guide</Link>
            </div>
            <div className="header-authenticate-body">
                {!loading && !user && (
                    <Link to="/login/">Sign in</Link>
                )}

                {!loading && user && (
                    <button onClick={onLogout}>Logout</button>
                )}
            </div>
        </div>
    )
}

export default Header