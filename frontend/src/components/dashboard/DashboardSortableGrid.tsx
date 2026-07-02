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
import { dashboardDragHandleBarClass, dashboardGridClass, dashboardSortableShellClass } from "@/lib/theme/dashboard";

export const DASHBOARD_WIDGET_LABELS: Record<string, string> = {
  sales: "Today's Sales",
  topBranch: "Branch Performance",
  lowStock: "Inventory Alerts",
  topProducts: "Top 3 Best Sellers",
  salesChart: "Revenue Overview",
};

function SortableWidget({
  id,
  children,
  className,
  label,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const widgetLabel = label ?? DASHBOARD_WIDGET_LABELS[id] ?? "Dashboard widget";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={dashboardSortableShellClass(isDragging, className)}
    >
      <div
        {...attributes}
        {...listeners}
        className={dashboardDragHandleBarClass()}
        aria-label={`Drag to reorder ${widgetLabel}`}
      >
        <GripHorizontal className="w-3.5 h-3.5" aria-hidden />
        <span className="hidden sm:inline opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
          Reorder
        </span>
      </div>
      <div className="min-w-0 flex-1 [&_.dashboard-widget]:rounded-t-none [&_.dashboard-widget]:border-t-0">
        {children}
      </div>
    </div>
  );
}

export type DashboardWidgetDefinition = {
  content: ReactNode;
  className?: string;
  label?: string;
};

export type DashboardWidgetRegistry = Record<string, DashboardWidgetDefinition>;

type DashboardSortableGridProps = {
  widgetOrder: string[];
  onReorder: (order: string[]) => void;
  widgets: DashboardWidgetRegistry;
};

export function DashboardSortableGrid({
  widgetOrder,
  onReorder,
  widgets,
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
        <div className={dashboardGridClass()}>
          {widgetOrder.map((id) => {
            const widget = widgets[id];
            if (!widget) return null;

            return (
              <SortableWidget key={id} id={id} className={widget.className} label={widget.label}>
                {widget.content}
              </SortableWidget>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
