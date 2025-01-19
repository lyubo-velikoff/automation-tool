import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@apollo/client';
import { VALIDATE_OPENAI_CONNECTION } from '@/graphql/mutations';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OpenAISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function OpenAISettingsDialog({
  open,
  onOpenChange,
  onSuccess,
}: OpenAISettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [validateOpenAI] = useMutation(VALIDATE_OPENAI_CONNECTION);

  const handleSave = async () => {
    try {
      // Store API key in Supabase
      const { error: storageError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          openai_api_key: apiKey,
          updated_at: new Date().toISOString(),
        });

      if (storageError) {
        throw storageError;
      }

      // Validate the connection
      const { data } = await validateOpenAI({
        variables: { apiKey },
      });

      if (data?.validateOpenAIConnection) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error('Failed to validate OpenAI connection');
      }
    } catch (error) {
      console.error('Failed to validate OpenAI connection:', error);
      alert('Failed to validate OpenAI API key. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key to use AI features in your workflows.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your API key will be stored securely and used only for your workflow operations.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
