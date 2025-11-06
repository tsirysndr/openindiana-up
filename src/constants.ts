export const CONFIG_DIR = `${Deno.env.get("HOME")}/.openindiana-up`;
export const DB_PATH = `${CONFIG_DIR}/state.sqlite`;
export const EMPTY_DISK_THRESHOLD_KB: number = 100;
