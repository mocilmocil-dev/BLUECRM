import React, { useState } from 'react';
import { useCRM } from '../store';
import { DealStage, DEAL_STAGES, PRODUCT_CATEGORIES, Deal, ProductCategory, DealHistoryEntry, DealProduct } from '../types';
import { formatIDR, parseIDR } from '../utils';
import { MoreHorizontal, Plus, AlertCircle, Clock, CalendarDays, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Pipeline() {
  const { currentUser, users, deals, companies, addDeal, updateDeal } = useCRM();
  
  const [selectedSalesFilter, setSelectedSalesFilter] = useState<string>('all');

  const getVisibleUserIds = () => {
    if (currentUser.role === 'GM' || currentUser.role === 'Manager') {
      return users.filter(u => u.role === 'Sales').map(u => u.id);
    } else {
      // Sales only see their own deals in Pipeline
      return [currentUser.id];
    }
  };
  
  const visibleSalesIds = getVisibleUserIds();
  const filterOptions = users.filter(u => visibleSalesIds.includes(u.id));

  const visibleDeals = deals.filter(d => {
    if (!visibleSalesIds.includes(d.salesId)) return false;
    if (selectedSalesFilter !== 'all' && d.salesId !== selectedSalesFilter) return false;
    return true;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit-stage' | 'history'>('create');
  const [targetStage, setTargetStage] = useState<DealStage>('Call/Meeting');
  const [subType, setSubType] = useState<'Call' | 'Offline Meeting'>('Call');
  const [transitionDate, setTransitionDate] = useState<string>(new Date().toISOString());
  const [note, setNote] = useState<string>('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const openStageModal = (deal: Deal, stage: DealStage) => {
    setEditingDeal(deal);
    setTargetStage(stage);
    setTransitionDate(new Date().toISOString());
    setNote('');
    setModalMode('edit-stage');
    setIsModalOpen(true);
  };

  const openHistoryModal = (deal: Deal) => {
    setEditingDeal(deal);
    setExpandedHistoryId(null);
    setModalMode('history');
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingDeal({
      title: '',
      products: [{ id: `p${Date.now()}`, category: 'Mobil Short Term', quantity: 1, estimatedValue: 0 }],
      stage: 'Call/Meeting',
      estimatedValue: 0,
      createdAt: new Date().toISOString()
    });
    setTargetStage('Call/Meeting');
    setModalMode('create');
    setNote('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const sumEstimated = editingDeal!.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || 0;

      const newHistoryEntry: DealHistoryEntry = {
        id: `h${Date.now()}`,
        stage: editingDeal!.stage as DealStage || 'Call/Meeting',
        subType: (editingDeal!.stage || 'Call/Meeting') === 'Call/Meeting' ? subType : undefined,
        timestamp: editingDeal!.createdAt || new Date().toISOString(),
        note: note.trim() || undefined,
        products: editingDeal!.products,
        estimatedValue: sumEstimated,
      };

      const newDeal: Deal = {
        ...editingDeal,
        id: `d${Date.now()}`,
        salesId: currentUser.id,
        companyId: editingDeal!.companyId || companies[0]?.id,
        estimatedValue: sumEstimated,
        createdAt: editingDeal!.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [newHistoryEntry],
      } as Deal;
      addDeal(newDeal);
    } else if (modalMode === 'edit-stage' && editingDeal) {
      if (!editingDeal.id) return;
      const fullDeal = deals.find(d => d.id === editingDeal.id);
      if (!fullDeal) return;
      
      const sumEstimatedEdit = editingDeal.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || editingDeal.estimatedValue || fullDeal.estimatedValue;

      const newHistoryEntry: DealHistoryEntry = {
        id: `h${Date.now()}`,
        stage: targetStage,
        subType: targetStage === 'Call/Meeting' ? subType : undefined,
        timestamp: transitionDate,
        note: note.trim() || undefined,
        products: editingDeal.products || fullDeal.products,
        estimatedValue: sumEstimatedEdit,
      };

      const updated: Deal = {
        ...fullDeal,
        stage: targetStage,
        products: editingDeal.products || fullDeal.products,
        estimatedValue: sumEstimatedEdit,
        lostReason: editingDeal.lostReason,
        updatedAt: new Date().toISOString(),
        history: [...(fullDeal.history || []), newHistoryEntry],
      };

      if (targetStage === 'Won') {
        updated.actualValue = updated.estimatedValue;
      }

      updateDeal(updated);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Active Pipeline Funnel</h1>
          <p className="text-slate-400">Manage your deals across sales stages.</p>
        </div>
        <div className="flex items-center gap-4">
          {(currentUser.role === 'GM' || currentUser.role === 'Manager') && (
            <select
              className="rounded-xl border border-white/10 bg-[#161d2e] px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
              value={selectedSalesFilter}
              onChange={(e) => setSelectedSalesFilter(e.target.value)}
            >
              <option value="all">All Sales</option>
              {filterOptions.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}
          {currentUser.role === 'Sales' && (
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="h-4 w-4" /> New Deal
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {DEAL_STAGES.map(stage => (
            <div key={stage} className="flex flex-col w-80 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm tracking-wide">{stage}</h3>
                <span className="text-xs font-bold text-slate-400 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/5">
                  {visibleDeals.filter(d => d.stage === stage).length}
                </span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {visibleDeals.filter(d => d.stage === stage).map(deal => (
                  <div key={deal.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition group relative">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-sm leading-tight">{deal.title}</h4>
                      
                      {currentUser.role === 'Sales' && currentUser.id === deal.salesId && (
                        <div>
                          <select 
                            className="text-xs bg-indigo-500/10 border-indigo-500/30 border outline-none rounded-lg text-indigo-300 font-medium py-1 px-2 cursor-pointer hover:bg-indigo-500/20 transition-colors"
                            value={deal.stage}
                            onChange={(e) => openStageModal(deal, e.target.value as DealStage)}
                          >
                            <option value="" disabled>Move to...</option>
                            {DEAL_STAGES.map(s => (
                              <option key={s} value={s} disabled={s === deal.stage}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[65%]">
                          {companies.find(c => c.id === deal.companyId)?.name}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(deal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-white/10 bg-slate-700/50 flex items-center justify-center text-[9px] font-bold text-slate-300">
                          {users.find(u => u.id === deal.salesId)?.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-400 truncate">
                          {users.find(u => u.id === deal.salesId)?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 mb-2">
                      <div className="flex flex-wrap gap-1">
                        {(deal.products || []).map((p, i) => (
                           <span key={i} className="inline-flex items-center rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                             {p.quantity > 1 ? `${p.quantity}x ` : ''}{p.category}
                           </span>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatIDR(deal.stage === 'Won' ? deal.actualValue : deal.estimatedValue)}
                      </span>
                    </div>

                    <button
                      onClick={() => openHistoryModal(deal)}
                      className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest mt-2"
                    >
                      <Clock className="w-3 h-3" /> View History
                    </button>
                    
                    {deal.stage === 'Lost' && deal.lostReason && (
                      <div className="mt-2 text-[10px] text-rose-300 bg-rose-500/20 p-2 rounded-lg flex items-start gap-1 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{deal.lostReason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#161d2e] shadow-2xl border border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">
                {modalMode === 'create' ? 'Create New Deal' : modalMode === 'history' ? 'Deal History' : `Move to ${targetStage}`}
              </h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {modalMode === 'history' && (
                <div className="space-y-4">
                  {editingDeal?.history?.length ? (
                    editingDeal.history.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-6 pb-4 border-l border-white/10 last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#161d2e]"></div>
                        
                        <div 
                          className={`cursor-pointer group flex justify-between items-start rounded-xl -ml-2 p-2 transition ${expandedHistoryId === entry.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
                          onClick={() => setExpandedHistoryId(expandedHistoryId === entry.id ? null : entry.id)}
                        >
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {entry.stage} {entry.subType ? `(${entry.subType})` : ''}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(entry.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {(entry.note || entry.products?.length || entry.estimatedValue) ? (
                            expandedHistoryId === entry.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : null}
                        </div>

                        {expandedHistoryId === entry.id && (
                          <div className="mt-2 text-sm bg-black/20 rounded-xl p-3 border border-white/5 space-y-3">
                            {entry.note && (
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Note</h4>
                                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{entry.note}</p>
                              </div>
                            )}

                            {entry.products && entry.products.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Products</h4>
                                <div className="space-y-1.5">
                                  {entry.products.map(p => (
                                    <div key={p.id} className="flex flex-col text-xs bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                      <div className="flex justify-between">
                                        <div>
                                          <span className="text-white">{p.category}</span>
                                          <span className="text-slate-400 ml-1">x{p.quantity || 1}</span>
                                        </div>
                                        <span className="text-emerald-400 font-mono">{formatIDR(p.estimatedValue * (p.quantity || 1))}</span>
                                      </div>
                                      {p.details && (
                                        <div className="text-white/60 mt-1.5 text-[10px] bg-black/20 p-1.5 rounded-md border border-white/5 leading-relaxed">
                                          <span className="font-semibold text-slate-500 mr-1">Note:</span>
                                          {p.details}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.estimatedValue !== undefined && (
                              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Est. Value</span>
                                <span className="text-sm text-emerald-400 font-mono font-bold">{formatIDR(entry.estimatedValue)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 text-center py-4">No history available for this deal.</div>
                  )}
                </div>
              )}

              {modalMode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deal Title</label>
                    <input 
                      type="text"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      value={editingDeal?.title || ''}
                      onChange={e => setEditingDeal({...editingDeal, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                    <input 
                      type="date"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[color-scheme:dark] text-white outline-none focus:border-indigo-500"
                      value={editingDeal?.createdAt ? editingDeal.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10)}
                      onChange={e => setEditingDeal({...editingDeal, createdAt: new Date(e.target.value).toISOString()})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company</label>
                    <select 
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      value={editingDeal?.companyId || ''}
                      onChange={e => setEditingDeal({...editingDeal, companyId: e.target.value})}
                    >
                      <option value="" disabled>Select a company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {(modalMode === 'create' || modalMode === 'edit-stage') && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Products</label>
                    <span className="text-xs font-bold text-emerald-400">Total Est: {formatIDR(editingDeal?.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || 0)}</span>
                  </div>
                  <div className="space-y-2">
                       {editingDeal?.products?.map((p, idx) => (
                          <div key={p.id} className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 relative group">
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingDeal({...editingDeal, products: editingDeal.products?.filter((_, i) => i !== idx)});
                              }}
                              className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <select
                              value={p.category}
                              onChange={(e) => {
                                const newProds = [...(editingDeal.products || [])];
                                newProds[idx] = { ...newProds[idx], category: e.target.value as ProductCategory };
                                setEditingDeal({ ...editingDeal, products: newProds });
                              }}
                              className="w-[90%] bg-transparent text-sm text-white font-bold outline-none"
                            >
                              {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat} className="text-slate-900">{cat}</option>)}
                            </select>
                            <div className="flex gap-2">
                              <div className="w-20">
                                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest pl-1">Qty</label>
                                <input 
                                  type="number"
                                  min="1"
                                  value={p.quantity || 1}
                                  onChange={(e) => {
                                    const newProds = [...(editingDeal.products || [])];
                                    newProds[idx] = { ...newProds[idx], quantity: parseInt(e.target.value) || 0 };
                                    setEditingDeal({ ...editingDeal, products: newProds });
                                  }}
                                  className="w-full rounded-lg border border-white/10 bg-[#161d2e] px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest pl-1">Unit Price</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1.5 text-sm text-slate-400">Rp</span>
                                  <input 
                                    type="text"
                                    value={p.estimatedValue === 0 ? '' : p.estimatedValue.toLocaleString('id-ID')}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                      const newProds = [...(editingDeal.products || [])];
                                      newProds[idx] = { ...newProds[idx], estimatedValue: val };
                                      setEditingDeal({ ...editingDeal, products: newProds });
                                    }}
                                    className="w-full rounded-lg border border-white/10 bg-[#161d2e] pl-8 pr-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                               <input 
                                 type="text"
                                 placeholder="Details / Note (Optional)"
                                 value={p.details || ''}
                                 onChange={(e) => {
                                   const newProds = [...(editingDeal.products || [])];
                                   newProds[idx] = { ...newProds[idx], details: e.target.value };
                                   setEditingDeal({ ...editingDeal, products: newProds });
                                 }}
                                 className="w-full rounded-lg border border-transparent bg-[#161d2e]/50 px-3 py-1.5 text-xs text-white outline-none focus:border-white/10 placeholder:text-slate-600"
                               />
                            </div>
                          </div>
                       ))}
                       <button 
                         onClick={() => {
                            const newProd: DealProduct = { id: `p${Date.now()}`, category: 'Mobil Short Term', quantity: 1, estimatedValue: 0 };
                            setEditingDeal({ ...editingDeal, products: [...(editingDeal.products || []), newProd] });
                         }}
                         className="w-full rounded-xl border border-dashed border-white/20 py-3 text-sm font-bold text-slate-400 hover:text-indigo-300 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
                       >
                         <Plus className="w-4 h-4" /> Add Product Item
                       </button>
                    </div>
                  </div>
              )}

              {/* Dynamic Rules for Changing Stage */}
              {modalMode === 'edit-stage' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action Date</label>
                  <input 
                    type="date"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[color-scheme:dark] text-white outline-none focus:border-indigo-500"
                    value={transitionDate.substring(0, 10)}
                    onChange={e => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setTransitionDate(newDate.toISOString());
                      }
                    }}
                  />
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit-stage') && targetStage === 'Call/Meeting' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Activity Type
                  </label>
                  <select 
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    value={subType}
                    onChange={e => setSubType(e.target.value as 'Call' | 'Offline Meeting')}
                  >
                    <option value="Call">Call</option>
                    <option value="Offline Meeting">Offline Meeting</option>
                  </select>
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit-stage') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Note / Highlights
                  </label>
                  <textarea 
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 min-h-[80px]"
                    placeholder="Add details about this activity..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  ></textarea>
                </div>
              )}

              {(modalMode === 'create' || ('Prospecting Proposal Negotiation'.includes(targetStage) && modalMode !== 'history')) && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Total Estimated Deal Value (IDR)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2 italic">Calculated automatically from product items above</p>
                  <input 
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                    value={(editingDeal?.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || editingDeal?.estimatedValue || 0).toLocaleString('id-ID')}
                    readOnly
                  />
                  <div className="mt-1.5 text-xs text-emerald-400 font-mono font-medium">
                    Formatted: {formatIDR(editingDeal?.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || editingDeal?.estimatedValue || 0)}
                  </div>
                </div>
              )}

              {targetStage === 'Won' && modalMode !== 'history' && (
                <div className="bg-emerald-500/10 text-emerald-300 p-4 rounded-2xl text-sm border border-emerald-500/20">
                  <p className="font-bold">Deal Won!</p>
                  <p className="mt-1">100% of the Estimated Value ({formatIDR(editingDeal?.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || editingDeal?.estimatedValue || 0)}) will be recognized as Actual Revenue.</p>
                </div>
              )}

              {targetStage === 'Lost' && modalMode !== 'history' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Lost Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    rows={3}
                    placeholder="Why was this deal lost?"
                    value={editingDeal?.lostReason || ''}
                    onChange={e => setEditingDeal({...editingDeal, lostReason: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="p-5 bg-black/20 rounded-b-3xl flex justify-end gap-3 border-t border-white/5 mt-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition"
              >
                {modalMode === 'history' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'history' && (
                <button 
                  onClick={handleSave}
                  disabled={
                    (targetStage === 'Lost' && !editingDeal?.lostReason) || 
                    (['Prospecting', 'Proposal', 'Negotiation'].includes(targetStage) && !(editingDeal?.products?.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0) || editingDeal?.estimatedValue))
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl justify-center items-center text-sm font-bold transition shadow-lg shadow-indigo-500/20"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
