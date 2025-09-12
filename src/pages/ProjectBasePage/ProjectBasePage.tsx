import { useEffect, useState } from 'react'

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


import "./ProjectBasePage.css"
import { DroppableContainer } from './DroppableContainer'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import { useParams } from 'react-router'
import { updateTask } from '../../common/task_requests'

interface Item {
  id: string
  content: string
  name: string
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
        <span>:</span>
        <span>{children}</span>
      </div>
    </div>
  )
}

export default function MultipleContainers() {
  const { projectId } = useParams()
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

  useEffect(() => {
    const getTasks = async () => {
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
        const baseTasks = allTasks.filter(task => task.status === "BS")
        const urgentTasks = allTasks.filter(task => task.status === "US") 
        const noStatusTasks = allTasks.filter(task => task.status === "NS")


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

      } catch (error) {
        console.error(error)
      }
    }

    getTasks()
  }, [])



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

      updateTask(projectId, active, overContainerId)

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


  return (
    <div className="mx-auto w-full">
      {/* <h2 className="mb-4 text-xl font-bold dark:text-white">Kanb</h2> */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="task-base__container-body">
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
                <div>
                  {getActiveItem()?.name}
                </div>
              </ItemOverlay>
            ) : null
          }
        </DragOverlay>
      </DndContext>
    </div>
  )
}