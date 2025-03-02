import {Table} from "primeng/table";
import {DestroyRef, effect, Injector, signal, WritableSignal} from "@angular/core";
import {Subject} from "rxjs";
import {getLocalStorageConfigJSON, setLocalStorageConfigJSON} from "./local-storage-utils";
import {Paginator, PaginatorState} from "primeng/paginator";
import {SortEvent} from "primeng/api";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface SortAndPagination {
  sortBy: string | undefined;
  sortByDesc: boolean | undefined;
  start: number;
  rows: number;
}

interface TableControlConfig {
  sorted: boolean;
  order: number;
  sortBy: string | undefined;
  start: number;
  rows: number;
}

const TABLE_CONTROL_DEFAULT_CONFIG: TableControlConfig = {
  sorted: false,
  order: 0,
  sortBy: undefined,
  start: 0,
  rows: 10
}

export interface TableControl {
  sorted: WritableSignal<boolean>;
  order: WritableSignal<number>;
  sortBy: WritableSignal<string | undefined>;
  start: WritableSignal<number>;
  rows: WritableSignal<number>;
  onLoadData$: Subject<SortAndPagination>;
  bindEffects: (injector?: Injector) => void;
  initialize: () => void;
  loadData: () => void;
  onPage: (ev: PaginatorState) => void;
  onSort: (ev: SortEvent) => void;
}

export const TABLE_DEFAULT_PAGE_ROW_OPTIONS = [10, 25, 50, 100];

/**
 * @function tableControl
 * @description Creates a table control with sorting, pagination, and data loading functionality.
 * @param {Table} tableComponent - The primeng Table component.
 * @param {string} [tableName] - The name of the table for storing configuration in local storage.
 * @param {Paginator} [paginator] - The primeng Paginator component. Requires destroyRef parameter.
 * @param {DestroyRef} destroyRef - Angular DestroyRef for managing component lifecycle. You need destroyRef to automatically pipe to paginator. Also, if you provide destroyRef TableControl will pipe to tableComponent.
 * @param {number[]} [tableRowOptions] - An array of row options for the table. You can use TABLE_DEFAULT_PAGE_ROW_OPTIONS.
 * @param {Injector} [injectionContext] - The Angular Injector for creating effects. Effects could be created manually by using bindEffects method.
 * @return TableControl
 */
export const tableControl = (
  tableComponent: Table,
  tableName?: string,
  paginator?: Paginator,
  destroyRef?: DestroyRef,
  tableRowOptions?: number[],
  injectionContext?: Injector
): TableControl => {
  let effectsInitialized = false;
  const localStorageEnabled = tableName !== undefined,
    fullTableName = 'table-config-' + tableName,
    config = localStorageEnabled
      ? getLocalStorageConfigJSON(fullTableName, TABLE_CONTROL_DEFAULT_CONFIG)
      : TABLE_CONTROL_DEFAULT_CONFIG,
    sorted = signal<boolean>(
      config.sorted
    ),
    order = signal<number>(
      config.order
    ),
    sortBy = signal<string | undefined>(
      config.sortBy
    ),
    start = signal<number>(
      config.start
    ),
    rows = signal<number>(
      tableRowOptions?.[0] ?? config.rows
    ),
    onLoadData$ = new Subject<SortAndPagination>(),
    bindEffectsFn: (injector?: Injector) => void = (injector) => {
      if (effectsInitialized) return;
      if (localStorageEnabled) {
        effect(() => {
            const conf: TableControlConfig = {
              sorted: sorted(),
              order: order(),
              sortBy: sortBy(),
              start: start(),
              rows: rows()
            }
            setLocalStorageConfigJSON(fullTableName, conf);
          },
          injector
            ? {injector: injector}
            : {}
        );
        effectsInitialized = true;
      }
    },
    loadData = () => {
      onLoadData$.next({
        ...(
          sorted()
            ? {
              sortBy: sortBy(),
              sortByDesc: order() === -1
            }
            : {
              sortBy: undefined,
              sortByDesc: undefined
            }
        ),
        start: start(),
        rows: rows()
      });
    },
    initializerFn = () => {
      if (
        sortBy()
      ) {
        tableComponent.sortField = sortBy();
        if (order())
          tableComponent.sortOrder = order();
        sorted.set(true);
      }
      loadData();
    },
    onPageFn = (ev: PaginatorState) => {
      start.set(ev.first ?? 0);
      rows.set(ev.rows ?? TABLE_CONTROL_DEFAULT_CONFIG.rows);
      loadData();
    },
    onSortFn = (ev: SortEvent) => {
      if (
        ev.field === sortBy()
        && ev.order === order()
      ) return;
      if (
        sorted()
        && ev.order === 1
      ) {
        order.set(0);
        sortBy.set(undefined);
        sorted.set(false);
        tableComponent.reset();
      } else {
        order.set(ev.order ?? 0);
        sortBy.set(ev.field);
        sorted.set(true);
      }
      loadData();
    };

  if (
    localStorageEnabled
    && injectionContext
  ) {
    bindEffectsFn(injectionContext);
  }

  if (destroyRef) {
    tableComponent.customSort = true;
    tableComponent.onSort
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(ev => onSortFn(ev));
  }

  if (paginator) {
    if (!destroyRef) throw new Error('destroyRef is required for initializing TableControl with Paginator.');
    paginator.onPageChange
      .pipe(
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(ev => onPageFn(ev));
    paginator.rowsPerPageOptions = tableRowOptions ?? TABLE_DEFAULT_PAGE_ROW_OPTIONS as any[];
    paginator.appendTo = 'body';
    paginator.showFirstLastIcon = true;
    paginator.showCurrentPageReport = true;
    paginator.showJumpToPageDropdown = true;
    paginator.rows = rows();
    paginator.first = start();
  }

  return {
    sorted,
    order,
    sortBy,
    start,
    rows,
    onLoadData$,
    bindEffects: bindEffectsFn,
    initialize: initializerFn,
    loadData,
    onPage: onPageFn,
    onSort: onSortFn
  }
}
