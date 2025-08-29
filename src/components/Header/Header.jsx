import './Header.css'
// import { loading, user} from AuthContext
import { useContext } from 'react'
import { Link } from 'react-router'
import { AuthContext } from '../../AuthContext'

function Header() {
    const { loading, user} = useContext(AuthContext);
    console.log(loading, user)

    return (
        <div className="header">
            <div className="header-title">
                <Link className="header-title-name" to='/'>Taskly</Link>
            </div>
            <div className="header-body">
                <Link to='/'>About</Link>
                <Link>Recource</Link>
                <Link>Docs</Link>
                <Link>Guide</Link>
            </div>
            <div className="header-authenticate-body">
                {!loading && !user && (
                    <Link to="/login/">Sign in</Link>
                )}
            </div>
        </div>
    )
}

export default Header