import React, { useCallback, useEffect, useState } from 'react'


import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'


import "./ProjectBasePage.css"
import './DroppableContainer.css'
import './SortableItem.css'
import { DroppableContainer } from './DroppableContainer'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import { useParams } from 'react-router'
import { updateTask } from '../../common/task_requests'
import { truncateString } from '../../common/truncate'
import CreateTaskWindow from '../../components/CreateTaskWindow/CreateTaskWindow'
import DetailTaskWindow from '../../components/DetailTaskWindow/DetailTaskWindow'
import DeleteWindow from '../../components/DeleteWindow/DeleteWindow'
import DeleteWindowProject from '../../components/DeleteWindowProject/DeleteWindowProject'
import { createPortal } from 'react-dom'


interface Item {
  id: string
  content: string
  name: string
  deadline: string
  title: string;
  status: "BS" | "US" | "NS" | string;
}


interface Container {
  id: string;
  title: string;
  items: Item[];
}


function ItemOverlay({ children } : { children: React. ReactNode}) {
  return (
    <div>
      <div className='draggble-item overlay'>
        <span>{children}</span>
      </div>
    </div>
  )
}

export default function MultipleContainers() {
  const { projectId } = useParams()
  const [moreWindow, setMoreWindow] = useState(false)
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const [tasks, setTasks] = useState<Item[]>([])
  const [deleteWindow, setDeleteWindow] = useState(false)
  const [containers, setContainers] = useState<Container[]>([
    {
      id: 'base-status',
      title: 'To Do',
      items: [],
    },
    {
      id: 'urgent-status',
      title: 'In Progress',
      items: [],
    },
    {
      id: 'no-status',
      title: 'Done',
      items: [],
    },
  ])

  const getTasks = useCallback( async () => {
    try {
        const response = await api.get(
          `api/v1/groups-projects/${projectId}/`,
          {headers: {
            Authorization: getAccessToken()
          }}
        )
        console.log(response.data.result)

        const allTasks = response.data.result.tasks

        // Фильтруем задачи по статусам
        const baseTasks = allTasks.filter((task: Item) => task.status === "BS")
        const urgentTasks = allTasks.filter((task: Item) => task.status === "US") 
        const noStatusTasks = allTasks.filter((task: Item) => task.status === "NS")
        
        setTasks(allTasks)
        setContainers([
          {
            id: 'base-status',
            title: 'Process tasks',
            items: baseTasks,
          },
          {
            id: 'urgent-status',
            title: 'Urgent tasks',
            items: urgentTasks,
          },
          {
            id: 'no-status',
            title: 'No status',
            items: noStatusTasks,
          },
        ])

        return await response.data.result
      } catch (error) {
        console.error(error)

        return false
      }
  }, [])


  const handleTaskCreate = useCallback(() => {
    getTasks()
  }, []);


  useEffect(() => {
    getTasks()
  }, []);


  void setContainers

  const [activeId, setActiveId] =
    useState<UniqueIdentifier | null>(null)
  void activeId

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement require
      }
    }),
    useSensor(KeyboardSensor),
  )

  function findContainerId(
    itemId: UniqueIdentifier,
  ) : UniqueIdentifier | undefined {
    if (containers.some((container) => container.id === itemId)) {
      return itemId
    }

    return containers.find((container) => 
      container.items.some((item) => item.id ===
      itemId)
    )?.id
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function handleDragOver(event: DragOverEvent) {
    const {active, over} = event
    // console.log(active, '--', over)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeContainerId = findContainerId(activeId)
    const overContainerId = findContainerId(overId)

    console.log('activecontainer', activeContainerId, 'overContainer', overContainerId)
    console.log('activeId', active.id, 'overId', over.id)

    if (activeContainerId === overContainerId &&
      activeId !== overId) {
        return
    }

    if (activeContainerId === overContainerId) return

    setContainers((prev) => {
      console.log('PREV',prev)
      const activeContainer = prev.find((c) => c.id === activeContainerId)

      if (!activeContainer) return prev

      const activeItem = activeContainer.items.find(
        (item) => item.id === activeId,        
      )
      console.log(activeItem)
      if (!activeItem) return prev

      const newContainers = prev.map((container) => {
        // Если контейнер изменён то удалям перетаскеваемые елемент со старого
        if (container.id === activeContainerId) {
          console.log('CONTAINER ID == ACTIVECONTAINERID')
          return {
            ...container,
            items: container.items.filter((item) =>
            item.id !== activeId)
          }
        }

        if (container.id === overContainerId) {
          console.log('CONTAINER ID == OVERCONTAINERID')
          
          // В зависимости от условий добавляем елемент либо в конец либо в нужную позицию в новом контейнере
          if (overId === overContainerId) {
            return {
              ...container,
              items: [...container.items, activeItem]
            }
          }

          const overItemIndex = container.items.
          findIndex(
            (item) => item.id === overId,
          )

          console.log("OVERITEM", overItemIndex)

          if (overItemIndex !== -1) {
            return {
              ...container,
              items: [
                ...container.items.slice(0,
                  overItemIndex + 1),
                  activeItem,
                  ...container.items.slice
                  (overItemIndex + 1),
              ],
            }
          }
        }

        return container
      })
      return newContainers
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    console.log('ACTIVE', active, 'OVER', over)

    if (!over) {
      setActiveId(null)
      return
    }

    const activeContainerId = findContainerId(active.id)
    const overContainerId = findContainerId(over.id)

    console.log('activecontainer', activeContainerId, 'overContainer', overContainerId)
    console.log('activeId', active.id, 'overId', over.id)
    console.log('ACTIVE ELEMENT', active)

    if (!activeContainerId || !overContainerId) {
      setActiveId(null)
      return
    }

    if (activeContainerId === overContainerId &&
      active.id !== over.id) {
        console.log('LOLLLLLLLLLLLLLLL')
        const containerIndex = containers.findIndex(
          (c) => c.id === activeContainerId,
        )

        if (containerIndex === -1) {
          setActiveId(null)
          return
        }

        const container = containers[containerIndex]
        const activeIndex = container.items.findIndex(
          (item) => item.id === active.id,
        )
        const overIndex = container.items.findIndex(
          (item) => item.id === over.id
        )

        if (activeIndex !== -1 && overIndex !== -1) {
          const newItems = arrayMove(container.items,
            activeIndex, overIndex
          )

          setContainers((containers) => {
            return containers.map((c, i) => {
              if (i === containerIndex) {
                return { ...c, items: newItems }
              }
              return c
            })
          })
        }
      }

      const update =  async () => {
        const tasks = containers.map(
          container => container.items.filter(
              item => item.id === active.id
          )
        ).filter(array => array.length != 0)[0][0]

         console.log('TASK FINDED', tasks)

        const result = await updateTask(projectId, active, overContainerId, tasks.status)

        if (result) {
          console.log('SUCCESS!')
          await getTasks()
        }
      }

      update()

      // updateTask(projectId, active, overContainerId)

      setActiveId(null)
  }

  const getActiveItem = () => {
    for (const container of containers) {
      const item = container.items.find((item) =>
      item.id === activeId)
      if (item) return item
    }
    return null
  }

  const createTaskWindow = () => {
    setOpenCreateTask(!openCreateTask)
  }

  
  const { isPending, error, data} = useQuery({
    queryKey: ['updateTasks'],
    queryFn: getTasks
  })


  const bodyClick = async (e: React.MouseEvent<HTMLDivElement>) => {

    if (e.target instanceof HTMLElement) {
        if (!e.target.className.includes('task-base__title-more-info') && moreWindow) {
          setMoreWindow(false);
        }
    }
  }

  return (
    <div className="project-base-container__body" onClick={bodyClick}>
      <div className={`delete-window__overlay ${deleteWindow ? 'show': ''}`}></div>

      {deleteWindow && (
        <DeleteWindowProject projectId={projectId} onClose={() => setDeleteWindow(false)}/>
      )}



      <div className='task-base__title-body'>
        <button id='createTask' onClick={createTaskWindow}>Create task</button>
        <button onClick={() => setMoreWindow(!moreWindow)}>⋮</button>

        <div className={`task-base__title-more-info ${moreWindow ? 'show' : ''}`} >
          <p id='settings'>Settings</p>
          <p id='info'>Info</p>
          <p id='delete' onClick={() => setDeleteWindow(true)}>Delete Project</p>
        </div>

      </div>

      { openCreateTask && (
        <CreateTaskWindow onClose={() => setOpenCreateTask(false)} onUpdate={() => handleTaskCreate()}projectId={projectId}/>
      )}
      {/* <h2 className="mb-4 text-xl font-bold dark:text-white">Kanb</h2> */}


      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="task-base__container-body">
          <div className='task-base__container-info-table'>
            <h2>Info Table</h2>
            <p>count tasks: {Object.entries(tasks).length}</p>
            <p>urgent tasks: {tasks.filter(task => task.status === "US").length}</p>
          </div>

            {containers.map((container) => (
              <DroppableContainer
              key={container.id}
              id={container.id}
                title={container.title}
                items={container.items}
                activeId={activeId}
                />
              ))}

        </div>
        <DragOverlay>
          {
            activeId ? (
              <ItemOverlay>
                <div className='draggble-item__container'>
                  <div>{truncateString(getActiveItem()?.name, 10)}</div>
                  {/* <div>{getActiveItem()?.deadline}</div> */}
                </div>
              </ItemOverlay>
            ) : null
          }
        </DragOverlay>
      </DndContext>
    </div>
  )
}