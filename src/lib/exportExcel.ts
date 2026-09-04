import ExcelJS from 'exceljs'
import type { Activo, MaquinaConArea } from '../types'
import { scoreOf, zoneFor } from '../constants'

type ActivoMaquinaLink = { activo_id: string; maquina_id: string }

function hexColor(hex: string): string {
  return hex.replace('#', '')
}

export async function exportExcel(
  activos: Activo[],
  todasMaquinas: MaquinaConArea[],
  activoMaquinas: ActivoMaquinaLink[],
) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Criticidad')

  ws.columns = [
    { header: '#', key: 'index', width: 4 },
    { header: 'Activo', key: 'name', width: 25 },
    { header: 'F', key: 'f', width: 4 },
    { header: 'S', key: 's', width: 4 },
    { header: 'A', key: 'a', width: 4 },
    { header: 'P', key: 'p', width: 4 },
    { header: 'Score', key: 'score', width: 12 },
    { header: 'Zona', key: 'zona', width: 10 },
    { header: 'Estrategia', key: 'estrategia', width: 14 },
    { header: 'Máquina', key: 'maquina', width: 25 },
    { header: 'Código Universal', key: 'codUniversal', width: 18 },
    { header: 'Área', key: 'area', width: 20 },
    { header: 'Planta', key: 'planta', width: 15 },
  ]

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexColor('#1B2B5E') },
  }
  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }

  const headerRow = ws.getRow(1)
  headerRow.eachCell((cell) => {
    cell.fill = headerFill
    cell.font = headerFont
    cell.alignment = { horizontal: 'center' }
  })
  headerRow.height = 22

  const confirmados = activos.filter((a) => a.verify)

  confirmados.forEach((a, i) => {
    const maquinasIds = activoMaquinas
      .filter((am) => am.activo_id === a.id)
      .map((am) => am.maquina_id)
    const maquinasVinculadas = todasMaquinas.filter((m) => maquinasIds.includes(m.id))
    const score = scoreOf(a)
    const zona = zoneFor(score)

    if (maquinasVinculadas.length === 0) {
      const row = ws.addRow({
        index: i + 1,
        name: a.name || `Equipo ${i + 1}`,
        f: a.freq_score,
        s: a.safety_score,
        a: a.environment_score,
        p: a.production_score,
        score: `${score} / 100`,
        zona: zona.label,
        estrategia: zona.strategy,
        maquina: '—',
        codUniversal: '—',
        area: '—',
        planta: '—',
      })
      const zoneFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexColor(zona.color) } }
      const whiteFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFF' }, size: 10 }
      row.eachCell((cell) => { cell.fill = zoneFill; cell.font = whiteFont })
      row.height = 20
    } else {
      maquinasVinculadas.forEach((m, mi) => {
        const row = ws.addRow({
          index: mi === 0 ? i + 1 : '',
          name: mi === 0 ? (a.name || `Equipo ${i + 1}`) : '',
          f: mi === 0 ? a.freq_score : '',
          s: mi === 0 ? a.safety_score : '',
          a: mi === 0 ? a.environment_score : '',
          p: mi === 0 ? a.production_score : '',
          score: mi === 0 ? `${score} / 100` : '',
          zona: mi === 0 ? zona.label : '',
          estrategia: mi === 0 ? zona.strategy : '',
          maquina: m.nombre_equipo,
          codUniversal: m.cod_universal,
          area: m.area?.nombre_area || '—',
          planta: m.area?.planta_area || '—',
        })
        const zoneFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexColor(zona.color) } }
        const whiteFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFF' }, size: 10 }
        row.eachCell((cell) => { cell.fill = zoneFill; cell.font = whiteFont })
        row.height = 20
      })
    }
  })

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'criticidad_activos.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}
