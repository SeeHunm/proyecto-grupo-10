# AgriSmart API — Caso 10 DevSecOps

Proyecto académico de Desarrollo Seguro para demostrar, auditar y mitigar cinco riesgos del OWASP Top 10 en una API de monitoreo de sensores agrícolas y control de riego.

## Caso trabajado

**Caso 10: AgriTech — Sistema de Monitoreo de Sensores Agrícolas y Riego (AgriSmart API).**

La aplicación recibe datos de sensores agrícolas y permite controlar zonas de riego. Para la evaluación se implementaron dos versiones:

- `src/vulnerable/`: versión deliberadamente insegura para laboratorio.
- `src/seguro/`: versión refactorizada con controles defensivos.

## Riesgos seleccionados

- **A01 — Broken Access Control**
- **A03 — Injection**
- **A04 — Insecure Design**
- **A05 — Security Misconfiguration**
- **A07 — Identification and Authentication Failures**

## Estructura del repositorio

```text
src/vulnerable/       API vulnerable de laboratorio
src/seguro/           API segura/refactorizada
auditoria/fase1/      evidencias de la versión vulnerable
auditoria/fase2/      evidencias de la versión segura
scripts/              scripts de apoyo para auditoría
gobierno-seguridad/   manifiesto ético, ONF y ASC
docs/                 informe del proyecto
```

## Requisitos

- Node.js 18 o superior
- npm
- Windows CMD/PowerShell para los scripts `.cmd`

## Instalación

En Windows:

```text
01_INSTALAR.cmd
```

O manualmente:

```bash
npm install
```

## Ejecutar la versión vulnerable

```text
02_EJECUTAR_VULNERABLE.cmd
```

La API queda disponible en:

```text
http://localhost:3000
```

> Esta versión contiene vulnerabilidades intencionales y debe usarse únicamente en localhost o en un laboratorio autorizado.

## Auditoría automática — Fase 1

Con la versión vulnerable ejecutándose:

```text
04_AUDITAR_VULNERABLE.cmd
```

Las evidencias se guardan automáticamente en:

```text
auditoria/fase1/
```

## Ejecutar la versión segura

```text
03_EJECUTAR_SEGURO.cmd
```

La API queda disponible en:

```text
http://localhost:3001
```

La versión segura utiliza variables de entorno. El archivo `.env` no se versiona; se conserva `.env.example` como plantilla.

## Auditoría automática — Fase 2

Con la versión segura ejecutándose:

```text
05_AUDITAR_SEGURO.cmd
```

Las evidencias se guardan automáticamente en:

```text
auditoria/fase2/
```

## Resultados obtenidos

| Prueba | Versión vulnerable | Versión segura | Estado |
|---|---:|---:|---|
| A01 — acceso a zona ajena | HTTP 200 | HTTP 403 | Mitigado |
| A03 — entrada SQL maliciosa | HTTP 200 | HTTP 400 | Mitigado |
| A04 — valores fuera de rango | HTTP 200 | HTTP 400 | Mitigado |
| A05 — acceso administrativo sin autenticación | HTTP 200 | HTTP 401 | Mitigado |
| A07 — uso de credencial insegura | HTTP 200 | HTTP 401 | Mitigado |

Las respuestas completas se encuentran en los archivos `.txt` de `auditoria/fase1/` y `auditoria/fase2/`.

## Controles implementados en la versión segura

- Verificación de propiedad y autorización por zona.
- Validación estricta de parámetros y rangos.
- Consultas SQL parametrizadas.
- Protección de endpoints administrativos.
- Uso de variables de entorno para secretos.
- Respuestas HTTP defensivas controladas (`400`, `401`, `403`).
- Cabeceras de seguridad mediante `helmet`.

## Seguridad del laboratorio

La versión vulnerable existe exclusivamente con fines académicos. No debe publicarse como servicio accesible desde Internet, utilizar credenciales reales ni conectarse a bombas, sensores o infraestructura agrícola real.
