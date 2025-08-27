import { api } from "../../../api"
import { useState, useEffect } from "react"


function HomePage() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await api.get(
                    'api/v1/groups/', {
                        headers: {
                            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2MjI5OTExLCJpYXQiOjE3NTYyMjgxMTEsImp0aSI6IjZjYTk0ZDlhM2U1ZTQ0YzY4ZDVkMGUwNzg2OTU5ODZiIiwidXNlcl9pZCI6IjEifQ.0uFE19Ejh59GnmSlZD86dJGPEvs6Dm1OkYZ0HGn0Pvw'
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