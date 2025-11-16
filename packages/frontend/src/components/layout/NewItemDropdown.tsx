import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, FileText, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import { CreateCollectionModal } from '../features/CreateCollectionModal';

export function NewItemDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const handleNewPrompt = () => {
    setIsOpen(false);
    navigate('/prompts/new');
  };

  const handleNewCollection = () => {
    setIsOpen(false);
    setIsCollectionModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="default"
          size="default"
          className="gap-1.5 h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className="h-4 w-4" />
          <span>New</span>
          <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
        </Button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-lg z-20">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2"
                onClick={handleNewPrompt}
              >
                <FileText className="h-4 w-4" />
                New Prompt
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2"
                onClick={handleNewCollection}
              >
                <Layers className="h-4 w-4" />
                New Collection
              </Button>
            </div>
          </>
        )}
      </div>

      <CreateCollectionModal
        open={isCollectionModalOpen}
        onOpenChange={setIsCollectionModalOpen}
      />
    </>
  );
}

