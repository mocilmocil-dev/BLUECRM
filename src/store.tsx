import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Company, Target, Deal, Unit, Driver } from './types';
import { mockUsers, mockCompanies, mockTargets, mockDeals, mockUnits, mockDrivers } from './mockData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

interface CRMContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  targets: Target[];
  updateTarget: (target: Target) => void;
  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (dealId: string) => void;
  units: Unit[];
  addUnit: (unit: Unit) => void;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (unitId: string) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (driverId: string) => void;
  loading: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const getInitialData = <T,>(key: string, defaultData: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
  }
  return defaultData;
};

const seedDatabase = async () => {
  const seedVersion = 'v5';
  if (localStorage.getItem(`crm_seeded_${seedVersion}`)) {
    return;
  }
  try {
    const batch = writeBatch(db);
    
    // 1. Seed Users
    for (const u of mockUsers) {
      batch.set(doc(db, 'users', u.id), JSON.parse(JSON.stringify(u)), { merge: true });
    }
    
    // 2. Seed Companies
    for (const c of mockCompanies) {
      batch.set(doc(db, 'companies', c.id), JSON.parse(JSON.stringify(c)), { merge: true });
    }

    // 3. Seed Targets
    for (const t of mockTargets) {
      batch.set(doc(db, 'targets', t.id), JSON.parse(JSON.stringify(t)), { merge: true });
    }

    // 4. Seed Deals
    for (const d of mockDeals) {
      batch.set(doc(db, 'deals', d.id), JSON.parse(JSON.stringify(d)), { merge: true });
    }

    // 5. Seed Units unconditionally for mock data to ensure all new fields are present
    for (const un of mockUnits) {
      batch.set(doc(db, 'units', un.id), JSON.parse(JSON.stringify(un)), { merge: true });
    }

    // 6. Seed Drivers
    for (const dr of mockDrivers) {
      batch.set(doc(db, 'drivers', dr.id), JSON.parse(JSON.stringify(dr)), { merge: true });
    }

    await batch.commit();
    localStorage.setItem(`crm_seeded_${seedVersion}`, 'true');
    console.log('Seeded database successfully with batch');
  } catch (error) {
    console.error('Failed to seed Firebase database:', error);
  }
};

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => getInitialData('crm_currentUser', mockUsers[0]));
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [targets, setTargets] = useState<Target[]>(mockTargets);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('crm_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubCompanies: (() => void) | undefined;
    let unsubTargets: (() => void) | undefined;
    let unsubDeals: (() => void) | undefined;
    let unsubUnits: (() => void) | undefined;
    let unsubDrivers: (() => void) | undefined;

    seedDatabase().then(() => {
      // Setup live sync with Firebase
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: User[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as User);
        });
        if (list.length > 0) {
          setUsers(list);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
      });

      unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
        const list: Company[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Company);
        });
        setCompanies(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'companies');
      });

      unsubTargets = onSnapshot(collection(db, 'targets'), (snapshot) => {
        const list: Target[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Target);
        });
        setTargets(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'targets');
      });

      unsubDeals = onSnapshot(collection(db, 'deals'), (snapshot) => {
        const list: Deal[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Deal);
        });
        setDeals(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'deals');
      });

      unsubUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
        const list: Unit[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Unit);
        });
        setUnits(list);
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'units');
      });

      unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
        const list: Driver[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Driver);
        });
        setDrivers(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'drivers');
      });
    });

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubCompanies) unsubCompanies();
      if (unsubTargets) unsubTargets();
      if (unsubDeals) unsubDeals();
      if (unsubUnits) unsubUnits();
      if (unsubDrivers) unsubDrivers();
    };
  }, []);

  const addCompany = async (company: Company) => {
    try {
      await setDoc(doc(db, 'companies', company.id), JSON.parse(JSON.stringify(company)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `companies/${company.id}`);
    }
  };

  const updateCompany = async (company: Company) => {
    try {
      await setDoc(doc(db, 'companies', company.id), JSON.parse(JSON.stringify(company)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `companies/${company.id}`);
    }
  };

  const updateTarget = async (target: Target) => {
    try {
      await setDoc(doc(db, 'targets', target.id), JSON.parse(JSON.stringify(target)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `targets/${target.id}`);
    }
  };

  const addDeal = async (deal: Deal) => {
    try {
      await setDoc(doc(db, 'deals', deal.id), JSON.parse(JSON.stringify(deal)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}`);
    }
  };

  const updateDeal = async (deal: Deal) => {
    try {
      await setDoc(doc(db, 'deals', deal.id), JSON.parse(JSON.stringify(deal)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}`);
    }
  };

  const deleteDeal = async (dealId: string) => {
    try {
      await deleteDoc(doc(db, 'deals', dealId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deals/${dealId}`);
    }
  };

  const addUnit = async (unit: Unit) => {
    try {
      await setDoc(doc(db, 'units', unit.id), JSON.parse(JSON.stringify(unit)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `units/${unit.id}`);
    }
  };

  const updateUnit = async (unit: Unit) => {
    try {
      await setDoc(doc(db, 'units', unit.id), JSON.parse(JSON.stringify(unit)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `units/${unit.id}`);
    }
  };

  const deleteUnit = async (unitId: string) => {
    try {
      await deleteDoc(doc(db, 'units', unitId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `units/${unitId}`);
    }
  };

  const addDriver = async (driver: Driver) => {
    try {
      await setDoc(doc(db, 'drivers', driver.id), JSON.parse(JSON.stringify(driver)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `drivers/${driver.id}`);
    }
  };

  const updateDriver = async (driver: Driver) => {
    try {
      await setDoc(doc(db, 'drivers', driver.id), JSON.parse(JSON.stringify(driver)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `drivers/${driver.id}`);
    }
  };

  const deleteDriver = async (driverId: string) => {
    try {
      await deleteDoc(doc(db, 'drivers', driverId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `drivers/${driverId}`);
    }
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        companies,
        addCompany,
        updateCompany,
        targets,
        updateTarget,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        units,
        addUnit,
        updateUnit,
        deleteUnit,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        loading,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
