import { api } from "../../../api"
import { useState, useEffect } from "react"
import './Homepage.css'
import myImage from '../../assets/home_image.png';


function HomePage() {
    const [groups, setGroups] = useState([])

    // useEffect(() => {
    //     const getProducts = async () => {
    //         try {
    //             // const item = localStorage.setItem('accessToken', null)
    //             const accessToken = localStorage.getItem('accessToken')

    //             // console.log('ACCESSS', accessToken)

    //             const response = await api.get(
    //                 'api/v1/groups/', {
    //                     headers: {
    //                         Authorization: `Bearer ${accessToken}`
    //                     }
    //                 }
    //             );
    //             console.log(response.data)
    //             setGroups(response.data.result)
    //         } catch(error) {
    //             console.log(error)
    //         }
    //     }

    //     getProducts()
    // }, [])

    return (
        <div className="home-base-container">
            <div className="home-body-title">
                <div className="home-body-info-text">
                    <h3>Structure your life!</h3>
                    <p>Taskly - Helps you create and structure tasks with convenient tools for creating a wide range of tasks. Create tasks with your team, discuss them in chat, and update their status when changes occur.</p>
                    <a href="">Get Started</a>
                </div>
                <div className="home-body-image">
                    <img src={myImage}/>
                </div>
            </div>
        </div>


    )
}


export default HomePage