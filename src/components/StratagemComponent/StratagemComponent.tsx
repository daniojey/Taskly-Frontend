import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import './StratagemComponent.css'
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";
import { useStratagem } from "../../common/hooks/stratagemHook";
import { useStratagemStore } from "../../common/stores/StratagemStore";

const userInputMap = {
    "KeyW": 1,
    'KeyS': 2,
    'KeyA': 3,
    'KeyD': 4,
}

interface StratagemItem {
    name: string,
    url: string,
    combination: number[],
    is_match: boolean,
    is_base?: boolean
}

function calculateMatches (short: number[], strategies: StratagemItem[]) {
    return strategies.map(item => {
        const is_match = short.every((value, index) => value === item.combination[index])
        return {...item, is_match}
    })
}

function isArrayKey(key: string): key is keyof typeof userInputMap {
    return key in userInputMap
}

const baseStrategies = [
    {name: 'groups', url: '/groups/',  combination: [1, 1, 2, 4], is_match: false, is_base: true},
    {name: 'active tasks', url: '/active-tasks/', combination: [2, 2, 2, 3, 2, 2, 4], is_match: false, is_base: true},
    {name: 'need motivation', url: 'https://www.youtube.com/shorts/DCALrMgWNUE',combination: [3, 4, 4, 3], is_match: false},
    {name: 'stratasetings', url: '/stratagems/', combination: [1, 2, 2, 1, 2], is_match: false, is_base: true}
]

function StratagemComponent() {
    const stratagems = useStratagemStore((state) => state.stratagems)
    const [strategies, setStrategies] = useState<StratagemItem[]>([...baseStrategies, ...stratagems])
    const strategiesRef = useRef<StratagemItem[]>(strategies)
    const [closeWindow, setCloseWindow] = useState<boolean>(false)

    const [openWindow, setOpenWindow] = useState<boolean>(false)
    const [userInput, setUserInput] = useState<number[]>([])
    const {executeCommand} = useStratagem()

    const mapTimers = useRef(new Map())

    const arrowMap = new Map([
        [1, 'up'],
        [2, 'down'],
        [3, 'left'],
        [4, 'right'],
    ])

    useEffect(() => {
        setUserInput([])
        setStrategies(strategies.map(item => {return {...item, is_match: false}}))
    }, [openWindow])

    useEffect(() => {
        setStrategies([...baseStrategies, ...stratagems.filter(item => item.active)])
    }, [stratagems])

    useEffect(() => {
        strategiesRef.current = strategies
    }, [strategies])


    useEffect(() => {
        const handleKeydownEvent = (e: KeyboardEvent) => {
            const inputKey = e.code

            if (e.altKey) {
                e.preventDefault()
                setOpenWindow(true)
            }

            if (e.altKey && isArrayKey(inputKey)) {
                const currentStrategies = strategiesRef.current
                const input = [...userInput, userInputMap[inputKey]]

                for (let strategy of currentStrategies) {
                    if (JSON.stringify(input) == JSON.stringify(strategy.combination)) {
                        executeCommand(strategy?.is_base, strategy.url)
                        setUserInput([])
                        setCloseWindow(false)
                        setOpenWindow(false)
                        setStrategies(strategies.map(item => {return {...item, is_match: false}}))
                    }
                }

                setUserInput(input)
                const result = calculateMatches(input, strategies)
                setStrategies(result)
                const matchesResults = result.filter(item => item.is_match == true)

                if (matchesResults.length === 0) {
                    setUserInput([])
                }
            }

        }

        const handleKeyupEvent = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'alt') {
                if (mapTimers.current.has('sTimer')) {
                    return 
                }
                e.preventDefault()
                setStrategies(strategiesRef.current.map(item => {return {...item, is_match: false}}))
                setUserInput([])

                setCloseWindow(true)
                const timer = setTimeout(() => {
                    setCloseWindow(false)
                    setOpenWindow(false)
                    mapTimers.current.clear()
                }, 400)

                mapTimers.current.set('sTimer', timer)
            }
        }

        window.addEventListener('keydown', handleKeydownEvent)
        window.addEventListener('keyup', handleKeyupEvent)
        return () => {
            window.removeEventListener('keydown', handleKeydownEvent)
            window.removeEventListener('keyup', handleKeyupEvent)
        } 
    }, [userInput, strategies])

    if (openWindow) {
        return (
            createPortal(
                <div className={`stratagem-interface-body ${closeWindow ? 'close' : ''}`}>
                    {strategies.length > 0 && strategies.map((item, index) => (
                        <div className="stratagem-item" key={index}>
                            <div className="stratagem-name">
                                {item.name}
                            </div>

                            <div className="stratagem-coombination">
                                {item.combination.length > 0 && item.combination.map((value, index) => {
                                    if (!item.is_match && userInput.length > 0) {
                                        return <DynamicPngIcon iconName={`deactiveStratagemArrow_${arrowMap.get(value)}`} key={index}/>
                                    } else if (value === userInput[index]) {
                                        return <DynamicPngIcon iconName={`activeStratagemArrow_${arrowMap.get(value)}`} key={index}/>
                                    } else {
                                        return <DynamicPngIcon iconName={`stratagemArrow_${arrowMap.get(value)}`} key={index}/>
                                    }
                                        
                                })}
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )
        )
    } else {
        return null
    }
}

export default StratagemComponent