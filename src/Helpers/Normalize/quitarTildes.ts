export function quitarTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 