import './Header.css'
// import { loading, user} from AuthContext
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { AuthContext } from '../../AuthContext'
import DynamicPngIcon from '../UI/icons/DynamicPngIcon'

function Header() {
    const { loading, user, logout, notifications} = useContext(AuthContext);
    const navigate = useNavigate()
    // console.log(loading, user)
    // console.log(notifications)

    const onLogout = () => {
        navigate('/', { replace: true})
        setTimeout(() => {
            logout()
        }, 100)
    }

    const notifyClick = () => {
        navigate(`/profile/${user.username}/notification/`, { replace: true } )
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
                    <div className='header-notify-and-logout'>
                        <DynamicPngIcon 
                        iconName={notifications?.length > 0 ? 'notifyActiveIcon' : 'notifyIcon'} 
                        onClick={notifyClick} 
                        width={28} 
                        height={28}
                        />
                        <button onClick={onLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header