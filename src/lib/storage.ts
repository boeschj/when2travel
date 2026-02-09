import {
  atomWithStorage,
  createJSONStorage,
  unstable_withStorageValidator as withStorageValidator,
} from "jotai/utils";
import { z } from "zod";

const STORAGE_SCHEMAS = {
  planEditTokens: z.record(z.string(), z.string()),
  responseEditTokens: z.record(z.string(), z.string()),
  responsePlanIds: z.record(z.string(), z.string()),
  tripsBannerDismissed: z.boolean(),
} as const;

type StorageSchemas = typeof STORAGE_SCHEMAS;
type StorageKey = keyof StorageSchemas;
export type StorageValue<K extends StorageKey> = z.infer<StorageSchemas[K]>;

export const STORAGE_KEYS = {
  planEditTokens: "planEditTokens",
  responseEditTokens: "responseEditTokens",
  responsePlanIds: "responsePlanIds",
  tripsBannerDismissed: "tripsBannerDismissed",
} as const satisfies { [K in StorageKey]: K };

function parseStorageValue<K extends StorageKey>(
  key: K,
  raw: string | null,
): { success: true; data: StorageValue<K> } | { success: false } {
  if (raw === null) return { success: false };

  const jsonParser = z.string().transform((val): unknown => JSON.parse(val));
  const jsonParseResult = jsonParser.safeParse(raw);
  if (!jsonParseResult.success) return { success: false };

  const schema = STORAGE_SCHEMAS[key];
  const validationResult = schema.safeParse(jsonParseResult.data);
  if (!validationResult.success) return { success: false };

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Zod safeParse returns z.infer<schema> but doesn't narrow based on generic key K
  const typedData = validationResult.data as StorageValue<K>;
  return { success: true, data: typedData };
}

export function createStorageAtom<K extends StorageKey>(key: K, defaultValue: StorageValue<K>) {
  const schema = STORAGE_SCHEMAS[key];
  const isValid = (value: unknown): value is StorageValue<K> => {
    const parseResult = schema.safeParse(value);
    return parseResult.success;
  };

  const jsonStorage = createJSONStorage();
  const storage = withStorageValidator(isValid)(jsonStorage);

  const atom = atomWithStorage(key, defaultValue, storage, { getOnInit: true });
  return atom;
}

export type RecordStorageKey = {
  [K in StorageKey]: StorageValue<K> extends Record<string, string> ? K : never;
}[StorageKey];

const EMPTY_RECORD: Record<string, string> = {};

export function getStorageRecord(key: RecordStorageKey): Record<string, string> {
  const rawValue = localStorage.getItem(key);
  const result = parseStorageValue(key, rawValue);
  if (!result.success) return EMPTY_RECORD;
  return result.data;
}
