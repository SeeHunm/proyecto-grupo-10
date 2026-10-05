# Application Security Controls (ASC)

| ID | Riesgo | Control | Evidencia esperada |
|---|---|---|---|
| ASC-01 | A01 | Verificar autenticación, rol y propiedad de zona | Zona ajena retorna 403 |
| ASC-02 | A03 | Consultas parametrizadas y enteros positivos | Entrada inválida retorna 400 |
| ASC-03 | A04 | Validar rangos de negocio | Valores fuera de rango retornan 400 |
| ASC-04 | A05 | Autenticación y rol admin en consola | Sin credenciales 401; farmer 403 |
| ASC-05 | A07 | Secretos fuera del código | Clave antigua ya no autentica |
