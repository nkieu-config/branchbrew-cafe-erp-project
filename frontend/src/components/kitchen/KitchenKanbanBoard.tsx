"use client";

import { ReactNode } from "react";
import { CheckCircle2, Clock, PackageOpen, PlayCircle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ProductionOrder, Ingredient } from "@/types/api";
import { formatDate } from "@/lib/intl-date";
import {
  hubAccentIconClass,
  kanbanCardClassName,
  kanbanColumnClassName,
  kanbanColumnHeaderClassName,
  kanbanMetaChipClassName,
  kanbanOrderBadgeClassName,
  metricValueClassName,
  productionColumnTone,
  text,
} from "@/lib/theme";
import type { StatusTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type ProductionOrderWithTarget = ProductionOrder & { targetIngredient: Ingredient };

function KanbanColumn({
  id,
  title,
  icon,
  tone,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  tone: StatusTone;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={kanbanColumnClassName(isOver)}>
      <div className={kanbanColumnHeaderClassName(tone)}>
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[500px]">{children}</div>
    </div>
  );
}

function KanbanCard({ order, isOverlay = false }: { order: ProductionOrderWithTarget; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={kanbanCardClassName(isOverlay)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={kanbanOrderBadgeClassName()}>{order.orderNumber}</span>
        {order.status === "COMPLETED" && (
          <CheckCircle2 className={cn("w-4 h-4", metricValueClassName("emerald"))} />
        )}
      </div>
      <div className={cn("font-bold flex items-center gap-2 mb-1", text.primary)}>
        <PackageOpen className={hubAccentIconClass("kitchen", "w-4 h-4 shrink-0")} />
        <span className="truncate">{order.targetIngredient?.name}</span>
      </div>
      <div className={cn("text-sm font-black", text.secondary)}>
        {order.quantityToProduce}{" "}
        <span className={cn("text-xs font-bold", text.muted)}>{order.targetIngredient?.unit}</span>
      </div>
      {order.plannedStartDate && (
        <div className={kanbanMetaChipClassName()}>
          <Clock className="w-3 h-3" />
          {formatDate(order.plannedStartDate)}
        </div>
      )}
    </div>
  );
}

type KitchenKanbanBoardProps = {
  plannedOrders: ProductionOrderWithTarget[];
  inProgressOrders: ProductionOrderWithTarget[];
  completedOrders: ProductionOrderWithTarget[];
  activeOrder: ProductionOrderWithTarget | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function KitchenKanbanBoard({
  plannedOrders,
  inProgressOrders,
  completedOrders,
  activeOrder,
  onDragStart,
  onDragEnd,
}: KitchenKanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        <KanbanColumn
          id="PLANNED"
          title="Planned"
          icon={<Clock className="w-5 h-5" />}
          tone={productionColumnTone("PLANNED")}
        >
          {plannedOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>

        <KanbanColumn
          id="IN_PROGRESS"
          title="In Progress"
          icon={<PlayCircle className="w-5 h-5" />}
          tone={productionColumnTone("IN_PROGRESS")}
        >
          {inProgressOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>

        <KanbanColumn
          id="COMPLETED"
          title="Completed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          tone={productionColumnTone("COMPLETED")}
        >
          {completedOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>
      </div>
      <DragOverlay>{activeOrder ? <KanbanCard order={activeOrder} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
}
