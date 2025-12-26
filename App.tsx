
import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { TranscriptView } from './components/TranscriptView';
import { AppStatus, TranscriptionResponse } from './types';
import { transcribeAudio } from './services/geminiService';
import { Mic, Headphones, Loader2, Sparkles, AlertTriangle, FileAudio, X } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptionResponse | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleStartTranscription = async () => {
    if (!selectedFile) return;

    try {
      setStatus(AppStatus.UPLOADING);
      setProgressMessage("Preparing audio file...");
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      
      const base64 = await base64Promise;
      
      setStatus(AppStatus.TRANSCRIBING);
      const result = await transcribeAudio(base64, selectedFile.type || 'audio/mpeg', (msg) => {
        setProgressMessage(msg);
      });
      
      setTranscriptData(result);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during transcription.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setSelectedFile(null);
    setTranscriptData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="bg-yellow-400 p-2 rounded-xl">
              <Headphones className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">feva<span className="text-yellow-400">podcast</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-slate-400">
            <a href="#" className="hover:text-yellow-400 transition-colors">Documentation</a>
            <a href="#" className="bg-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors text-black">Internal Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        {status === AppStatus.IDLE && (
          <div className="w-full max-w-4xl space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                Rapid <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Transcription</span> <br />
                for team feva.
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                High-fidelity audio intelligence for internal podcast production. 
                Optimized for large studio files up to 700MB.
              </p>
            </div>

            {!selectedFile ? (
              <FileUploader onFileSelect={handleFileSelect} isProcessing={false} />
            ) : (
              <div className="glass-morphism rounded-2xl p-8 flex flex-col items-center gap-6 max-w-xl mx-auto border-yellow-400/30">
                <div className="bg-yellow-400/10 p-6 rounded-2xl border border-yellow-400/20">
                  <FileAudio className="w-16 h-16 text-yellow-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl truncate max-w-xs text-yellow-400">{selectedFile.name}</p>
                  <p className="text-slate-500 font-mono text-sm">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={reset}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors border border-slate-800 hover:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStartTranscription}
                    className="flex-[2] bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3 rounded-xl font-black uppercase italic flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                  >
                    <Sparkles className="w-5 h-5" />
                    Process Audio
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <FeatureCard 
                icon={<Mic className="text-yellow-400" />} 
                title="SPEAKER DIARIZATION" 
                desc="Precise speaker mapping for interview-heavy feva segments."
              />
              <FeatureCard 
                icon={<Loader2 className="text-yellow-400" />} 
                title="SMART CHAPTERS" 
                desc="Automatic time-stamping for easier post-production workflows."
              />
              <FeatureCard 
                icon={<Sparkles className="text-yellow-400" />} 
                title="TEAM SUMMARIES" 
                desc="Quick internal briefings generated instantly from raw audio."
              />
            </div>
          </div>
        )}

        {(status === AppStatus.UPLOADING || status === AppStatus.TRANSCRIBING) && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-lg w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
              <Loader2 className="w-20 h-20 text-yellow-400 animate-spin relative" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Analyzing Episode</h3>
              <p className="text-yellow-400/80 font-mono tracking-widest text-sm animate-pulse">{progressMessage.toUpperCase()}</p>
              <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden">
                <div className={`h-full bg-yellow-400 transition-all duration-1000 ${status === AppStatus.TRANSCRIBING ? 'w-4/5' : 'w-1/4'}`}></div>
              </div>
              <p className="text-xs text-slate-600 mt-4 uppercase font-bold tracking-tighter">Large studio assets require deep processing. Do not disconnect.</p>
            </div>
          </div>
        )}

        {status === AppStatus.COMPLETED && transcriptData && (
          <div className="w-full animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={reset}
                    className="text-sm font-bold uppercase tracking-tighter text-slate-500 hover:text-yellow-400 transition-colors flex items-center gap-2"
                >
                    <XCircle className="w-4 h-4" />
                    Start New Process
                </button>
            </div>
            <TranscriptView data={transcriptData} />
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-md w-full glass-morphism border-red-500/30 p-8 rounded-2xl flex flex-col items-center text-center gap-6">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic mb-2">System Error</h3>
              <p className="text-slate-400 text-sm font-medium">{error || "The processing pipeline encountered an issue."}</p>
            </div>
            <button 
              onClick={reset}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 py-3 rounded-xl font-bold uppercase tracking-tighter transition-colors text-white"
            >
              Reset Session
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 px-6 border-t border-slate-900 mt-auto bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-xs font-bold tracking-widest uppercase">
          <p>© 2024 FEVA PODCAST INTERNAL. POWERED BY AI.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">Internal Ops</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="glass-morphism p-6 rounded-2xl hover:border-yellow-400/40 transition-all group border-yellow-400/10">
    <div className="bg-black p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform border border-yellow-400/20">
      {icon}
    </div>
    <h4 className="font-black text-sm tracking-tighter uppercase mb-2 group-hover:text-yellow-400 transition-colors">{title}</h4>
    <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
  </div>
);

const XCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

export default App;
