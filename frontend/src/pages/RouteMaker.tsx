import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouteMakerStore, calculateWalkTimeMin } from '../store/useRouteMakerStore';
import type { RouteStop } from '../store/useRouteMakerStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';
import Skeleton from '../components/Skeleton';

// --- Sortable Item Component ---
const SortableStopItem = ({ stop }: { stop: RouteStop }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const removeStop = useRouteMakerStore((s) => s.removeStop);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface-container-low border border-white/5 p-4 rounded-xl mb-1 flex items-center gap-4 group hover:border-primary/20 transition-all">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 transition-colors p-2 -ml-2">
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>
      <div className="flex-1">
        <h4 className="font-headline font-bold text-sm text-on-surface">{stop.name}</h4>
        <span className="font-label text-[10px] uppercase text-zinc-500">Route {stop.route_id.substring(0, 4)}</span>
      </div>
      <button onClick={() => removeStop(stop.id)} className="text-zinc-600 hover:text-error transition-colors p-2">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

// --- Main Page Component ---
const RouteMaker: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentStops, routeName, setRouteName, addStop, reorderStops, clearStops } = useRouteMakerStore();
  
  const [allStops, setAllStops] = useState<RouteStop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const deepLinkLoaded = useRef(false);

  useEffect(() => {
    api.get('/stops').then(res => setAllStops(res.data)).catch(console.error);
  }, []);

  // Deep-link loader: pre-populate from ?stops=id1,id2&name=...
  useEffect(() => {
    if (deepLinkLoaded.current) return;
    const stopIds = searchParams.get('stops');
    const sharedName = searchParams.get('name');
    if (!stopIds || allStops.length === 0 || currentStops.length > 0) return;
    const ids = stopIds.split(',').filter(Boolean);
    const matched = ids.map((id) => allStops.find((s) => s.id === id)).filter(Boolean) as RouteStop[];
    if (matched.length === 0) return;
    deepLinkLoaded.current = true;
    matched.forEach((s) => addStop(s));
    if (sharedName) setRouteName(decodeURIComponent(sharedName));
    toast.success(`Loaded shared route: ${matched.length} stops`);
  }, [allStops, searchParams, currentStops.length, addStop, setRouteName]);

  const fuse = useMemo(() => new Fuse(allStops, { keys: ['name'], threshold: 0.3 }), [allStops]);
  const searchResults = searchQuery ? fuse.search(searchQuery).map(r => r.item) : allStops.slice(0, 10);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = currentStops.findIndex((s) => s.id === active.id);
    const newIndex = currentStops.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderStops(oldIndex, newIndex);
  };

  const handleSave = async () => {
    if (currentStops.length < 2) {
      toast.error('Add at least 2 stops to save a route');
      return;
    }
    if (!routeName) {
      toast.error('Please name your route');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/user/routes', {
        name: routeName,
        stop_ids: currentStops.map(s => s.id),
      });
      toast.success('Route saved successfully!');
      // Could navigate to dashboard or show saved routes list
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to save route'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="flex-none px-6 py-4 bg-zinc-950/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-['Inter'] font-black tracking-tighter text-xl text-[#39FF14]">ROUTE MAKER</h1>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={routeName} 
            onChange={(e) => setRouteName(e.target.value)} 
            placeholder="Name your route..."
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:border-[#39FF14] outline-none w-64"
          />
          <button onClick={clearStops} className="text-zinc-500 hover:text-white text-sm font-label uppercase">Clear</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || currentStops.length < 2 || !routeName}
            className="bg-[#39FF14] text-black px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Route'}
          </button>
          <button
            onClick={() => {
              if (currentStops.length < 2) { toast.error('Add at least 2 stops to share'); return; }
              const ids = currentStops.map(s => s.id).join(',');
              const url = `${window.location.origin}/route-maker?stops=${ids}&name=${encodeURIComponent(routeName || 'My Route')}`;
              navigator.clipboard.writeText(url).then(() => toast.success('Deep-link copied to clipboard!'));
            }}
            className="text-zinc-400 hover:text-primary transition-colors p-2"
            title="Copy share link"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Stop Picker */}
        <section className="w-1/3 bg-surface border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
              <input 
                type="text" 
                placeholder="Search stops..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {allStops.length === 0 ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-surface-container-low flex items-center justify-between">
                  <Skeleton variant="text" className="w-2/3 h-5" />
                  <Skeleton variant="circle" className="w-8 h-8" />
                </div>
              ))
            ) : (
              searchResults.map(stop => {
                const isAdded = currentStops.some(s => s.id === stop.id);
                return (
                  <div key={stop.id} className={`p-4 rounded-xl border ${isAdded ? 'border-primary/30 bg-primary/5 opacity-50' : 'border-white/5 bg-surface-container-low hover:border-zinc-600'} flex items-center justify-between transition-all`}>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-zinc-200">{stop.name}</h4>
                    </div>
                    <button 
                      disabled={isAdded}
                      onClick={() => addStop(stop)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isAdded ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-sm">{isAdded ? 'check' : 'add'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Panel: Route Builder */}
        <section className="w-2/3 bg-zinc-950 flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-8 lg:px-24 py-12">
            {currentStops.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">route</span>
                <p className="font-label uppercase tracking-widest text-xs">Add stops from the left panel</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={currentStops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0 pt-4">
                    {currentStops.map((stop, index) => {
                      let walkTime = null;
                      if (index > 0) {
                        const prev = currentStops[index - 1];
                        walkTime = calculateWalkTimeMin(prev.lat, prev.lng, stop.lat, stop.lng);
                      }
                      return (
                        <React.Fragment key={stop.id}>
                          {walkTime !== null && walkTime > 0 && (
                            <div className="flex flex-col items-center py-2">
                              <div className="w-px h-6 border-l border-dashed border-zinc-700"></div>
                              <div className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1 my-1">
                                <span className="material-symbols-outlined text-[12px] text-zinc-500">directions_walk</span>
                                <span className="font-label text-[9px] text-zinc-400 uppercase tracking-widest">{walkTime} min walk</span>
                              </div>
                              <div className="w-px h-6 border-l border-dashed border-zinc-700"></div>
                            </div>
                          )}
                          <SortableStopItem stop={stop} />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
          
          {/* Bottom ETA Strip Preview */}
          <div className="h-48 border-t border-white/5 bg-surface p-4 overflow-x-auto flex gap-4 items-center">
            {currentStops.length === 0 ? (
              <div className="w-full text-center text-zinc-600 font-label text-xs uppercase">ETA Strip Preview</div>
            ) : (
              currentStops.map((stop, index) => (
                <div key={`${stop.id}-${index}`} className="w-64 flex-none bg-surface-container border border-white/10 rounded-xl p-4 shadow-xl">
                  <span className="font-label text-[10px] text-zinc-500 uppercase">Stop {index + 1}</span>
                  <h4 className="font-headline font-bold text-zinc-200 mt-1 truncate">{stop.name}</h4>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-3xl font-black tracking-tighter text-[#39FF14]">--</span>
                    <span className="text-zinc-500 text-sm mb-1 font-bold">min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RouteMaker;
