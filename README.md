# AgriSmart API — Caso 10 DevSecOps

Proyecto académico para demostrar y mitigar cinco riesgos OWASP Top 10 en una API de monitoreo agrícola y riego.

## Riesgos seleccionados

- A01: Broken Access Control
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A07: Identification and Authentication Failures

## Estructura

```text
src/vulnerable/       versión deliberadamente insegura (solo laboratorio)
src/seguro/           versión refactorizada
auditoria/fase1/      evidencias de la versión vulnerable
auditoria/fase2/      evidencias de la versión segura
scripts/              auditoría automatizada
gobierno-seguridad/   manifiesto, ONF y ASC
docs/                 informe Word
```

## Requisitos

- Node.js 18 o superior
- npm
- PowerShell (Windows) o Bash

## Instalación

```bash
npm install
```

## Ejecutar versión vulnerable

```bash
npm run vulnerable
```

Disponible en `http://localhost:3000`.

La clave incrustada deliberadamente para la demostración A07 es:

```text
AGRISMART-DEMO-1234
```

**No usar esa clave en sistemas reales.**

## Ejecutar versión segura

1. Copiar `.env.example` a `.env`.
2. Cambiar `API_KEY` si se desea.
3. Ejecutar:

```bash
npm run seguro
```

Disponible en `http://localhost:3001`.

## Usuarios de laboratorio

| ID | Usuario | Rol |
|---:|---|---|
| 1 | agricultor1 | farmer |
| 2 | agricultor2 | farmer |
| 3 | admin | admin |

Zona 1 pertenece a usuario 1 y zona 2 a usuario 2.

## Endpoints

- `GET /` — estado y guía rápida
- `GET /api/sensors`
- `GET /api/history?zone_id=1`
- `PUT /api/zones/:id/irrigation`
- `PUT /api/zones/:id/settings`
- `GET /admin/sensors`

Las rutas autenticadas usan los encabezados de laboratorio:

```text
x-api-key: <clave>
x-user-id: 1
```

## Auditoría automática en PowerShell

Versión vulnerable:

```powershell
powershell -ExecutionPolicy Bypass -File .\scriptsuditoria.ps1 `
  -BaseUrl http://localhost:3000 `
  -ApiKey AGRISMART-DEMO-1234 `
  -OutputDir .uditoriaase1
```

Versión segura, usando la clave por defecto del `.env.example`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scriptsuditoria.ps1 `
  -BaseUrl http://localhost:3001 `
  -ApiKey AGRISMART-SECURE-CHANGE-ME `
  -OutputDir .uditoriaase2
```

El script guarda `A01.txt`, `A03.txt`, `A04.txt`, `A05.txt` y `A07.txt`.

## Resultados esperados

| Prueba | Vulnerable | Segura |
|---|---|---|
| A01 usuario 1 modifica zona 2 | 200 | 403 |
| A03 entrada SQL en zone_id | 200 / consulta alterada | 400 |
| A04 valores fuera de rango | 200 | 400 |
| A05 admin sin autenticación | 200 | 401 |
| A07 clave antigua incrustada | 200 | 401 |

## Seguridad del laboratorio

La versión `src/vulnerable` contiene fallos intencionales y debe utilizarse únicamente en `localhost` o una red de laboratorio autorizada. No conectar el proyecto con infraestructura agrícola real ni publicarlo como servicio accesible desde Internet.
