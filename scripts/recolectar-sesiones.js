#!/usr/bin/env node
/**
 * Recolecta todas las sesiones de Claude Code modificadas HOY,
 * sin importar en qué carpeta/proyecto se ejecutaron.
 *
 * Uso: node recolectar-sesiones.js
 * Salida: texto plano con los mensajes de usuario/asistente de hoy,
 *         listo para pasarle a Claude como contexto.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

function esHoy(fechaMod) {
  const hoy = new Date();
  return (
    fechaMod.getFullYear() === hoy.getFullYear() &&
    fechaMod.getMonth() === hoy.getMonth() &&
    fechaMod.getDate() === hoy.getDate()
  );
}

function listarJsonlDeHoy(dir) {
  const resultados = [];
  if (!fs.existsSync(dir)) {
    console.error(`No existe el directorio: ${dir}`);
    return resultados;
  }

  const proyectos = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const proyecto of proyectos) {
    const proyectoPath = path.join(dir, proyecto.name);
    const archivos = fs.readdirSync(proyectoPath)
      .filter(f => f.endsWith('.jsonl'));

    for (const archivo of archivos) {
      const filePath = path.join(proyectoPath, archivo);
      const stat = fs.statSync(filePath);
      if (esHoy(stat.mtime)) {
        resultados.push({ proyecto: proyecto.name, filePath, mtime: stat.mtime });
      }
    }
  }

  // Orden cronológico
  resultados.sort((a, b) => a.mtime - b.mtime);
  return resultados;
}

function extraerTextoDeSesion(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf-8');
  const lineas = contenido.split('\n').filter(Boolean);
  const mensajes = [];

  for (const linea of lineas) {
    let obj;
    try {
      obj = JSON.parse(linea);
    } catch {
      continue; // línea corrupta o incompleta, se ignora
    }

    // Solo nos interesan turnos de usuario y asistente con texto real
    const tipo = obj.type;
    if (tipo !== 'user' && tipo !== 'assistant') continue;

    const msg = obj.message;
    if (!msg || !msg.content) continue;

    let texto = '';
    if (typeof msg.content === 'string') {
      texto = msg.content;
    } else if (Array.isArray(msg.content)) {
      texto = msg.content
        .filter(b => b.type === 'text' && b.text)
        .map(b => b.text)
        .join(' ');
    }

    texto = texto.trim();
    if (!texto) continue;

    // Filtramos ruido obvio: saludos cortos, confirmaciones triviales
    if (texto.length < 8) continue;

    mensajes.push({ rol: tipo, texto });
  }

  return mensajes;
}

function main() {
  const sesiones = listarJsonlDeHoy(PROJECTS_DIR);

  if (sesiones.length === 0) {
    console.log('No se encontraron sesiones de Claude Code modificadas hoy.');
    return;
  }

  let salida = `# Actividad de Claude Code - ${new Date().toLocaleDateString('es-AR')}\n\n`;
  salida += `Se encontraron ${sesiones.length} sesión(es) modificadas hoy.\n\n`;

  for (const sesion of sesiones) {
    const mensajes = extraerTextoDeSesion(sesion.filePath);
    if (mensajes.length === 0) continue;

    salida += `\n## Proyecto: ${sesion.proyecto}\n`;
    salida += `Sesión: ${path.basename(sesion.filePath)}\n\n`;

    for (const m of mensajes) {
      const etiqueta = m.rol === 'user' ? 'USUARIO' : 'ASISTENTE';
      // Truncamos mensajes muy largos para no saturar el contexto
      const textoCorto = m.texto.length > 800
        ? m.texto.slice(0, 800) + '... [truncado]'
        : m.texto;
      salida += `**${etiqueta}:** ${textoCorto}\n\n`;
    }
  }

  console.log(salida);
}

main();
