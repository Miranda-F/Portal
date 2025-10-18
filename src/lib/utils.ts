import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrai as iniciais de um nome
 * @param name Nome completo
 * @param limit Limite de caracteres (padrão: 2)
 * @returns Iniciais em maiúsculas
 */
export function getInitials(name: string, limit: number = 2): string {
  if (!name) return ''
  
  return name
    .split(" ")
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, limit)
    .join("")
}
