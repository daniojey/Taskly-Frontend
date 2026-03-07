import './Homepage.css'
import myImage from '../../assets/home_image.png';
import { Link } from 'react-router';


function HomePage() {
    return (
        <div className="home-base-container">
            <div className="home-body-title">
                <div className="home-body-info-text">
                    <h3>Structure your life!</h3>
                    <p>Taskly - Helps you create and structure tasks with convenient tools for creating a wide range of tasks. Create tasks with your team, discuss them in chat, and update their status when changes occur.</p>
                    <Link to={'/groups'}>Get Started</Link>
                </div>
                <div className="home-body-image">
                    <img src={myImage}/>
                </div>
            </div>
        </div>


    )
}


export default HomePage