export const getLocalStorageConfigBool = (key: string, defaultVal: boolean): boolean => {
  const val = localStorage.getItem(key);
  if (val == undefined) return defaultVal;
  return val == 'true';
}

export const getLocalStorageConfigString = (key: string, defaultVal: string): string => {
  const val = localStorage.getItem(key);
  if (val == undefined) return defaultVal;
  return val;
}

export const getLocalStorageConfigNumber = (key: string, defaultVal: number | undefined): number | undefined => {
  const val = localStorage.getItem(key);
  if (val == undefined) return defaultVal;
  return +val;
}

export const getLocalStorageConfigJSON = <T>(key: string, defaultVal: T): T => {
  const val = localStorage.getItem(key);
  if (val == undefined) return defaultVal;
  return JSON.parse(val);
}

export const setLocalStorageConfigBool = (key: string, val: boolean) => {
  localStorage.setItem(key, '' + val);
}

export const setLocalStorageConfigString = (key: string, val: string) => {
  localStorage.setItem(key, val);
}

export const setLocalStorageConfigNumber = (key: string, val: number) => {
  localStorage.setItem(key, val + '');
}

export const setLocalStorageConfigJSON = (key: string, val: any) => {
  localStorage.setItem(
    key,
    JSON.stringify(
      val ?? {}
    )
  );
}
