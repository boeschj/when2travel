import { atom } from "jotai";

import type { RecordStorageKey, StorageValue } from "@/lib/storage";
import { createStorageAtom, STORAGE_KEYS } from "@/lib/storage";

const EMPTY_RECORD: Record<string, string> = {};

export const planEditTokensAtom = createStorageAtom(STORAGE_KEYS.planEditTokens, EMPTY_RECORD);
export const responseEditTokensAtom = createStorageAtom(
  STORAGE_KEYS.responseEditTokens,
  EMPTY_RECORD,
);
export const responsePlanIdsAtom = createStorageAtom(STORAGE_KEYS.responsePlanIds, EMPTY_RECORD);
export const tripsBannerDismissedAtom = createStorageAtom(STORAGE_KEYS.tripsBannerDismissed, false);

export const createdPlanIdsAtom = atom(get => {
  const planEditTokens = get(planEditTokensAtom);
  const planIds = Object.keys(planEditTokens);
  const createdPlanIds = new Set(planIds);
  return createdPlanIds;
});

export const allPlanIdsAtom = atom(get => {
  const createdPlanIds = get(createdPlanIdsAtom);
  const responsePlanIds = get(responsePlanIdsAtom);
  const respondedPlanIds = Object.values(responsePlanIds);
  const uniquePlanIds = new Set([...createdPlanIds, ...respondedPlanIds]);
  const planIdsAsArray = [...uniquePlanIds];
  return planIdsAsArray;
});

export const cleanupDeletedPlansAtom = atom(null, (get, set, deletedPlanIds: string[]) => {
  set(planEditTokensAtom, prev => omitKeys(prev, deletedPlanIds));

  const responsePlanIds = get(responsePlanIdsAtom);
  const orphanedResponseIds = getKeysByValues(responsePlanIds, deletedPlanIds);

  if (orphanedResponseIds.length > 0) {
    set(responsePlanIdsAtom, prev => omitKeys(prev, orphanedResponseIds));
    set(responseEditTokensAtom, prev => omitKeys(prev, orphanedResponseIds));
  }
});

type RecordStorageValue = StorageValue<RecordStorageKey>;

function omitKeys(record: RecordStorageValue, keysToRemove: string[]): RecordStorageValue {
  const keysToRemoveSet = new Set(keysToRemove);
  const entries = Object.entries(record).filter(([key]) => !keysToRemoveSet.has(key));
  return Object.fromEntries(entries);
}

function getKeysByValues(record: RecordStorageValue, valuesToMatch: string[]) {
  const entries = Object.entries(record);
  const matchingEntries = entries.filter(([, value]) => valuesToMatch.includes(value));
  return matchingEntries.map(([key]) => key);
}
