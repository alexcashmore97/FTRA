import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  timestamp: Date;
}

export async function writeLog(action: string, details: string, adminEmail: string) {
  await addDoc(collection(db, 'admin_log'), {
    action,
    details,
    adminEmail,
    timestamp: Timestamp.now(),
  });
}

export async function getLogEntries(count = 100): Promise<LogEntry[]> {
  const q = query(
    collection(db, 'admin_log'),
    orderBy('timestamp', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      action: data.action ?? '',
      details: data.details ?? '',
      adminEmail: data.adminEmail ?? '',
      timestamp: data.timestamp?.toDate?.() ?? new Date(),
    };
  });
}
