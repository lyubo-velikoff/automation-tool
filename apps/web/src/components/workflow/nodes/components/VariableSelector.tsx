import { useQuery } from "@apollo/client";
import { GET_NODE_VARIABLES } from "@/graphql/workflow";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/inputs/select";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Badge } from "@/components/ui/data-display/badge";
import { Skeleton } from "@/components/ui/feedback/skeleton";

interface VariableSelectorProps {
  sourceNodeId: string;
  sourceNodeName: string;
  nodeResults: string;
  onSelect: (reference: string) => void;
  value?: string;
  className?: string;
}

interface Variable {
  reference: string;
  preview: string;
  type: string;
}

export function VariableSelector({
  sourceNodeId,
  sourceNodeName,
  nodeResults,
  onSelect,
  value,
  className
}: VariableSelectorProps) {
  const { data, loading, error } = useQuery(GET_NODE_VARIABLES, {
    variables: {
      nodeId: sourceNodeId,
      nodeName: sourceNodeName,
      results: nodeResults
    },
    skip: !nodeResults
  });

  if (loading) {
    return <Skeleton className='h-10 w-full' />;
  }

  if (error || !data) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder='Error loading variables' />
        </SelectTrigger>
      </Select>
    );
  }

  const { variables } = data.getNodeVariables;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className={className}>
        <SelectValue placeholder='Select a variable' />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className='h-[300px]'>
          <SelectGroup>
            <SelectLabel>Available Variables</SelectLabel>
            {variables.map((variable: Variable) => (
              <SelectItem
                key={variable.reference}
                value={variable.reference}
                className='flex items-center justify-between'
              >
                <div className='flex items-center gap-2'>
                  <span>{variable.reference}</span>
                  <Badge variant='outline'>{variable.type}</Badge>
                </div>
                <span className='text-xs text-muted-foreground truncate max-w-[200px]'>
                  {variable.preview}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
