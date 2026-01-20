import './Header.css'
// import { loading, user} from AuthContext
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { AuthContext } from '../../AuthContext'
import DynamicPngIcon from '../UI/icons/DynamicPngIcon'
import TaskTimerComponent from '../TaskTimerComponent/TaskTimerComponent'
import { OneTimerContext } from '../../OneTimerContext'

function Header() {
    const { loading, user, logout, notifications} = useContext(AuthContext);
    const { isPaused } = useContext(OneTimerContext)
    const navigate = useNavigate()

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
                {!loading && user && (
                    <Link to='/groups/'>Groups</Link>
                )}
                
                {!isPaused && (
                    <TaskTimerComponent taskId={null} shortVersion={true}/>
                )}
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