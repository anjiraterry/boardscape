"use client";

import type { SurveySubmissionInput } from "@/modules/surveys/schemas";

export interface OfflineSurveyDraft {
  syncKey: string;
  createdAt: string;
  status: "pending" | "syncing" | "synced" | "conflict" | "error";
  attempts: number;
  lastError?: string;
  payload: SurveySubmissionInput;
}

const DB_NAME = "boardscape_field_db";
const STORE_NAME = "survey_drafts";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "syncKey" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineDraft(draft: OfflineSurveyDraft): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listOfflineDrafts(): Promise<OfflineSurveyDraft[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result as OfflineSurveyDraft[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineDraft(syncKey: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(syncKey);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
