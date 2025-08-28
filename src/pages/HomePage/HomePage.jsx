import { api } from "../../../api"
import { useState, useEffect } from "react"


function HomePage() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        const getProducts = async () => {
            try {
                // const item = localStorage.setItem('accessToken', null)
                const accessToken = localStorage.getItem('accessToken')

                // console.log('ACCESSS', accessToken)

                const response = await api.get(
                    'api/v1/groups/', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                console.log(response.data)
                setGroups(response.data.result)
            } catch(error) {
                console.log(error)
            }
        }

        getProducts()
    }, [])

    return (
        <div>
            <h2>TITLE HEAD</h2>

            {groups.map((item, index) => {
                <div key={index}>
                    <p>{item.id}</p>
                    <p></p>
                </div>
            })}
        </div>


    )
}


export default HomePage