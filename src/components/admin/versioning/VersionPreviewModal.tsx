
import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentVersion } from './types';

interface VersionPreviewModalProps {
  version: ContentVersion | null;
  onClose: () => void;
}

export function VersionPreviewModal({ version, onClose }: VersionPreviewModalProps) {
  if (!version) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Preview - Versão {version.version}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="prose max-w-none">
            <h3>{version.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: version.content }} />
          </div>
        </div>
      </div>
    </div>
  );
}
