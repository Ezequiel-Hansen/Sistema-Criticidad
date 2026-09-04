<div align="center">

# Sistema criticidad

### Evaluación de Criticidad de Activos Industriales

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

</div>

---

## Descripción

Sistema web para el **cálculo y gestión de criticidad de activos industriales**, implementado según la metodología **PR-MNT-001** de **Synthesia Technologies**

El sistema evalúa cada activo industrial en **4 dimensiones**:

| Dimensión | Descripción |
|-----------|-------------|
| **Frecuencia** | Frecuencia de ocurrencia del MRO (Máximo Razonable Ocurrencia) |
| **Seguridad** | Impacto en la seguridad de las personas |
| **Ambiental** | Impacto en el medio ambiente |
| **Producción** | Impacto en la producción y el negocio |

A partir de estas evaluaciones se calcula un **puntaje de criticidad (1-100)** y se clasifica cada activo en una **zona** con su respectiva estrategia de mantenimiento recomendada:

| Zona | Puntaje | Estrategia | Acción |
|------|---------|------------|--------|
| 🟢 **Baja** | 1 - 25 | Correctivo | Reparar cuando falle, es más económico |
| 🟡 **Media** | 26 - 49 | Preventivo | Mantenimiento programado periódico |
| 🟠 **Alta** | 50 - 80 | Predictivo | Monitoreo de condición y tendencia |
| 🔴 **Crítica** | 81 - 100 | RCM / Rediseño | Análisis de causa raíz y rediseño |

> **Caso especial:** Si alguna dimensión de impacto alcanza el valor máximo (10), el activo puede ser declarado como **Crítico** independientemente del puntaje numérico.

---

## Capturas del Sistema


### Formulario de Evaluación de Activos

<!-- ![Formulario de Activo](docs/screenshots/asset-form.png) -->

### Matriz de Criticidad 5×5

<!-- ![Matriz de Criticidad](docs/screenshots/matrix.png) -->

### Distribución por Zonas (Gráfico)

<!-- ![Gráfico de Torta](docs/screenshots/pie-chart.png) -->

### Tabla de Resultados

<!-- ![Tabla de Resultados](docs/screenshots/table.png) -->

### Gestión de Máquinas

<!-- ![Gestión de Máquinas](docs/screenshots/machine-manager.png) -->


## Funcionalidades

- **Gestión de Activos** — Alta, baja, edición y verificación de activos con scoring en 4 ejes
- **Gestión de Máquinas** — Catálogo de máquinas con vinculación many-to-many a activos
- **Matriz de Criticidad** — Visualización 5×5 interactiva (frecuencia vs. impacto máximo)
- **Gráfico de Distribución** — Diagrama de torta con distribución de activos por zona
- **Tabla de Resultados** — Vista ordenable y filtrable de todos los activos verificados
- **Exportación a Excel** — Generación de `.xlsx` con formato condicional por zona y datos de vinculación
- **Autenticación** — Login por email/password con Supabase Auth
- **Control de Acceso** — Lectura pública, escritura solo para usuarios autenticados
- **Responsive Design** — Interfaz adaptada a desktop y móvil con menú hamburguesa

---

## Stack

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Lenguaje** | TypeScript | ~6.0 |
| **Libreria UI** | React | 19.2 |
| **Build Tool** | Vite | 8.2 |
| **Estilos** | Tailwind CSS | 4.3 |
| **Routing** | React Router DOM | 7.18 |
| **State / Data Fetching** | TanStack React Query | 5.101 |
| **Tablas** | TanStack React Table | 9.1 |
| **Formularios** | React Hook Form | 7.85 |
| **Gráficos** | Recharts | 3.10 |
| **Notificaciones** | React Toastify | 11.1 |
| **Exportación Excel** | ExcelJS | 4.4 |
| **Base de Datos** | Supabase (PostgreSQL) | 2.112 |
| **Autenticación** | Supabase Auth | — |
| **Linter** | Oxlint | 1.75 |

---

## Instalación

### Pre-Requisitos

- Node.js >= 18
- npm o yarn

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/sistema.git
cd papa-sistema

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de entorno

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## Estructura del Proyecto

```
papa-sistema/
├── docs/
│   ├── screenshots/       # Capturas del sistema
│
├── supabase/
│   └── schema.sql         # Schema completo de la DB + RLS + seed data
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Navegación responsive
│   │   ├── EditGate.tsx           # Control de autenticación
│   │   ├── AssetForm.tsx          # Formulario de evaluación
│   │   ├── MachineForm.tsx        # Vinculación máquina-activo
│   │   ├── MachineManager.tsx     # CRUD de máquinas
│   │   ├── Matrix.tsx             # Matriz de criticidad 5×5
│   │   ├── CriticityPieChart.tsx  # Gráfico de distribución
│   │   ├── ResultsTable.tsx       # Tabla ordenable de resultados
│   │   └── Toast.tsx              # Contenedor de notificaciones
│   ├── hooks/
│   │   ├── useActivos.ts          # Queries/mutations de activos
│   │   └── useMaquinas.ts         # Queries/mutations de máquinas
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase
│   │   ├── auth.ts                # Helpers de autenticación
│   │   └── exportExcel.ts         # Lógica de exportación
│   ├── pages/
│   │   └── Login.tsx              # Página de login
│   ├── App.tsx                    # Router principal
│   ├── main.tsx                   # Entry point
│   ├── types.ts                   # Tipos TypeScript
│   ├── constants.ts               # Constantes y fórmulas
│   └── index.css                  # Estilos globales + Tailwind
├── .env                           # Variables de entorno (no commitear)
├── package.json
├── vite.config.ts
└── README.md
```

---

## Fórmula de Cálculo

```
Puntaje = Frecuencia × max(Seguridad, Ambiental, Producción)
```

Donde cada dimensión se evalúa con una escala discreta: **1, 3, 5, 7, 10**

---

## Licencia

MIT
