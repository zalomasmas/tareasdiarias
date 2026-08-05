# Registro personal diario

Este repositorio se usa como registro personal de actividades diarias.

## Regla principal

NO modificar archivos, hacer commits ni hacer push automáticamente.
Solo actuar cuando el usuario ejecute explícitamente `/fin-dia` (o pida
"qué hice hoy", "resumen del día", "cierre del día").

## Paso 1: Recolectar actividad de hoy

Ejecutar:

```
node scripts/recolectar-sesiones.js
```

Esto devuelve el texto de todas las sesiones de Claude Code (terminal y
VS Code) modificadas hoy, sin importar el proyecto en que ocurrieron.

## Paso 1b: Revisar claude.ai (opcional)

Además de las sesiones de Claude Code, revisar si hay actividad
relevante en claude.ai (la app/web de Claude), usando la herramienta
"Claude in Chrome" con la sesión ya logueada del usuario (el navegador
sandbox por defecto no tiene sesión iniciada y no sirve para esto):

- Mirar las conversaciones recientes/de hoy en la lista de chats.
- Si el usuario pasa un link de share (claude.ai/share/...), abrirlo
  directamente con Claude in Chrome.
- Extraer solo actividad real (tareas, coordinaciones, trabajo hecho).

IMPORTANTE: nunca reproducir contraseñas, tokens, IPs internas, usuarios
de acceso u otras credenciales en texto plano que aparezcan en esos
chats. Si aparecen, describir la tarea en términos generales (ej.
"configuración de accesos remotos para el cliente X") y avisar al
usuario que se evitó incluir esos datos.

## Paso 2: Analizar y armar lista

A partir de esa salida, identificar únicamente tareas, trabajos,
investigaciones, decisiones o actividades concretas realizadas hoy.

No incluir:
- saludos
- preguntas triviales sin resultado
- pruebas sin importancia
- mensajes repetidos o de debugging trivial

Responder con una lista numerada:

1. Actividad realizada.
2. Actividad realizada.

En este punto NO modificar el repositorio ni hacer commit.

## Paso 3: Edición interactiva

El usuario puede pedir:
- eliminar una tarea
- agregar una tarea
- modificar una tarea
- juntar varias tareas

Mantener la lista actualizada en memoria durante la conversación.

## Paso 4: Confirmación

Solo cuando el usuario diga expresamente:
- "subilo"
- "guardar en github"
- "confirmar día"
- "cerrar día"

crear o actualizar el archivo:

```
actividad/YYYY/MM/YYYY-MM-DD.md
```

con el formato:

```markdown
# Actividades - DD/MM/YYYY

## Tareas realizadas

- Primera actividad.
- Segunda actividad.
```

Y ejecutar, en este orden:

```
git add actividad/YYYY/MM/YYYY-MM-DD.md
git commit -m "Actividad diaria - YYYY-MM-DD"
git push
```

Nunca hacer push antes de la confirmación explícita del usuario.
