import { memo } from "react";
import { NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import NodeSelector from "@/components/workflow/toolbar/NodeSelector";

// Memoized node component
export const BasicNode = memo((props: NodeProps) => {
  return (
    <div
      className={cn(
        "rounded-lg shadow-lg border min-w-[350px]",
        "bg-background text-foreground"
      )}
      data-testid={`node-${props.type.toLowerCase()}`}
    >
      <div className='custom-drag-handle p-2 border-b bg-muted/50 cursor-move'>
        {props.data?.label || `${props.type} Node`}
      </div>
      <NodeSelector {...props} />
    </div>
  );
});
BasicNode.displayName = "BasicNode";
