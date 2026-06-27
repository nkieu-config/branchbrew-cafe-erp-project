"use client";

import { ReactNode } from "react";
import { GripHorizontal } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { dashboardDragActiveClass, dashboardDragHandleClass } from "@/lib/theme";
import { cn } from "@/lib/utils";

function SortableWidget({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative group", className, dashboardDragActiveClass(isDragging))}
    >
      <div {...attributes} {...listeners} className={dashboardDragHandleClass()}>
        <GripHorizontal className="w-5 h-5" />
      </div>
      {children}
    </div>
  );
}

type DashboardSortableGridProps = {
  widgetOrder: string[];
  onReorder: (order: string[]) => void;
  renderWidget: (id: string) => ReactNode;
  getWidgetClassName?: (id: string) => string;
};

export function DashboardSortableGrid({
  widgetOrder,
  onReorder,
  renderWidget,
  getWidgetClassName,
}: DashboardSortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id.toString());
      const newIndex = widgetOrder.indexOf(over.id.toString());
      onReorder(arrayMove(widgetOrder, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 auto-rows-[minmax(200px,auto)]">
          {widgetOrder.map((id) => (
            <SortableWidget key={id} id={id} className={getWidgetClassName?.(id)}>
              {renderWidget(id)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
