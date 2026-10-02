import React from 'react';
import { DocumentRequirement } from '@scholarship-finder/shared';
import { FileText, CheckCircle2 } from 'lucide-react';

interface DocumentsListProps {
  documents: DocumentRequirement[];
}

export const RequiredDocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-2">
        Standard identity and academic documents required. Check the official portal instructions.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {documents.map((doc, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-bold text-slate-900">{doc.name}</span>
              {doc.is_mandatory && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Required
                </span>
              )}
            </div>
            <p className="text-slate-500 leading-snug">{doc.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
