export const CONFIG_DIR = `${Deno.env.get("HOME")}/.openindiana-up`;
export const DB_PATH = `${CONFIG_DIR}/state.sqlite`;
export const LOGS_DIR: string = `${CONFIG_DIR}/logs`;
export const EMPTY_DISK_THRESHOLD_KB: number = 100;
