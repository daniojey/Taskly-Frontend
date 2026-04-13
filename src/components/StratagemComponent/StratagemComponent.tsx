import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import './StratagemComponent.css'
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";
import { useStratagem } from "../../common/hooks/stratagemHook";

const userInputMap = {
    "w": 1,
    's': 2,
    'a': 3,
    'd': 4,
}

interface StratagemItem {
    name: string,
    coombination: number[],
    is_match: boolean
}

function calculateMatches (short: number[], strategies: StratagemItem[]) {
    let resultData: StratagemItem[] = []
    console.log(short)

    for (let item of strategies) {
        const is_match = short.every((value, index) => {
            console.log(value)
            console.log(item.coombination[index])
            return value === item.coombination[index]
        })
        console.log(is_match)
        let new_item = item
        
        new_item.is_match = is_match
        console.log(new_item)
        resultData = [...resultData, new_item]
    }

    return resultData
}

function isArrayKey(key: string): key is keyof typeof userInputMap {
    return key in userInputMap
}

function StratagemComponent() {
    const [strategies, setStrategies] = useState<StratagemItem[]>([
        {name: 'groups', coombination: [1, 1, 2, 4], is_match: false},
        {name: 'active tasks', coombination: [2, 2, 2, 3, 2, 2, 4], is_match: false},
        {name: 'need motivation', coombination: [3, 4, 4, 3], is_match: false}
    ])

    const [openWindow, setOpenWindow] = useState<boolean>(false)
    const [userInput, setUserInput] = useState<number[]>([])
    const {executeCommand} = useStratagem()

    const arrowMap = new Map([
        [1, 'up'],
        [2, 'down'],
        [3, 'left'],
        [4, 'right'],
    ])


    useEffect(() => {
        const handleKeydownEvent = (e: KeyboardEvent) => {
            const inputKey = e.key.toLowerCase()

            if (e.shiftKey) {
                e.preventDefault()
                setOpenWindow(true)
            }

            if (e.shiftKey && isArrayKey(inputKey)) {
                const input = [...userInput, userInputMap[inputKey]]
                for (let strategy of strategies) {
                    console.log(input, strategy.coombination)

                    if (JSON.stringify(input) == JSON.stringify(strategy.coombination)) {
                        executeCommand(strategy.name)
                    }
                }

                setUserInput(input)
                const result = calculateMatches(input, strategies)
                console.log(result)
                const matchesResults = result.filter(item => item.is_match == true)
                console.log(matchesResults)

                if (matchesResults.length === 0) {
                    setUserInput([])
                }
            }

        }

        const handleKeyupEvent = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'shift') {
                e.preventDefault()
                setOpenWindow(false)
                setUserInput([])
                setStrategies(strategies.map(item => {return {...item, is_match: false}}))
            }
        }

        window.addEventListener('keydown', handleKeydownEvent)
        window.addEventListener('keyup', handleKeyupEvent)
        return () => {
            window.removeEventListener('keydown', handleKeydownEvent)
            window.removeEventListener('keyup', handleKeyupEvent)
        } 
    }, [userInput])

    if (openWindow) {
        return (
            createPortal(
                <div className="stratagem-interface-body">
                    {strategies.length > 0 && strategies.map(item => (
                        <div className="stratagem-item">
                            <div className="stratagem-name">
                                {item.name}
                            </div>

                            <div className="stratagem-coombination">
                                {item.coombination.length > 0 && item.coombination.map((value, index) => {
                                    if (!item.is_match && userInput.length > 0) {
                                        return <DynamicPngIcon iconName={`deactiveStratagemArrow_${arrowMap.get(value)}`}/>
                                    } else if (value === userInput[index]) {
                                        return <DynamicPngIcon iconName={`activeStratagemArrow_${arrowMap.get(value)}`}/>
                                    } else {
                                        return <DynamicPngIcon iconName={`stratagemArrow_${arrowMap.get(value)}`}/>
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