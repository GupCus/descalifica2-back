# Banderas de Nacionalidad

Esta carpeta contiene banderas SVG pre-cargadas, nombradas por código ISO 3166-1 alpha-2 del país.

## Uso

El frontend puede acceder a las banderas directamente via:
```
GET /uploads/flags/{codigo_pais}.svg
```

Por ejemplo:
- `/uploads/flags/ar.svg` → Bandera de Argentina
- `/uploads/flags/gb.svg` → Bandera de Gran Bretaña

## Agregar nuevas banderas

1. Descargar el SVG de la bandera (recomendados: [flag-icons](https://github.com/lipis/flag-icons) o [flagpack](https://github.com/Yummygum/flagpack-core))
2. Nombrar el archivo con el código ISO alpha-2 en minúscula (ej: `ar.svg`, `de.svg`)
3. Colocar en esta carpeta

## Códigos comunes en motorsport

| Código | País |
|--------|------|
| ar | Argentina |
| au | Australia |
| at | Austria |
| br | Brasil |
| ca | Canadá |
| cn | China |
| dk | Dinamarca |
| fi | Finlandia |
| fr | Francia |
| de | Alemania |
| gb | Gran Bretaña |
| it | Italia |
| jp | Japón |
| mc | Mónaco |
| mx | México |
| nl | Países Bajos |
| nz | Nueva Zelanda |
| es | España |
| se | Suecia |
| ch | Suiza |
| th | Tailandia |
| us | Estados Unidos |
