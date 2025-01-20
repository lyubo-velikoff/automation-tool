"use client";

import { useState } from "react";
import OpenAISettingsDialog from "@/components/workflow/OpenAISettingsDialog";
import ConnectionStatus from "@/components/workflow/ConnectionStatus";
import { Header } from "@/components/ui/Header";

export default function ConnectionsPage() {
  const [openAISettingsOpen, setOpenAISettingsOpen] = useState(false);

  return (
    <>
      <Header />
      <div className='container mx-auto py-8'>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='flex flex-col gap-4'>
            <ConnectionStatus
              onOpenAISettings={() => setOpenAISettingsOpen(true)}
            />
          </div>
        </div>

        <OpenAISettingsDialog
          open={openAISettingsOpen}
          onOpenChange={setOpenAISettingsOpen}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    </>
  );
}
