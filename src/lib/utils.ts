import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// コントラクトのアドレス
// export const AAVE_LENDING_POOL_ADDRESS_PROVIDER = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
export const AAVE_LENDING_POOL_ADDRESS_PROVIDER = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
export const AAVE_PROTOCOL_DATA_PROVIDER = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";