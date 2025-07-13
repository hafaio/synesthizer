/** convert a string with sharps in it to flats */
export function sharp2flat(sharp: string): string {
  return sharp.replaceAll(/[ACDFG]#/gi, (mat) =>
    String.fromCharCode(mat.charCodeAt(0) + 1, 98)
  );
}

/** convert a string with flats in it to sharps */
export function flat2sharp(flat: string): string {
  return flat.replaceAll(/[ABDEG]b/gi, (mat) =>
    String.fromCharCode(mat.charCodeAt(0) - 1, 35)
  );
}
