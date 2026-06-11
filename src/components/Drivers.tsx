import React, { useState, useMemo } from 'react';
import { useCRM } from '../store';
import { Deal, Driver, DriverStatus } from '../types';
import { Plus, Search, MapPin, Shield, CheckCircle, AlertTriangle, X, Check, ArrowRight, Settings } from 'lucide-react';

export default function Drivers() {
  const { currentUser, deals, companies, drivers, addDriver, updateDriver } = useCRM();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'All' | 'Jakarta' | 'Surabaya'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Assigned' | 'Reserved' | 'Leave'>('All');

  // Form modals state
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);

  // New driver form
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [newLocation, setNewLocation] = useState<'Jakarta' | 'Surabaya'>('Jakarta');

  // Edit driver form
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editDriverLicense, setEditDriverLicense] = useState('');
  const [editDriverStatus, setEditDriverStatus] = useState<DriverStatus>('Available');

  // Fulfillment states
  const [driverFulfillmentDeal, setDriverFulfillmentDeal] = useState<Deal | null>(null);
  const [fulfillmentSelectedDriverIds, setFulfillmentSelectedDriverIds] = useState<string[]>([]);
  const [driverFulfillmentLocationFilter, setDriverFulfillmentLocationFilter] = useState<'All' | 'Jakarta' | 'Surabaya'>('All');

  const pendingDriverFulfillmentDeals = useMemo(() => {
    return deals.filter(d => {
      if (d.stage !== 'Won' && d.stage !== 'Negotiation') return false;
      const supirItem = d.products?.find(p => p.category === 'Supir');
      if (!supirItem) return false;
      const reqQty = supirItem.quantity || 1;
      const assignedDrivers = drivers.filter(dr => dr.assignedDealId === d.id).length;
      return assignedDrivers < reqQty;
    });
  }, [deals, drivers]);

  // Filtered unit lists
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (d.phone && d.phone.includes(searchTerm));
      const matchesLocation = locationFilter === 'All' || d.location === locationFilter;
      const matchesStatus = statusFilter === 'All' ? true : d.status === statusFilter; 
      
      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [drivers, searchTerm, locationFilter, statusFilter]);

  // Stats calculation
  const driverStats = useMemo(() => {
    const total = drivers.length;
    const available = drivers.filter(d => d.status === 'Available').length;
    const assigned = drivers.filter(d => d.status === 'Assigned').length;
    const reserved = drivers.filter(d => d.status === 'Reserved').length;
    const leave = drivers.filter(d => d.status === 'Leave').length;
    return { total, available, assigned, reserved, leave };
  }, [drivers]);

  // Permissions check: Only "Pool" can add/edit. Others can only view.
  const canModify = currentUser.role === 'Pool';

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim()) return;

    const newDriver = {
      id: 'dr_' + Date.now(),
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      location: newLocation,
      status: 'Available' as const,
      category: 'Supir' as const,
      licenseNumber: newDriverLicense.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    addDriver(newDriver);
    
    // Reset form
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverLicense('');
    setNewLocation('Jakarta');
    setIsAddDriverOpen(false);
  };

  const openEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDriverName(driver.name);
    setEditDriverPhone(driver.phone);
    setEditDriverLicense(driver.licenseNumber || '');
    setEditDriverStatus(driver.status);
    setIsEditDriverOpen(true);
  };

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    updateDriver({
      ...selectedDriver,
      name: editDriverName.trim(),
      phone: editDriverPhone.trim(),
      licenseNumber: editDriverLicense.trim() || undefined,
      status: editDriverStatus,
      updatedAt: new Date().toISOString()
    });
    setIsEditDriverOpen(false);
    setSelectedDriver(null);
  };

  const handleSaveDriverFulfillment = () => {
    if (!driverFulfillmentDeal) return;
    
    // Drivers that were originally assigned to this deal that are NOT in the selected list anymore
    const currentlyAssignedDrivers = drivers.filter(d => d.assignedDealId === driverFulfillmentDeal.id);
    const driversToRelease = currentlyAssignedDrivers.filter(d => !fulfillmentSelectedDriverIds.includes(d.id));
    
    driversToRelease.forEach(d => updateDriver({ ...d, status: 'Available', assignedDealId: null }));

    fulfillmentSelectedDriverIds.forEach(id => {
      const d = drivers.find(drv => drv.id === id);
      const targetStatus = driverFulfillmentDeal.stage === 'Negotiation' ? 'Reserved' : 'Assigned';
      if (d && (d.assignedDealId !== driverFulfillmentDeal.id || d.status !== targetStatus)) {
        updateDriver({ ...d, status: targetStatus, assignedDealId: driverFulfillmentDeal.id });
      }
    });

    setDriverFulfillmentDeal(null);
    setFulfillmentSelectedDriverIds([]);
  };

  const startDriverFulfillment = (deal: Deal) => {
    const currentlyAssignedDrivers = drivers.filter(d => d.assignedDealId === deal.id);
    setFulfillmentSelectedDriverIds(currentlyAssignedDrivers.map(d => d.id));
    setDriverFulfillmentLocationFilter('All');
    setDriverFulfillmentDeal(deal);
  };

  // Helper to map deal ID to details
  const getDealDetails = (dealId?: string | null) => {
    if (!dealId) return null;
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return null;
    const company = companies.find(c => c.id === deal.companyId);
    return {
      dealTitle: deal.title,
      companyName: company ? company.name : 'Unknown Company',
      stage: deal.stage
    };
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Operational Supir
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm">
            Operational dashboard to register, allocate, and monitor driver (Supir) fleets.
          </p>
        </div>
        
        {canModify && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentUser.name.includes('Surabaya')) setNewLocation('Surabaya');
                else if (currentUser.name.includes('Jakarta')) setNewLocation('Jakarta');
                else setNewLocation('Jakarta');
                setIsAddDriverOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Plus className="h-4 w-4" />
              Register Driver
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Supir</div>
          <div className="text-3xl font-mono font-bold text-white mt-1">{driverStats.total}</div>
          <div className="text-[10px] text-slate-500 mt-1">Registered drivers</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 backdrop-blur-md">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Available</div>
          <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">{driverStats.available}</div>
          <div className="text-[10px] text-emerald-500 mt-1">Ready for assignment</div>
        </div>
        <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 backdrop-blur-md">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Assigned</div>
          <div className="text-3xl font-mono font-bold text-blue-400 mt-1">{driverStats.assigned}</div>
          <div className="text-[10px] text-slate-500 mt-1">On active duty</div>
        </div>
        <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-4 backdrop-blur-md">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Reserved</div>
          <div className="text-3xl font-mono font-bold text-purple-400 mt-1">{driverStats.reserved}</div>
          <div className="text-[10px] text-slate-500 mt-1">Booked for contract</div>
        </div>
        <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4 backdrop-blur-md">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Leave</div>
          <div className="text-3xl font-mono font-bold text-rose-400 mt-1">{driverStats.leave}</div>
          <div className="text-[10px] text-slate-500 mt-1">Not available</div>
        </div>
      </div>

      {canModify && currentUser.name === 'Pool Jakarta' && pendingDriverFulfillmentDeals.length > 0 && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Action Required: Assign Supir</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingDriverFulfillmentDeals.map(d => {
              const comp = companies.find(c => c.id === d.companyId);
              const supirItem = d.products?.find(p => p.category === 'Supir');
              const reqQty = supirItem ? (supirItem.quantity || 1) : 0;
              const assignedDrivers = drivers.filter(dr => dr.assignedDealId === d.id).length;
              return (
                <div key={d.id} className="rounded-2xl border border-emerald-500/20 bg-[#161d2e] p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-1 tracking-tight truncate max-w-sm">{comp?.name || 'Unknown Company'}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{d.title}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400 font-bold">{assignedDrivers} / {reqQty} drivers linked</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startDriverFulfillment(d)}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-all shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                  >
                    Select Drivers <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Filters Panel */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827]/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value as any)}
            className="bg-[#111827]/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Locations</option>
            <option value="Jakarta">Jakarta Pool</option>
            <option value="Surabaya">Surabaya Pool</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#111827]/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Reserved">Reserved</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
          <div className="mx-auto h-12 w-12 text-slate-500 mb-3 flex items-center justify-center rounded-full bg-slate-800">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Drivers Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((d) => {
            const hasDeal = getDealDetails(d.assignedDealId);
            const statusColor = {
              'Available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'Reserved': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              'Assigned': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              'Leave': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }[d.status];

            return (
              <div key={d.id} className="group relative rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-lg hover:border-indigo-500/20 hover:bg-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors">
                          {d.name}
                        </h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono">{d.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColor}`}>
                        {d.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <MapPin className="h-3 w-3 text-red-400" />
                        {d.location} Pool
                      </span>
                    </div>
                  </div>

                  {!['Available', 'Leave'].includes(d.status) && (
                    hasDeal ? (
                      <div className="mt-4 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-indigo-400 mb-1">Assigned Client & Contract</span>
                        <div className="font-bold text-white mb-0.5">{hasDeal.companyName}</div>
                        <div className="text-slate-400 flex items-center gap-1.5 mt-1">
                          <span className="truncate">{hasDeal.dealTitle}</span>
                          <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-white shrink-0">{hasDeal.stage}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-dashed border-white/5 text-xs text-slate-400 italic">
                        No active customer contract assigned.
                      </div>
                    )
                  )}
                </div>
                
                {/* Bottom Actions */}
                {canModify && currentUser.name.includes(d.location) && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button
                      onClick={() => openEditDriver(d)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs font-semibold text-white transition-all"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      Edit Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating alert/guide for Pool reps */}
      {currentUser.role === 'Pool' && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3 text-sm text-slate-300">
          <Shield className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Active Operational Session:</strong> You are logged in as {currentUser.name}. You represent the vehicle marshaling dispatch (pool). You can register drivers and assign them to requests.
          </div>
        </div>
      )}

      {/* MODAL: REGISTER DRIVER */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setIsAddDriverOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                Register New Driver
              </h2>
              <button onClick={() => setIsAddDriverOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 081234567890"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">License Number (SIM)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1234-5678-9012"
                    value={newDriverLicense}
                    onChange={(e) => setNewDriverLicense(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pool Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as any)}
                    disabled={currentUser.name.includes('Pool Jakarta') || currentUser.name.includes('Pool Surabaya')}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDriverOpen(false)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DRIVER */}
      {isEditDriverOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setIsEditDriverOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Update Driver Data
              </h2>
              <button onClick={() => setIsEditDriverOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditDriver} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editDriverName}
                    onChange={(e) => setEditDriverName(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editDriverPhone}
                    onChange={(e) => setEditDriverPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">License Number (SIM)</label>
                  <input
                    type="text"
                    value={editDriverLicense}
                    onChange={(e) => setEditDriverLicense(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Driver Status</label>
                  <select
                    value={editDriverStatus}
                    onChange={(e) => setEditDriverStatus(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditDriverOpen(false)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULFILL DRIVERS */}
      {driverFulfillmentDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setDriverFulfillmentDeal(null)}></div>
          
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/20 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Assign Supir
              </h2>
              <button onClick={() => setDriverFulfillmentDeal(null)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const comp = companies.find(c => c.id === driverFulfillmentDeal.companyId);
              const supirItem = driverFulfillmentDeal.products?.find(p => p.category === 'Supir');
              const reqQty = supirItem ? (supirItem.quantity || 1) : 0;
              const currentlySelectedCount = fulfillmentSelectedDriverIds.length;
              
              const availableDriversToPick = drivers.filter(d => 
                (d.status === 'Available' || (['Reserved', 'Assigned'].includes(d.status) && d.assignedDealId === driverFulfillmentDeal.id)) && 
                (driverFulfillmentLocationFilter === 'All' || d.location === driverFulfillmentLocationFilter)
              );

              return (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="bg-white/5 p-3 rounded-2xl mb-4 border border-white/5 text-xs text-slate-300 shrink-0">
                    <div className="font-bold text-white mb-1 tracking-tight truncate">{comp?.name || 'Unknown Company'}</div>
                    <div className="text-slate-400 truncate">{driverFulfillmentDeal.title}</div>
                    <div className="mt-2 flex items-center justify-between bg-[#0f172a] rounded-xl p-2 border border-white/5">
                      <span className="font-bold text-slate-400">Required Drivers:</span>
                      <span className="font-mono font-bold text-emerald-400">{currentlySelectedCount} / {reqQty} Selected</span>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between shrink-0">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Drivers</label>
                    <select
                      className="bg-[#0f172a] border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1 outline-none focus:border-emerald-500"
                      value={driverFulfillmentLocationFilter}
                      onChange={(e) => setDriverFulfillmentLocationFilter(e.target.value as any)}
                    >
                      <option value="All">All Locations</option>
                      <option value="Jakarta">Jakarta Pool</option>
                      <option value="Surabaya">Surabaya Pool</option>
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[200px]">
                    {availableDriversToPick.length === 0 ? (
                      <div className="text-xs text-slate-500 py-4 text-center bg-[#0f172a] rounded-xl border border-white/5">No available drivers match the criteria.</div>
                    ) : (
                      availableDriversToPick.map((d) => {
                        const isSelected = fulfillmentSelectedDriverIds.includes(d.id);
                        return (
                          <div
                            key={d.id}
                            onClick={() => {
                              if (isSelected) {
                                setFulfillmentSelectedDriverIds(prev => prev.filter(id => id !== d.id));
                              } else {
                                if (fulfillmentSelectedDriverIds.length < reqQty) {
                                  setFulfillmentSelectedDriverIds(prev => [...prev, d.id]);
                                }
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]'
                                : fulfillmentSelectedDriverIds.length >= reqQty
                                  ? 'bg-[#0f172a] border-white/5 text-slate-500 opacity-50 cursor-not-allowed'
                                  : 'bg-[#0f172a] border-white/5 text-slate-300 hover:border-emerald-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border ${isSelected ? 'border-emerald-500 bg-emerald-500 flex items-center justify-center' : 'border-slate-600'}`}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-semibold text-sm ${isSelected ? 'text-emerald-100' : 'text-slate-200'}`}>
                                  {d.name}
                                </span>
                                <span className={`text-[10px] ${isSelected ? 'text-emerald-300/70' : 'text-slate-500'}`}>
                                  {d.phone} • {d.location}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${d.assignedDealId === driverFulfillmentDeal.id ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                              {d.assignedDealId === driverFulfillmentDeal.id ? 'Already Assgnd' : 'Available'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDriverFulfillmentDeal(null)}
                      className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDriverFulfillment}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
