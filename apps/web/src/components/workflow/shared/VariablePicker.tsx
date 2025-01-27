import { Button } from "@/components/ui/inputs/button";
import { useWorkflow } from "@/contexts/workflow/WorkflowContext";

interface VariablePickerProps {
  nodeId: string;
  onInsertVariable: (variable: string) => void;
}

export function VariablePicker({
  nodeId,
  onInsertVariable
}: VariablePickerProps) {
  const { nodes } = useWorkflow();

  // Find nodes that can provide data (connected to this node)
  const sourceNodes = nodes.filter(
    (node) => node.type === "SCRAPING" || node.type === "OPENAI"
  );

  return (
    <div className='p-2 space-y-2'>
      <h4 className='font-medium'>Insert Variable</h4>
      <div className='space-y-1'>
        {sourceNodes.map((node) => {
          const nodeLabel = node.data?.label || node.type;
          return (
            <Button
              key={node.id}
              variant='ghost'
              className='w-full justify-start text-sm'
              onClick={() => onInsertVariable(`{{${nodeLabel}.results}}`)}
            >
              {nodeLabel}
            </Button>
          );
        })}
        {sourceNodes.length === 0 && (
          <p className='text-sm text-muted-foreground p-2'>
            No data source nodes connected. Add a Scraping or OpenAI node and
            connect it to this node.
          </p>
        )}
      </div>
    </div>
  );
}
