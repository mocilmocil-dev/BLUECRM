import React, { useState } from 'react';
import { useCRM } from '../store';
import { Building2, Mail, Phone, Plus, ChevronRight, Edit3, Search, Filter, CalendarDays, User, Tag } from 'lucide-react';
import { Company, PIC } from '../types';
import { formatIDR } from '../utils';

export default function Clients() {
  const { currentUser, companies, addCompany, updateCompany, deals, users } = useCRM();
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Detailed view state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Form state
  const [editingId, setEditingId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');

  // Filters and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');

  const uniqueIndustries = Array.from(new Set(companies.map(c => c.industry))).sort();

  const filteredAndSortedCompanies = companies
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => industryFilter === 'All' || c.industry === industryFilter)
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId('');
    setCompanyName('');
    setIndustry('');
    setPicName('');
    setPicPhone('');
    setPicEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company: Company) => {
    setModalMode('edit');
    setEditingId(company.id);
    setCompanyName(company.name);
    setIndustry(company.industry);
    setPicName(company.pics[0]?.name || '');
    setPicPhone(company.pics[0]?.phone || '');
    setPicEmail(company.pics[0]?.email || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newPic: PIC = {
      id: `p${Date.now()}`,
      name: picName,
      phone: picPhone,
      email: picEmail,
    };
    
    if (modalMode === 'create') {
      const newCompany: Company = {
        id: `c${Date.now()}`,
        name: companyName,
        industry: industry,
        pics: picName || picPhone || picEmail ? [newPic] : [],
      };
      addCompany(newCompany);
    } else {
      const existingCompany = companies.find(c => c.id === editingId);
      if (existingCompany) {
        let newPics = existingCompany.pics;
        if (picName || picPhone || picEmail) {
          if (newPics.length > 0) {
            newPics = [{ ...newPics[0], name: picName, phone: picPhone, email: picEmail }];
          } else {
            newPics = [newPic];
          }
        } else {
          newPics = [];
        }
        updateCompany({
          ...existingCompany,
          name: companyName,
          industry: industry,
          pics: newPics
        });
        
        if (selectedCompany?.id === existingCompany.id) {
          setSelectedCompany({
            ...existingCompany,
            name: companyName,
            industry: industry,
            pics: newPics
          });
        }
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Company Partners</h1>
          <p className="text-slate-400">Manage companies and PIC contacts.</p>
        </div>
        {currentUser.role === 'Sales' && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-4 w-4" /> New Client
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="w-full bg-[#161d2e] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
            <select
              className="bg-[#161d2e] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 transition-colors appearance-none"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="All">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <select
            className="bg-[#161d2e] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name-asc' | 'name-desc')}
          >
            <option value="name-asc">A to Z</option>
            <option value="name-desc">Z to A</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedCompanies.map(company => (
            <div 
              key={company.id} 
              onClick={() => setSelectedCompany(company)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="h-10 w-10 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{company.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">{company.industry}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#161d2e] shadow-2xl border border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="h-14 w-14 bg-indigo-500/20 text-indigo-300 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner">
                   <Building2 className="h-7 w-7" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedCompany.name}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{selectedCompany.industry}</p>
                 </div>
               </div>
               {(currentUser.role === 'GM' || currentUser.role === 'Manager') && (
                 <button 
                   onClick={() => handleOpenEdit(selectedCompany)}
                   className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition"
                 >
                   <Edit3 className="w-5 h-5" />
                 </button>
               )}
            </div>
            
            <div className="p-6 flex-1 bg-transparent overflow-y-auto max-h-[60vh]">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">PIC Contacts</h4>
              <div className="space-y-3">
                {selectedCompany.pics.map(pic => (
                  <div key={pic.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm">
                    <p className="font-bold text-slate-200 mb-2">{pic.name}</p>
                    {pic.phone && (
                      <div className="flex items-center text-slate-400 text-xs mb-1.5 gap-2">
                         <Phone className="h-3 w-3" /> {pic.phone}
                      </div>
                    )}
                    {pic.email && (
                      <div className="flex items-center text-slate-400 text-xs gap-2">
                         <Mail className="h-3 w-3" /> {pic.email}
                      </div>
                    )}
                  </div>
                ))}
                {selectedCompany.pics.length === 0 && (
                   <p className="text-sm text-slate-400 italic">No contacts added.</p>
                )}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 mb-4">Pipeline Deals</h4>
              <div className="space-y-3">
                {(() => {
                  const companyDeals = deals.filter(d => {
                    if (d.companyId !== selectedCompany.id) return false;
                    // Sales can only see their own deals
                    if (currentUser.role === 'Sales' && d.salesId !== currentUser.id) return false;
                    return true;
                  });

                  if (companyDeals.length === 0) {
                    return <p className="text-sm text-slate-400 italic">No deals found for this client.</p>;
                  }

                  return companyDeals.map(deal => {
                    const salesPerson = users.find(u => u.id === deal.salesId);
                    return (
                      <div key={deal.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-200">{deal.title}</p>
                          <span className={`text-[10px] px-2 py-1 rounded-lg shrink-0 uppercase tracking-wider font-bold ${deal.stage === 'Won' ? 'bg-emerald-500/20 text-emerald-400' : deal.stage === 'Lost' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {deal.stage}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" /> 
                            {salesPerson?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" /> 
                            {deal.month}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                            <Tag className="h-3.5 w-3.5" /> 
                            {formatIDR(deal.estimatedValue || 0)}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="p-5 bg-black/20 rounded-b-3xl flex justify-end border-t border-white/5">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="px-6 py-2 text-sm font-bold text-slate-300 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#161d2e] shadow-2xl border border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{modalMode === 'create' ? 'Create New Client' : 'Edit Client'}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Info</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. PT Sukses Makmur"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Industry <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary PIC (Optional)</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">PIC Name</label>
                  <input 
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    value={picName}
                    onChange={e => setPicName(e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
                    <input 
                      type="text"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      value={picPhone}
                      onChange={e => setPicPhone(e.target.value)}
                      placeholder="e.g. 0812345678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                    <input 
                      type="email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      value={picEmail}
                      onChange={e => setPicEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-black/20 rounded-b-3xl flex justify-end gap-3 border-t border-white/5 mt-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!companyName || !industry}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl justify-center items-center text-sm font-bold transition shadow-lg shadow-indigo-500/20"
              >
                {modalMode === 'create' ? 'Save Client' : 'Update Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

