import React, { useState, useMemo, useEffect } from 'react';
import { useCRM } from '../store';
import { Unit, UnitStatus, Deal } from '../types';
import { Car, Plus, Search, MapPin, Wrench, Shield, CheckCircle, Tag, AlertTriangle, FileText, X, Check, ArrowRight, Settings, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Units() {
  const { currentUser, units, addUnit, updateUnit, deals, companies } = useCRM();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'All' | 'Jakarta' | 'Surabaya'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | UnitStatus | 'In Queue' | 'Being Serviced'>('All');

  // View mode and pagination states
  const [viewMode, setViewMode] = useState<'Grid' | 'Table'>('Table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Form modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // New form field states
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newLocation, setNewLocation] = useState<'Jakarta' | 'Surabaya'>('Jakarta');
  const [newStatus, setNewStatus] = useState<UnitStatus>('Available');
  const [newMaintenanceStatus, setNewMaintenanceStatus] = useState<'Being Serviced' | 'In Queue'>('In Queue');
  const [newNotes, setNewNotes] = useState('');
  const [newServiceDate, setNewServiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Extended unit details fields
  const [newManufactureYear, setNewManufactureYear] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTransmission, setNewTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [newFuelLevel, setNewFuelLevel] = useState<number>(100);
  const [newTaxExpiryDate, setNewTaxExpiryDate] = useState('');
  const [newStnkExpiryDate, setNewStnkExpiryDate] = useState('');
  const [newLastOdometer, setNewLastOdometer] = useState<number>(0);

  // Edit details states
  const [editManufactureYear, setEditManufactureYear] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editTransmission, setEditTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [editFuelLevel, setEditFuelLevel] = useState<number>(100);
  const [editTaxExpiryDate, setEditTaxExpiryDate] = useState('');
  const [editStnkExpiryDate, setEditStnkExpiryDate] = useState('');
  const [editLastOdometer, setEditLastOdometer] = useState<number>(0);

  // Edit status states
  const [editStatus, setEditStatus] = useState<UnitStatus>('Available');
  const [editMaintenanceStatus, setEditMaintenanceStatus] = useState<'Being Serviced' | 'In Queue'>('In Queue');
  const [editNotes, setEditNotes] = useState('');
  const [editServiceDate, setEditServiceDate] = useState('');
  const [editAssignedDeal, setEditAssignedDeal] = useState<string>('');

  // Fulfillment states
  const [fulfillmentDeal, setFulfillmentDeal] = useState<Deal | null>(null);
  const [fulfillmentSelectedUnitIds, setFulfillmentSelectedUnitIds] = useState<string[]>([]);
  const [fulfillmentLocationFilter, setFulfillmentLocationFilter] = useState<'All' | 'Jakarta' | 'Surabaya'>('All');

  // Find all active/won deals that have 'Mobil Long Term' and are not closed/lost
  const longTermDeals = useMemo(() => {
    return deals.filter(d => 
      d.products.some(p => p.category === 'Mobil Long Term') && 
      d.stage !== 'Lost'
    );
  }, [deals]);

  const pendingFulfillmentDeals = useMemo(() => {
    return deals.filter(d => {
      if (d.stage !== 'Won') return false;
      const longTermItem = d.products?.find(p => p.category === 'Mobil Long Term');
      if (!longTermItem) return false;
      const reqQty = longTermItem.quantity || 1;
      const assignedUnits = units.filter(u => u.assignedDealId === d.id).length;
      return assignedUnits < reqQty;
    });
  }, [deals, units]);

  // Filtered unit lists
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesSearch = u.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.notes && u.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = locationFilter === 'All' || u.location === locationFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        if (statusFilter === 'In Queue') matchesStatus = u.status === 'Maintenance' && u.maintenanceStatus === 'In Queue';
        else if (statusFilter === 'Being Serviced') matchesStatus = u.status === 'Maintenance' && u.maintenanceStatus === 'Being Serviced';
        else matchesStatus = u.status === statusFilter;
      }

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [units, searchTerm, locationFilter, statusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, statusFilter]);

  const totalFiltered = filteredUnits.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;

  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUnits.slice(start, start + itemsPerPage);
  }, [filteredUnits, currentPage, itemsPerPage]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = units.length;
    const available = units.filter(u => u.status === 'Available').length;
    const maintenance = units.filter(u => u.status === 'Maintenance').length;
    const beingServiced = units.filter(u => u.status === 'Maintenance' && u.maintenanceStatus === 'Being Serviced').length;
    const inQueue = units.filter(u => u.status === 'Maintenance' && u.maintenanceStatus === 'In Queue').length;
    const rented = units.filter(u => u.status === 'Rent Out').length;
    const booked = units.filter(u => u.status === 'Booked').length;
    const hold = units.filter(u => u.status === 'Hold').length;
    return { total, available, maintenance, beingServiced, inQueue, rented, booked, hold };
  }, [units]);

  // View state for maintenance expansion
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false);

  // Permissions check: Only "Pool" can add/edit. Others can only view.
  const canModify = currentUser.role === 'Pool';

  // Handle unit addition
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newModel.trim()) return;

    const newUnit: Unit = {
      id: 'un_' + Date.now(),
      plateNumber: newPlate.toUpperCase().trim(),
      model: newModel.trim(),
      location: newLocation,
      status: newStatus,
      maintenanceStatus: newStatus === 'Maintenance' ? newMaintenanceStatus : undefined,
      category: 'Mobil Long Term',
      lastServiceDate: newServiceDate || undefined,
      notes: newNotes.trim() || undefined,
      manufactureYear: newManufactureYear || undefined,
      color: newColor.trim() || undefined,
      transmission: newTransmission,
      fuelLevel: newFuelLevel,
      taxExpiryDate: newTaxExpiryDate || undefined,
      stnkExpiryDate: newStnkExpiryDate || undefined,
      lastOdometer: newLastOdometer,
      updatedAt: new Date().toISOString()
    };

    addUnit(newUnit);
    
    // Reset form
    setNewPlate('');
    setNewModel('');
    setNewLocation('Jakarta');
    setNewStatus('Available');
    setNewMaintenanceStatus('In Queue');
    setNewNotes('');
    setNewServiceDate(new Date().toISOString().split('T')[0]);
    setNewManufactureYear('');
    setNewColor('');
    setNewTransmission('Automatic');
    setNewFuelLevel(100);
    setNewTaxExpiryDate('');
    setNewStnkExpiryDate('');
    setNewLastOdometer(0);
    setIsAddOpen(false);
  };

  // Open edit status popup
  const openEditStatus = (unit: Unit) => {
    setSelectedUnit(unit);
    setEditStatus(unit.status);
    setEditMaintenanceStatus(unit.maintenanceStatus || 'In Queue');
    setEditNotes(unit.notes || '');
    setEditServiceDate(unit.lastServiceDate || '');
    setEditAssignedDeal(unit.assignedDealId || '');
    setIsEditStatusOpen(true);
  };

  // Open edit details popup
  const openEditDetails = (unit: Unit) => {
    setSelectedUnit(unit);
    setEditManufactureYear(unit.manufactureYear || '');
    setEditColor(unit.color || '');
    setEditTransmission((unit.transmission as 'Manual' | 'Automatic') || 'Automatic');
    setEditFuelLevel(unit.fuelLevel ?? 100);
    setEditTaxExpiryDate(unit.taxExpiryDate || '');
    setEditStnkExpiryDate(unit.stnkExpiryDate || '');
    setEditLastOdometer(unit.lastOdometer ?? 0);
    setIsEditDetailsOpen(true);
  };

  // Save status edit
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const updated: Unit = {
      ...selectedUnit,
      status: editStatus,
      maintenanceStatus: editStatus === 'Maintenance' ? editMaintenanceStatus : undefined,
      notes: editNotes.trim() || undefined,
      lastServiceDate: editServiceDate || undefined,
      assignedDealId: (editStatus === 'Rent Out' || editStatus === 'Booked' || editStatus === 'Hold') ? (editAssignedDeal || null) : null,
      updatedAt: new Date().toISOString()
    };

    updateUnit(updated);
    setIsEditStatusOpen(false);
    setSelectedUnit(null);
  };

  // Save details edit
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const updated: Unit = {
      ...selectedUnit,
      manufactureYear: editManufactureYear.trim() || undefined,
      color: editColor.trim() || undefined,
      transmission: editTransmission,
      fuelLevel: editFuelLevel,
      taxExpiryDate: editTaxExpiryDate || undefined,
      stnkExpiryDate: editStnkExpiryDate || undefined,
      lastOdometer: editLastOdometer,
      updatedAt: new Date().toISOString()
    };

    updateUnit(updated);
    setIsEditDetailsOpen(false);
    setSelectedUnit(null);
  };

  const handleSaveFulfillment = () => {
    if (!fulfillmentDeal) return;
    
    // Units that were originally assigned to this deal that are NOT in the selected list anymore
    const currentlyAssignedUnits = units.filter(u => u.assignedDealId === fulfillmentDeal.id);
    const unitsToRelease = currentlyAssignedUnits.filter(u => !fulfillmentSelectedUnitIds.includes(u.id));
    
    unitsToRelease.forEach(u => updateUnit({ ...u, status: 'Available', assignedDealId: null }));

    fulfillmentSelectedUnitIds.forEach(id => {
      const u = units.find(unit => unit.id === id);
      if (u && (u.assignedDealId !== fulfillmentDeal.id || u.status !== 'Booked')) {
        updateUnit({ ...u, status: 'Booked', assignedDealId: fulfillmentDeal.id });
      }
    });

    setFulfillmentDeal(null);
    setFulfillmentSelectedUnitIds([]);
  };

  const startFulfillment = (deal: Deal) => {
    const currentlyAssignedUnits = units.filter(u => u.assignedDealId === deal.id);
    setFulfillmentSelectedUnitIds(currentlyAssignedUnits.map(u => u.id));
    setFulfillmentLocationFilter('All');
    setFulfillmentDeal(deal);
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

  const statusColors: Record<UnitStatus, string> = {
    Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Rent Out': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Booked: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Hold: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Car className="h-8 w-8 text-indigo-400" />
            Operational Pool & Long-Term Fleet
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm">
            Operational dashboard to register, allocate, and monitor vehicle fleets assigned exclusively to <strong className="text-indigo-400">Mobil Long Term</strong> contracts.
          </p>
        </div>
        
        {canModify && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentUser.name.includes('Surabaya')) setNewLocation('Surabaya');
                else if (currentUser.name.includes('Jakarta')) setNewLocation('Jakarta');
                else setNewLocation('Jakarta');
                setIsAddOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Plus className="h-4 w-4" />
              Register Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Fleet Stats Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${showMaintenanceDetails ? 'lg:grid-cols-8' : 'lg:grid-cols-6'}`}>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fleet</div>
            <div className="text-3xl font-mono font-bold text-white mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-500 mt-1">Mobil Long Term units</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 backdrop-blur-md">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Available</div>
            <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">{stats.available}</div>
            <div className="text-[10px] text-emerald-500 mt-1">Ready for assignment</div>
          </div>
          <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 backdrop-blur-md">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Rented Out</div>
            <div className="text-3xl font-mono font-bold text-blue-400 mt-1">{stats.rented}</div>
            <div className="text-[10px] text-slate-500 mt-1">On active contract</div>
          </div>
          <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-4 backdrop-blur-md">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Booked</div>
            <div className="text-3xl font-mono font-bold text-purple-400 mt-1">{stats.booked}</div>
            <div className="text-[10px] text-slate-500 mt-1">Earmarked/Reserved</div>
          </div>
          <div className="rounded-2xl border border-pink-500/10 bg-pink-500/5 p-4 backdrop-blur-md">
            <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Hold</div>
            <div className="text-3xl font-mono font-bold text-pink-400 mt-1">{stats.hold}</div>
            <div className="text-[10px] text-slate-500 mt-1">Pending negotiation</div>
          </div>
          
          {!showMaintenanceDetails ? (
            <div 
              className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 backdrop-blur-md cursor-pointer hover:bg-amber-500/10 transition-colors"
              onClick={() => setShowMaintenanceDetails(true)}
            >
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Maintenance</div>
              <div className="text-3xl font-mono font-bold text-amber-400 mt-1">{stats.maintenance}</div>
              <div className="text-[10px] text-slate-500 mt-1">Click to view details <span className="text-[10px]">▼</span></div>
            </div>
          ) : (
            <>
              <div 
                className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 backdrop-blur-md cursor-pointer hover:bg-amber-500/10 transition-colors"
                onClick={() => setShowMaintenanceDetails(false)}
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Maintenance</div>
                <div className="text-3xl font-mono font-bold text-amber-400 mt-1">{stats.maintenance}</div>
                <div className="text-[10px] text-slate-500 mt-1">Total in workshop <span className="text-[10px]">▲</span></div>
              </div>
              <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4 backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Servicing</div>
                <div className="text-3xl font-mono font-bold text-rose-400 mt-1">{stats.beingServiced}</div>
                <div className="text-[10px] text-slate-500 mt-1">In repair</div>
              </div>
              <div className="rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">In Queue</div>
                <div className="text-3xl font-mono font-bold text-orange-400 mt-1">{stats.inQueue}</div>
                <div className="text-[10px] text-slate-500 mt-1">Workshop queue</div>
              </div>
            </>
          )}
        </div>

      {canModify && currentUser.name === 'Pool Jakarta' && pendingFulfillmentDeals.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-bold text-white">Action Required: Fulfill Mobil Long Term Units</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingFulfillmentDeals.map(d => {
              const comp = companies.find(c => c.id === d.companyId);
              const longTermItem = d.products?.find(p => p.category === 'Mobil Long Term');
              const reqQty = longTermItem ? (longTermItem.quantity || 1) : 0;
              const assignedUnits = units.filter(u => u.assignedDealId === d.id).length;
              return (
                <div key={d.id} className="rounded-2xl border border-amber-500/20 bg-[#161d2e] p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-1 tracking-tight truncate max-w-sm">{comp?.name || 'Unknown Company'}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{d.title}</span>
                      <span>•</span>
                      <span className="font-mono text-amber-400 font-bold">{assignedUnits} / {reqQty} units linked</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startFulfillment(d)}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-400 transition-all shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
                  >
                    Select Units <ArrowRight className="h-3 w-3" />
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
            placeholder="Search by plate number, car model, details..."
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
            <option value="Available">Available Only</option>
            <option value="Rent Out">Rent Out Only</option>
            <option value="Booked">Booked Only</option>
            <option value="Hold">Hold Only</option>
            <optgroup label="Maintenance">
              <option value="Maintenance">Maintenance (All)</option>
              <option value="Being Serviced">↳ Being Serviced</option>
              <option value="In Queue">↳ In Queue</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Grid vs Table Layout Selection + Pagination Stats Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Layout View:</span>
          <div className="inline-flex rounded-xl p-0.5 bg-slate-950/80 border border-white/5">
            <button
              onClick={() => setViewMode('Table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'Table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="h-3.5 w-3.5" />
              Compact List
            </button>
            <button
              onClick={() => setViewMode('Grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'Grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Detailed Grid
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-bold text-[10px]">Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#111827]/60 border border-white/5 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          {totalFiltered > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white font-mono">{Math.min(totalFiltered, (currentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="text-white font-mono">{Math.min(totalFiltered, currentPage * itemsPerPage)}</strong> of <strong className="text-white font-mono">{totalFiltered}</strong> units
            </span>
          )}
        </div>
      </div>

      {/* Vehicles Grid / Table */}
      {totalFiltered === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
          <Car className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Vehicles Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your filters or search criteria.</p>
        </div>
      ) : viewMode === 'Grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedUnits.map((u) => {
            const hasDeal = getDealDetails(u.assignedDealId);
            return (
              <div
                key={u.id}
                className="group relative rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-lg hover:border-indigo-500/20 hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top row: plate status & location */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Indonesian Plate Number Representation */}
                    <div className="flex flex-col items-center border border-slate-700 bg-slate-900 text-white font-mono px-3 py-1 rounded shadow-md select-none shrink-0 border-t-2 border-t-indigo-500">
                      <span className="text-base font-bold tracking-widest">{u.plateNumber}</span>
                      <div className="w-full h-px bg-slate-800 my-0.5"></div>
                      <span className="text-[8px] tracking-widest text-slate-400">06.31</span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColors[u.status]}`}>
                        {u.status}
                      </span>
                      {u.status === 'Maintenance' && u.maintenanceStatus && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.maintenanceStatus === 'Being Serviced' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                          {u.maintenanceStatus}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <MapPin className="h-3 w-3 text-red-400" />
                        {u.location} Pool
                      </span>
                    </div>
                  </div>

                  {/* Car info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors">
                      {u.model}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 bg-white/5 px-2 py-0.5 rounded text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <Tag className="h-3 w-3 text-indigo-400" />
                      Mobil Long Term
                    </div>
                  </div>

                  {/* Relational Linked Contract */}
                  {!['Available', 'Maintenance'].includes(u.status) && (
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

                  {/* Notes & service log */}
                  {(u.manufactureYear || u.color || u.transmission || u.lastOdometer !== undefined) && (
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/30 p-3 rounded-2xl border border-white/5">
                      {u.manufactureYear && <div><span className="font-bold text-slate-500">Year:</span> {u.manufactureYear}</div>}
                      {u.color && <div><span className="font-bold text-slate-500">Color:</span> {u.color}</div>}
                      {u.transmission && <div><span className="font-bold text-slate-500">Transmission:</span> {u.transmission}</div>}
                      {u.lastOdometer !== undefined && <div><span className="font-bold text-slate-500">Odo:</span> {u.lastOdometer.toLocaleString()} km</div>}
                      {u.fuelLevel !== undefined && <div><span className="font-bold text-slate-500">Fuel:</span> {u.fuelLevel}%</div>}
                    </div>
                  )}

                  {u.notes && (
                    <div className="mt-2 bg-slate-900/30 p-3 rounded-2xl text-xs text-slate-400 border border-white/5">
                      <span className="font-bold text-white block mb-1">Operational Logs:</span>
                      {u.notes}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {u.taxExpiryDate && (
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-indigo-400/70" />
                        Tax Exp: {u.taxExpiryDate}
                      </div>
                    )}
                    {u.stnkExpiryDate && (
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-indigo-400/70" />
                        STNK Exp: {u.stnkExpiryDate}
                      </div>
                    )}
                  </div>

                  {u.lastServiceDate && (
                    <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-amber-500/70" />
                      Last serviced: {u.lastServiceDate}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                {canModify && currentUser.name.includes(u.location) && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <button
                      onClick={() => openEditStatus(u)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-2 text-xs font-semibold transition-all"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Status
                    </button>
                    <button
                      onClick={() => openEditDetails(u)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs font-semibold text-white transition-all"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      Data
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/5 bg-slate-900/10 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/50 text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
                <th className="p-4 pl-6">Nopol / Plate</th>
                <th className="p-4">Car Model</th>
                <th className="p-4">Status</th>
                <th className="p-4">Location</th>
                <th className="p-4">Active Contract</th>
                <th className="p-4">Odo & Fuel</th>
                <th className="p-4">Docs Expiry</th>
                {canModify && <th className="p-4 pr-6 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUnits.map((u) => {
                const hasDeal = getDealDetails(u.assignedDealId);
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors text-sm">
                    {/* Plate */}
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="inline-flex flex-col items-center border border-slate-700 bg-slate-950 text-white font-mono px-2.5 py-1 rounded shadow-md select-none border-t-2 border-t-indigo-500 text-xs">
                        <span className="font-bold tracking-wider">{u.plateNumber}</span>
                        <div className="w-full h-px bg-slate-800 my-0.5"></div>
                        <span className="text-[7px] tracking-widest text-slate-400">06.31</span>
                      </div>
                    </td>

                    {/* Model */}
                    <td className="p-4">
                      <div className="font-bold text-white tracking-tight">{u.model}</div>
                      {u.manufactureYear && <span className="text-xs text-slate-400">{u.manufactureYear} • {u.color || 'No Color'}</span>}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColors[u.status]}`}>
                          {u.status}
                        </span>
                        {u.status === 'Maintenance' && u.maintenanceStatus && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-bold border ${u.maintenanceStatus === 'Being Serviced' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                            {u.maintenanceStatus}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4 whitespace-nowrap text-slate-300">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        {u.location} Pool
                      </span>
                    </td>

                    {/* Contract */}
                    <td className="p-4 max-w-xs">
                      {hasDeal ? (
                        <div className="text-xs">
                          <div className="font-bold text-white truncate">{hasDeal.companyName}</div>
                          <div className="text-slate-400 truncate mt-0.5" title={hasDeal.dealTitle}>
                            {hasDeal.dealTitle}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-xs">Available</span>
                      )}
                    </td>

                    {/* Odometer & Fuel */}
                    <td className="p-4 whitespace-nowrap text-xs text-slate-300">
                      <div className="flex flex-col gap-0.5 font-mono">
                        <div><span className="text-slate-500 font-sans">Odo:</span> {u.lastOdometer?.toLocaleString() || 0} km</div>
                        <div><span className="text-slate-500 font-sans">Fuel:</span> {u.fuelLevel ?? 100}%</div>
                      </div>
                    </td>

                    {/* Expiry */}
                    <td className="p-4 whitespace-nowrap text-xs text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        {u.taxExpiryDate && <div><span className="text-slate-500">Tax:</span> {u.taxExpiryDate}</div>}
                        {u.stnkExpiryDate && <div><span className="text-slate-500">STNK:</span> {u.stnkExpiryDate}</div>}
                      </div>
                    </td>

                    {/* Actions */}
                    {canModify && currentUser.name.includes(u.location) && (
                      <td className="p-4 pr-6 whitespace-nowrap text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditStatus(u)}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 text-xs font-semibold transition-all"
                            title="Update Status"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Status
                          </button>
                          <button
                            onClick={() => openEditDetails(u)}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-all"
                            title="Edit Specifications"
                          >
                            <Settings className="h-3.5 w-3.5 text-slate-400" />
                            Spec
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white/5 border border-white/5 rounded-2xl p-4 select-none">
          <span className="text-xs text-slate-400 font-medium font-semibold">
            Page <strong className="text-white font-mono">{currentPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong> ({totalFiltered} units match filters)
          </span>
          
          <div className="inline-flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161d2e] hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161d2e] hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}


      {/* Floating alert/guide for Pool reps */}
      {currentUser.role === 'Pool' && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3 text-sm text-slate-300">
          <Shield className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Active Operational Session:</strong> You are logged in as {currentUser.name}. You represent the vehicle marshaling dispatch (pool). You can register fleet arrivals in Jakarta/Surabaya, update standard services, and assign vehicles to pipeline rental requests.
          </div>
        </div>
      )}

      {/* MODAL: REGISTER VEHICLE */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}></div>
          
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-400" />
                Register New Vehicle Unit
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Plate Number (Nomor Polisi)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B 1234 ABC"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vehicle Model / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Innova / Avanza"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Year (Tahun Pembuatan)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2023"
                    value={newManufactureYear}
                    onChange={(e) => setNewManufactureYear(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color (Warna)</label>
                  <input
                    type="text"
                    placeholder="e.g. Putih"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transmission</label>
                  <select
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fuel Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newFuelLevel}
                    onChange={(e) => setNewFuelLevel(Number(e.target.value))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Odometer (km)</label>
                  <input
                    type="number"
                    min="0"
                    value={newLastOdometer}
                    onChange={(e) => setNewLastOdometer(Number(e.target.value))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tax Expiry (Pajak)</label>
                  <input
                    type="date"
                    value={newTaxExpiryDate}
                    onChange={(e) => setNewTaxExpiryDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">STNK Expiry</label>
                  <input
                    type="date"
                    value={newStnkExpiryDate}
                    onChange={(e) => setNewStnkExpiryDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {newStatus === 'Maintenance' && (
                <div>
                  <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5 font-bold">Maintenance Stage</label>
                  <select
                    value={newMaintenanceStatus}
                    onChange={(e) => setNewMaintenanceStatus(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-rose-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="In Queue">In Queue (Waiting for Workshop)</option>
                    <option value="Being Serviced">Being Serviced (Currently in Repair)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Service Date</label>
                <input
                  type="date"
                  value={newServiceDate}
                  onChange={(e) => setNewServiceDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Operational Logs / Inspector Notes</label>
                <textarea
                  placeholder="Include any specific remarks about car condition, tires, insurance, or documents..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Add to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS & LINK */}
      {isEditStatusOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setIsEditStatusOpen(false)}></div>
          
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-400" />
                Update Unit: {selectedUnit.plateNumber}
              </h2>
              <button onClick={() => setIsEditStatusOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl mb-4 border border-white/5 flex gap-3 text-xs text-slate-300">
              <Car className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>{selectedUnit.model}</strong> ({selectedUnit.location})
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Operational Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as UnitStatus)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Available">Available (Ready to Dispatch)</option>
                  <option value="Maintenance">Maintenance (Workshop Scheduled or In Repair)</option>
                  <option value="Rent Out">Rent Out (Allocated on active Lease)</option>
                  <option value="Booked">Booked (Earmarked for Client proposal)</option>
                  <option value="Hold">Hold (Selected during Negotiation)</option>
                </select>
              </div>

              {editStatus === 'Maintenance' && (
                <div>
                  <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5 font-bold">Maintenance Stage</label>
                  <select
                    value={editMaintenanceStatus}
                    onChange={(e) => setEditMaintenanceStatus(e.target.value as any)}
                    className="w-full bg-[#0f172a] border border-rose-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="In Queue">In Queue (Waiting for Workshop)</option>
                    <option value="Being Serviced">Being Serviced (Currently in Repair)</option>
                  </select>
                </div>
              )}

              {/* Dynamic Linkage form fields */}
              {(editStatus === 'Rent Out' || editStatus === 'Booked' || editStatus === 'Hold') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assign to Long Term Deal/Contract</label>
                  {longTermDeals.length === 0 ? (
                    <div className="text-xs text-amber-400 py-1 font-medium bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      No active Mobil Long Term deals found to link. Please register a pipeline deal first.
                    </div>
                  ) : (
                    <select
                      value={editAssignedDeal}
                      onChange={(e) => setEditAssignedDeal(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose active customer lease contract --</option>
                      {longTermDeals.map((d) => {
                        const comp = companies.find(c => c.id === d.companyId);
                        return (
                          <option key={d.id} value={d.id}>
                            {comp ? comp.name : 'Unknown Corp'} - {d.title} ({d.stage})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Service Date</label>
                <input
                  type="date"
                  value={editServiceDate}
                  onChange={(e) => setEditServiceDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Latest Inspector Log / Remark</label>
                <textarea
                  placeholder="Record vehicle status details, e.g. 'Oli mesin diganti, ban baru, siap pakai.'"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditStatusOpen(false)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE ASSET DATA */}
      {isEditDetailsOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setIsEditDetailsOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Update Asset Data: {selectedUnit.plateNumber}
              </h2>
              <button onClick={() => setIsEditDetailsOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Manufacture Year</label>
                  <input
                    type="text"
                    value={editManufactureYear}
                    onChange={(e) => setEditManufactureYear(e.target.value)}
                    placeholder="e.g. 2023"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Color</label>
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    placeholder="e.g. Black"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transmission</label>
                  <select
                    value={editTransmission}
                    onChange={(e) => setEditTransmission(e.target.value as 'Manual' | 'Automatic')}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Automatic">Automatic (AT)</option>
                    <option value="Manual">Manual (MT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fuel Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editFuelLevel}
                    onChange={(e) => setEditFuelLevel(Number(e.target.value))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tax Expiry (Masa Pajak)</label>
                  <input
                    type="date"
                    value={editTaxExpiryDate}
                    onChange={(e) => setEditTaxExpiryDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">STNK Expiry (Masa STNK)</label>
                  <input
                    type="date"
                    value={editStnkExpiryDate}
                    onChange={(e) => setEditStnkExpiryDate(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Odometer (km)</label>
                <input
                  type="number"
                  min="0"
                  value={editLastOdometer}
                  onChange={(e) => setEditLastOdometer(Number(e.target.value))}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditDetailsOpen(false)}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Asset Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULFILL DEAL UNITS */}
      {fulfillmentDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setFulfillmentDeal(null)}></div>
          
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/20 bg-[#161d2e] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-amber-500" />
                Fulfill Mobil Long Term
              </h2>
              <button onClick={() => setFulfillmentDeal(null)} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const comp = companies.find(c => c.id === fulfillmentDeal.companyId);
              const longTermItem = fulfillmentDeal.products?.find(p => p.category === 'Mobil Long Term');
              const reqQty = longTermItem ? (longTermItem.quantity || 1) : 0;
              const currentlySelectedCount = fulfillmentSelectedUnitIds.length;
              
              const availableUnitsToPick = units.filter(u => 
                (u.status === 'Available' || (['Hold', 'Booked', 'Rent Out'].includes(u.status) && u.assignedDealId === fulfillmentDeal.id)) && 
                u.category === 'Mobil Long Term' && 
                (fulfillmentLocationFilter === 'All' || u.location === fulfillmentLocationFilter)
              );

              return (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="bg-white/5 p-3 rounded-2xl mb-4 border border-white/5 text-xs text-slate-300 shrink-0">
                    <div className="font-bold text-white mb-1 tracking-tight truncate">{comp?.name || 'Unknown Company'}</div>
                    <div className="text-slate-400 truncate">{fulfillmentDeal.title}</div>
                    <div className="mt-2 flex items-center justify-between bg-[#0f172a] rounded-xl p-2 border border-white/5">
                      <span className="font-bold text-slate-400">Required Fleet Quantity:</span>
                      <span className="font-mono font-bold text-amber-400">{currentlySelectedCount} / {reqQty} Selected</span>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between shrink-0">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Units</label>
                    <select
                      className="bg-[#0f172a] border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      value={fulfillmentLocationFilter}
                      onChange={(e) => setFulfillmentLocationFilter(e.target.value as any)}
                    >
                      <option value="All">All Locations</option>
                      <option value="Jakarta">Jakarta Pool</option>
                      <option value="Surabaya">Surabaya Pool</option>
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[200px]">
                    {availableUnitsToPick.length === 0 ? (
                      <div className="text-xs text-slate-500 py-4 text-center bg-[#0f172a] rounded-xl border border-white/5">No available units match the criteria.</div>
                    ) : (
                      availableUnitsToPick.map((u) => {
                        const isSelected = fulfillmentSelectedUnitIds.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (isSelected) {
                                setFulfillmentSelectedUnitIds(prev => prev.filter(id => id !== u.id));
                              } else {
                                if (fulfillmentSelectedUnitIds.length < reqQty) {
                                  setFulfillmentSelectedUnitIds(prev => [...prev, u.id]);
                                }
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]'
                                : fulfillmentSelectedUnitIds.length >= reqQty
                                  ? 'bg-[#0f172a] border-white/5 text-slate-500 opacity-50 cursor-not-allowed'
                                  : 'bg-[#0f172a] border-white/5 text-slate-300 hover:border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border ${isSelected ? 'border-amber-500 bg-amber-500 flex items-center justify-center' : 'border-slate-600'}`}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-mono text-sm font-bold ${isSelected ? 'text-amber-100' : 'text-slate-200'}`}>
                                  {u.plateNumber}
                                </span>
                                <span className={`text-[10px] ${isSelected ? 'text-amber-300/70' : 'text-slate-500'}`}>
                                  {u.model} • {u.location}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${u.assignedDealId === fulfillmentDeal.id ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                              {u.assignedDealId === fulfillmentDeal.id ? 'Already Linked' : 'Available'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFulfillmentDeal(null)}
                      className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFulfillment}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition-all"
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
