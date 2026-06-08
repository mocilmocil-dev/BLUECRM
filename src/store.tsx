import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Company, Target, Deal } from './types';
import { mockUsers, mockCompanies, mockTargets, mockDeals } from './mockData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

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
  try {
    // 1. Seed Users if empty
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log('Seeding users to Firebase...');
      for (const u of mockUsers) {
        await setDoc(doc(db, 'users', u.id), JSON.parse(JSON.stringify(u)));
      }
    }

    // 2. Seed Companies if empty
    const cosSnap = await getDocs(collection(db, 'companies'));
    if (cosSnap.empty) {
      console.log('Seeding companies to Firebase...');
      for (const c of mockCompanies) {
        await setDoc(doc(db, 'companies', c.id), JSON.parse(JSON.stringify(c)));
      }
    }

    // 3. Seed Targets if missing any
    const targetsSnap = await getDocs(collection(db, 'targets'));
    const existingTargetIds = new Set(targetsSnap.docs.map(doc => doc.id));
    let hasNewTargets = false;
    for (const t of mockTargets) {
      if (!existingTargetIds.has(t.id)) {
        await setDoc(doc(db, 'targets', t.id), JSON.parse(JSON.stringify(t)));
        hasNewTargets = true;
      }
    }
    if (hasNewTargets) {
      console.log('Seeded missing targets to Firebase...');
    }

    // 4. Seed Deals if missing any
    const dealsSnap = await getDocs(collection(db, 'deals'));
    const existingDealIds = new Set(dealsSnap.docs.map(doc => doc.id));
    let hasNewDeals = false;
    for (const d of mockDeals) {
      if (!existingDealIds.has(d.id)) {
        await setDoc(doc(db, 'deals', d.id), JSON.parse(JSON.stringify(d)));
        hasNewDeals = true;
      }
    }
    if (hasNewDeals) {
      console.log('Seeded missing deals to Firebase...');
    }
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('crm_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubCompanies: (() => void) | undefined;
    let unsubTargets: (() => void) | undefined;
    let unsubDeals: (() => void) | undefined;

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
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'deals');
      });
    });

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubCompanies) unsubCompanies();
      if (unsubTargets) unsubTargets();
      if (unsubDeals) unsubDeals();
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
      await setDoc(doc(db, 'targets', target.id), target);
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
