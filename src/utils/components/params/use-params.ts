import * as React from "react";
import { useSearchParams } from "react-router-dom";

type UrlFieldType = "string" | "number" | "numberArray" | "boolean";

type UrlFieldConfig<TValue> = {
  type: UrlFieldType;
  defaultValue: TValue;
  param?: string;
  removeIfDefault?: boolean;
};

export type UrlQuerySchema<T extends Record<string, any>> = {
  [K in keyof T]: UrlFieldConfig<T[K]>;
};

type NavigationOptions = {
  replace?: boolean;
};

type UseUrlQueryStateOptions = {
  replace?: boolean;
  preserveUnknownParams?: boolean;
};

function parseNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumberArray(value: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);
}

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  return value === "true" || value === "1";
}

function areValuesEqual(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return a === b;
}

function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim().length === 0;
  return value === null || value === undefined;
}

function parseSearchParams<T extends Record<string, any>>(
  params: URLSearchParams,
  schema: UrlQuerySchema<T>,
): T {
  const parsed = {} as T;

  for (const key of Object.keys(schema) as Array<keyof T>) {
    const field = schema[key];
    const paramName = field.param ?? String(key);
    const rawValue = params.get(paramName);

    switch (field.type) {
      case "number":
        parsed[key] = parseNumber(
          rawValue,
          field.defaultValue as number,
        ) as T[keyof T];
        break;

      case "numberArray":
        parsed[key] = parseNumberArray(rawValue) as T[keyof T];
        break;

      case "boolean":
        parsed[key] = parseBoolean(
          rawValue,
          field.defaultValue as boolean,
        ) as T[keyof T];
        break;

      case "string":
      default:
        parsed[key] = (rawValue ?? field.defaultValue) as T[keyof T];
        break;
    }
  }

  return parsed;
}

function writeSearchParams<T extends Record<string, any>>(
  currentParams: URLSearchParams,
  schema: UrlQuerySchema<T>,
  value: T,
  options: Required<Pick<UseUrlQueryStateOptions, "preserveUnknownParams">>,
) {
  const nextParams = options.preserveUnknownParams
    ? new URLSearchParams(currentParams)
    : new URLSearchParams();

  for (const key of Object.keys(schema) as Array<keyof T>) {
    const field = schema[key];
    const paramName = field.param ?? String(key);
    const currentValue = value[key];
    const removeIfDefault = field.removeIfDefault ?? true;

    const shouldRemove =
      isEmptyValue(currentValue) ||
      (removeIfDefault && areValuesEqual(currentValue, field.defaultValue));

    if (shouldRemove) {
      nextParams.delete(paramName);
      continue;
    }

    if (Array.isArray(currentValue)) {
      nextParams.set(paramName, currentValue.join(","));
      continue;
    }

    nextParams.set(paramName, String(currentValue));
  }

  return nextParams;
}

export function useUrlQueryState<T extends Record<string, any>>(
  schema: UrlQuerySchema<T>,
  options: UseUrlQueryStateOptions = {},
) {
  const { replace = true, preserveUnknownParams = true } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const value = React.useMemo(
    () => parseSearchParams(searchParams, schema),
    [searchParams, schema],
  );

  const setValue = React.useCallback(
    (
      updater: React.SetStateAction<T>,
      navigationOptions?: NavigationOptions,
    ) => {
      setSearchParams(
        (prevParams) => {
          const currentValue = parseSearchParams(prevParams, schema);

          const nextValue =
            typeof updater === "function"
              ? (updater as (prev: T) => T)(currentValue)
              : updater;

          return writeSearchParams(prevParams, schema, nextValue, {
            preserveUnknownParams,
          });
        },
        {
          replace: navigationOptions?.replace ?? replace,
        },
      );
    },
    [schema, setSearchParams, preserveUnknownParams, replace],
  );

  const patchValue = React.useCallback(
    (
      updater: Partial<T> | ((prev: T) => Partial<T>),
      navigationOptions?: NavigationOptions,
    ) => {
      setValue((prev) => {
        const patch = typeof updater === "function" ? updater(prev) : updater;

        return {
          ...prev,
          ...patch,
        };
      }, navigationOptions);
    },
    [setValue],
  );

  const resetValue = React.useCallback(
    (navigationOptions?: NavigationOptions) => {
      const defaults = {} as T;

      for (const key of Object.keys(schema) as Array<keyof T>) {
        defaults[key] = schema[key].defaultValue;
      }

      setValue(defaults, navigationOptions);
    },
    [schema, setValue],
  );

  return {
    value,
    setValue,
    patchValue,
    resetValue,
    searchParams,
  };
}

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}
