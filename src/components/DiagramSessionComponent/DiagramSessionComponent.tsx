import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    plugins,
} from 'chart.js'
import { useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2'
import { api } from '../../../api';
import { getAccessToken } from '../../../tokens_func';
import './DiagramSessionComponent.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
)

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                usePointStyle: true,
            }
        },
        title: {
            display: true,
            text: 'Session Chart'
        }
    }
}

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface UserItem {
    id: number;
    username: string;
}

interface SessionItem {
    user: UserItem;
    id: number;
    duration: number;
    is_active: boolean;
    created_at: string;
}

type StatisticType = 'count' | 'duration' | 'countUsers'


function DiagramSessionComponent({ taskId } : { taskId: number}) {
    const [statisticData, setStatisticData] = useState<SessionItem[]>([])
    const [statisticType, setStatisticType] = useState<StatisticType>('count')

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await api.get(
                    `api/v1/task-statistics/${taskId}/`,
                    {headers: { Authorization: getAccessToken()}}
                )

                console.log(response)
                setStatisticData(response.data.results)
            } catch (error) {
                throw error
            }
        }

        getData()
    }, [])

    const data = useMemo(() => {
        if (statisticType === 'countUsers') {
            const users_labels = [...new Set(statisticData.map(item => item.user.username))]
            return {
                labels: users_labels,
                datasets: [
                    {
                        label: 'Users sessions count',
                        data: users_labels.map((username) => statisticData.filter(item => item.user.username === username).length),
                        backgroundColor: '#5b57d9',
                    }
                ]
            }
        } else if (statisticType === 'duration') {
            return {
                labels,
                datasets: [
                    {
                        label: 'Avarage time session in minutes',
                        data: labels.map(mounthName => {
                            const seconds = statisticData.map(item => { 
                                if (item.created_at === mounthName) { 
                                    return Math.floor(item.duration / 60)
                                } else {
                                    return 0
                                } 
                            })

                            const avg = Math.floor(seconds.reduce((acc, count) => acc + count, 0) / seconds.length)

                            return avg
                        }),
                        backgroundColor: '#5b57d9',
                    }
                ]
            }
        }

        // Default type statistic Count sessions
        return {
            labels,
            datasets: [
                {
                    label: 'Sessions Count',
                    data: labels.map((mounthName) => statisticData.filter(item => item.created_at === mounthName).length),
                    backgroundColor: '#5b57d9',
                    borderColor: "#5b57d9",
                    pointStyle: 'rectRot',
                    pointRadius: 10,
                }
            ]
        }
        
    }, [statisticData, statisticType])

    return (
        <div className='diagram-container__body'>
            <div className='diagram-statistic-labels'>
                <p 
                className={`${statisticType === 'count' ? 'count' : ''}`}
                onClick={() => setStatisticType('count')}            
                >sessions count</p>

                <p 
                className={`${statisticType === 'duration' ? 'duration': ''}`}
                onClick={() => setStatisticType('duration')}
                >avarage session duration</p>

                <p 
                className={`${statisticType === 'countUsers' ? 'countUsers' : ''}`}
                onClick={() => setStatisticType('countUsers')}
                >user sessions</p>
            </div>

            {statisticType !== "count" && (
                <Bar options={options} data={data} />
            ) || (
                <Line options={options} data={data}/>
            )}
        </div>
    ) 
}

export default DiagramSessionComponent