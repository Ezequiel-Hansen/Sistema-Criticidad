import { useMemo, useState } from 'react'
import { flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getSortedRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
  type LegacyFeatures,
} from '@tanstack/react-table/legacy'
import type { Activo } from '../types'
import { colorFor, scoreOf, zoneFor, hasSpecialCase } from '../constants'

const col = legacyCreateColumnHelper<Row>()

type Row = Activo & { score: number; index: number }

export function ResultsTable({ activos }: { activos: Activo[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'index', desc: false }])

  const confirmados = useMemo(() => activos.filter((a) => a.verify), [activos])

  const data = useMemo<Row[]>(
    () => confirmados.map((a, i) => ({ ...a, score: scoreOf(a), index: i })),
    [confirmados],
  )

  const columns = useMemo(() => [
      col.display({
        id: 'index',
        header: '#',
        cell: (c) => (
          <span
            className="inline-flex w-6 h-6 rounded-full items-center justify-center font-mono font-semibold text-[12px] text-white"
            style={{ background: colorFor(c.row.original.index) }}
          >
            {c.row.original.index + 1}
          </span>
        ),
      }),
      col.accessor('name', {
        header: 'Activo',
        cell: (c) => (
          <span className="font-semibold text-ink">
            {c.getValue() || `Equipo ${c.row.original.index + 1}`}
          </span>
        ),
      }),
      col.accessor('freq_score', {
        header: 'F',
        cell: (c) => <b className="font-mono text-navy-deep">{c.getValue()}</b>,
      }),
      col.accessor('safety_score', {
        header: 'S',
        cell: (c) => <b className="font-mono text-navy-deep">{c.getValue()}</b>,
      }),
      col.accessor('environment_score', {
        header: 'A',
        cell: (c) => <b className="font-mono text-navy-deep">{c.getValue()}</b>,
      }),
      col.accessor('production_score', {
        header: 'P',
        cell: (c) => <b className="font-mono text-navy-deep">{c.getValue()}</b>,
      }),
      col.accessor('score', { header: 'Score', cell: (c) => `${c.getValue()} / 100` }),
      col.accessor((r: Row) => r.score, {
        id: 'zona',
        header: 'Zona',
        cell: (c) => {
          const z = zoneFor(c.row.original.score)
          return (
            <span
              className="inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold text-white"
              style={{ background: z.color }}
            >
              {z.label}
            </span>
          )
        },
      }),
      col.accessor((r: Row) => r.score, {
        id: 'estrategia',
        header: 'Estrategia',
        cell: (c) => {
          const z = zoneFor(c.row.original.score)
          return (
            <span className="font-mono text-[12px] font-bold text-navy-deep whitespace-nowrap">
              {z.strategy}
            </span>
          )
        },
      }),
      col.display({
        id: 'caso_especial',
        header: 'Caso Esp.',
        cell: (c) => {
          const special = hasSpecialCase(c.row.original)
          return special ? (
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red text-white">
              Sí
            </span>
          ) : (
            <span className="text-ink-soft">—</span>
          )
        },
      }),
    ] as unknown as ColumnDef<LegacyFeatures, Row, unknown>[],
    [],
  )

  const table = useLegacyTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full border-collapse text-left text-[13px]">
        <caption className="sr-only">Estrategia sugerida por activo verificado</caption>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  aria-sort={h.column.getIsSorted() ? (h.column.getIsSorted() === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="pb-3 pr-3 font-mono text-[11px] tracking-[.08em] uppercase text-ink-soft cursor-pointer select-none hover:text-navy-deep whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() ? (h.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-line last:border-b">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-3 pr-3 text-ink-soft whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-ink-soft italic">
                Sin activos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}