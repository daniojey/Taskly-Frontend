import { useEffect, useState } from "react"
import { useNotify } from "../../common/stores/NotifyStore"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon"
import "../../index.css"
import "./StratagemPage.css"
import { useStratagemStore } from "../../common/stores/StratagemStore"

interface StratagemCreateSchema {
    name: string;
    url?: string;
    combination: string;
    action: "group" | "project" | "task" | "other";
    data?: {
        group_id?: number;
        project_id?: number;
        task_id?: number;
    }
}

interface StratagemItem {
    id: number;
    name: string;
    url: string;
    combination: number[];
    is_match: boolean;
    active: boolean;
    data: {
        group_id?: number;
        project_id?: number;
        task_id?: number;
    }
}

const stratagemFormSchema = yup.object({
    name: yup.string().max(100).min(10).required('This field is required'),
    combination: yup.string().required().matches(
      /^[1-4](,\s*[1-4]){0,5}$/,
      'Only 1-4 numbers'
    ),
    action: yup.string()
        .oneOf(['group', 'project', 'task', 'other'], 'choise action')
        .required('This field is required'),
    url: yup.string().when('action', {
        is: 'other',
        then: (schema) => schema.required('This field is required'),
        otherwise: (schema) => schema.optional()
    }),
})


function StratagemPage () {
    const setNotify = useNotify((state) => state.addNotify)
    const [userStratagems, setUserStratagems] = useState<StratagemItem[]>([])
    const { register, watch, handleSubmit, formState: { errors}} = useForm({
        resolver: yupResolver(stratagemFormSchema),
        mode: "onSubmit",
    })
    const removeStratagemStore = useStratagemStore((state) => state.removeStratagemStore)
    const updateStratagemsStore = useStratagemStore((state) => state.updateStratagemsStore)

    const deleteStratagem = async (item: StratagemItem) => {
        try {
            const response = await api.delete(
                `api/v1/stratagems/${item.id}/`,
                {headers: {Authorization: getAccessToken()}}
            )

            console.log(response)
            
            removeStratagemStore(item)
            setUserStratagems(userStratagems.filter(value => value.id !== item.id))
        } catch (error) {
            console.error(error)
        }
    }
    
    const setActiveStratagem = async (item: StratagemItem) => {
        console.log(item)
        try {
            const response = await api.patch(
                `api/v1/stratagems/${item.id}/`,
                {active: !item.active},
                {headers: {Authorization: getAccessToken()}}
            )

            const newActivityStratagem: StratagemItem = response.data.results

            setUserStratagems(userStratagems.map(item => {
                if (item.id === newActivityStratagem.id) {
                    return {...item, active: newActivityStratagem.active}
                } else {
                    return item
                }
            }))
            updateStratagemsStore(newActivityStratagem)
        } catch (error) {
            console.log(error)
        }
    } 

    const action = watch('action')

    const submitForm = async (data: StratagemCreateSchema) => {
        let formData = data

        switch (action) {
            case ('group'):
                const group_data = { group_id: 1}
                formData = {...formData, data: group_data }
                break
            case ('project'):
                const project_data = { project_id: 1}
                formData = {...formData, data: project_data}
                break
            case ('task'):
                const task_data = { task_id: 1}
                formData = {...formData, data: task_data}
                break
        }

        try {
            const response = await api.post(
                'api/v1/stratagems/',
                formData,
                {headers: {Authorization: getAccessToken()}}
            )

            const newStratagem = response.data.results
            console.log(response)
            setUserStratagems([newStratagem, ...userStratagems])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const getStratagems = async () => {
            try {
                const response = await api.get('api/v1/stratagems/', {
                    headers: {Authorization: getAccessToken()}
                })

                setUserStratagems(response.data?.results)
            } catch (error) {
                console.log(error)
            }
        }

        getStratagems()
    }, [])

    const arrowMap = new Map([
        [1, 'up'],
        [2, 'down'],
        [3, 'left'],
        [4, 'right'],
    ])

    return (
        <div className="stratagem-base-page">
            <div className="stratagem-page__user-content">
                <h3>My stratagems</h3>
                { userStratagems.length > 0 && userStratagems.map(item => (
                    <div className="stratagem-page__card">
                        {item.name}
                        <div>
                            {item.combination && item.combination.map(item => (
                                <DynamicPngIcon iconName={`stratagemArrow_${arrowMap.get(item)}`}/>
                            ))}
                        </div>
                        <div className="stratagem-page__card-info">
                            <input 
                            type="checkbox"
                            onClick={() => setActiveStratagem(item)} 
                            checked={item.active ? true : false} 
                            />
                            <button onClick={() => deleteStratagem(item)}>delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="stratagem-page__form-content">
                <div className="stratagem-page__hint-content">
                    <h3>Enter the combination of numbers, separated by commas</h3>
                    <div className="stratagem-page__hint-column">
                        <p>1 -</p>
                        <DynamicPngIcon iconName="stratagemArrow_up"/>
                    </div>
                    <div className="stratagem-page__hint-column">
                        <p>2 -</p>
                        <DynamicPngIcon iconName="stratagemArrow_down"/>
                    </div>
                    <div className="stratagem-page__hint-column">
                        <p>3 -</p>
                        <DynamicPngIcon iconName="stratagemArrow_left"/>
                    </div>
                    <div className="stratagem-page__hint-column">
                        <p>4 -</p>
                        <DynamicPngIcon iconName="stratagemArrow_right"/>
                    </div>
                </div>

                <form onSubmit={handleSubmit(submitForm)} className="stratagem-page__form">

                    <div className="stratagem-page__form-column">
                        <label htmlFor="action">Action</label>
                        <select id="action" className={`holy_select ${action ? 'has_value': ''}`} {...register('action')}>
                            {!action ? (
                                <option value="">Select action...</option>
                            ) : (
                                <></>
                            )}
                            <option value="group">Open group</option>
                            <option value="project">Open project</option>
                            <option value="task">Open task</option>
                            <option value="other">Open other url</option>
                        </select>
                    </div>

                    <div className="stratagem-page__form-column" >
                        <label htmlFor="name">Stratagem name</label>
                        <input type="text" id="name" className="holy_input" {...register('name')}/>
                    </div>

                    <div className="stratagem-page__form-column">
                        <label htmlFor="combination">Combination</label>
                        <input type="text" id="combination" className="holy_input" {...register('combination')}/>
                    </div>

                    {action === 'other' && (
                        <div className="stratagem-page__form-column">
                            <label htmlFor="url">Url</label>
                            <input type="url" id="url" className="holy_input" {...register('url')}/>
                        </div>
                    )}
                    <button type="submit">Create</button>
                </form>
            </div>
        </div>
    )
}

export default StratagemPage