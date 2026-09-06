import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "./SortableItem"
import { useDroppable,UniqueIdentifier } from "@dnd-kit/core"

import './DroppableContainer.css'

type TaskStatus = "US" | "NS"| "BS"

interface TaskData {
    created_at: string;
    deadline: string;
    description: string;
    id: number;
    is_performer: boolean
    name: string;
    project: number;
    project_name: string;
    status: TaskStatus
}

export function DroppableContainer({
  id,
  title,
  items,
  activeId,
  groupId,
  projectId
}: {
  id: string
  title: string
  items: TaskData[]
  activeId: UniqueIdentifier | null
  groupId: string | undefined
  projectId: string | undefined
}) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className="droppable-container__body"
    >
      <h3 className="droppable-container__title">
        {title}
      </h3>
      <div className="">
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
        <ul className={`task-column-content`}>
          {items.map((item) => (
            <SortableItem 
            id={item.id} 
            key={item.id} 
            status={item.status}
            deadline={item.deadline}
            name={item.name} 
            data={item}
            activeId={activeId}
            groupId={groupId}
            projectId={projectId}/>
          ))}
        </ul>
        </SortableContext>

        {items.length === 0 && (
          <div className="">
            <p className="">
              No Tasks
            </p>
          </div>
        )}
      </div>
    </div>
  )
}