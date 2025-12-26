
import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|flac)$/i)) {
        onFileSelect(file);
        setError(null);
      } else {
        setError("Invalid format. Please use MP3, WAV, or M4A.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group border-2 border-dashed rounded-3xl p-16 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
          ${dragActive ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800 bg-black hover:border-yellow-400/30'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="audio/*"
          disabled={isProcessing}
        />
        
        <div className="bg-yellow-400/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-yellow-400/10">
          <Upload className="w-12 h-12 text-yellow-400" />
        </div>
        
        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Ingest Media</h3>
        <p className="text-slate-500 mb-6 text-sm font-medium max-w-xs uppercase tracking-tight">
          Drop studio assets here.
          <br />Supports large files up to 700MB.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black tracking-widest uppercase text-yellow-400/60">
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">MP3</span>
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">WAV</span>
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">M4A</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/20 font-bold uppercase text-xs tracking-tighter">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
