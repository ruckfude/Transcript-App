
import React, { useState } from 'react';
import { TranscriptionResponse } from '../types';
import { Search, Copy, Check, Download, List, MessageSquare } from 'lucide-react';

interface TranscriptViewProps {
  data: TranscriptionResponse;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ data }) => {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredTranscript = data.transcript.filter(seg => 
    seg.text.toLowerCase().includes(search.toLowerCase()) || 
    seg.speaker.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = () => {
    const text = data.transcript.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranscript = () => {
    const text = data.transcript.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEVA_${data.metadata.title.replace(/\s+/g, '_')}_TRANSCRIPT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-morphism p-8 rounded-3xl border-yellow-400/20">
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{data.metadata.title}</h2>
          <div className="flex flex-wrap gap-2">
            {data.metadata.speakers.map(speaker => (
              <span key={speaker} className="text-[10px] font-black tracking-widest uppercase bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                {speaker}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/50 text-slate-300 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={downloadTranscript}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all shadow-lg shadow-yellow-400/10"
          >
            <Download className="w-4 h-4" />
            Export Assets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Chapters & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism rounded-3xl p-6 border-yellow-400/10">
            <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2 mb-6 text-yellow-400">
              <List className="w-4 h-4" />
              Timeline
            </h3>
            <div className="space-y-5">
              {data.metadata.chapters.map((chapter, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="text-[10px] font-mono font-bold text-yellow-400/50 mb-1">{chapter.time}</div>
                  <div className="text-xs font-black uppercase tracking-tight text-slate-300 group-hover:text-yellow-400 transition-colors">
                    {chapter.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-morphism rounded-3xl p-6 border-yellow-400/10">
            <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2 mb-6 text-yellow-400">
              <MessageSquare className="w-4 h-4" />
              Intelligence
            </h3>
            <p className="text-xs font-medium leading-relaxed text-slate-500 uppercase">
              {data.metadata.summary}
            </p>
          </div>
        </div>

        {/* Main Transcript Content */}
        <div className="lg:col-span-3 glass-morphism rounded-3xl overflow-hidden border-yellow-400/10 flex flex-col">
          <div className="p-5 border-b border-slate-900 flex items-center gap-4 bg-black">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              <input 
                type="text" 
                placeholder="FILTER TRANSCRIPT..." 
                className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-12 pr-4 py-3 text-xs font-black tracking-widest focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 h-[700px] overflow-y-auto space-y-8 bg-black/40">
            {filteredTranscript.map((seg, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="hidden sm:block text-[10px] font-mono font-bold text-slate-700 mt-1 whitespace-nowrap group-hover:text-yellow-400/40 transition-colors">
                  {seg.timestamp}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-yellow-400 text-xs uppercase tracking-tighter italic">
                      {seg.speaker}
                    </span>
                    <span className="sm:hidden text-[10px] font-mono text-slate-700">
                      {seg.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed group-hover:text-white transition-colors">
                    {seg.text}
                  </p>
                </div>
              </div>
            ))}
            {filteredTranscript.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-800 font-black uppercase tracking-widest italic text-sm">
                NO RECORDS MATCHING CRITERIA
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
