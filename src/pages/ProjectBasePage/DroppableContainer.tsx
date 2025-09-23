import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "./SortableItem"
import { useDroppable,UniqueIdentifier } from "@dnd-kit/core"

import './DroppableContainer.css'

interface Item {
  id: string
  content: string
  name: string
  deadline: string
  title: string;
  status: "BS" | "US" | "NS" | string;
}

export function DroppableContainer({
  id,
  title,
  items,
  activeId,
}: {
  id: string
  title: string
  items: Item[]
  activeId: UniqueIdentifier | null
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
            content={item.content} 
            name={item.name} 
            data={item}
            activeId={activeId}/>
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