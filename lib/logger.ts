import type { Home } from "@/lib/types"

/**
 * Logger utility voor huisgerelateerde acties
 * Toont logs met een huisje-icoon voor betere zichtbaarheid
 */
export const homeLogger = {
  /**
   * Log algemene informatie over een huis
   */
  info: (message: string, home?: Partial<Home> | null) => {
    console.log(`🏠 INFO: ${message}`, home ? home : "")
  },

  /**
   * Log een waarschuwing gerelateerd aan een huis
   */
  warn: (message: string, home?: Partial<Home> | null) => {
    console.warn(`🏠 WAARSCHUWING: ${message}`, home ? home : "")
  },

  /**
   * Log een fout gerelateerd aan een huis
   */
  error: (message: string, error?: any, home?: Partial<Home> | null) => {
    console.error(`🏠 FOUT: ${message}`, error ? error : "", home ? home : "")
  },

  /**
   * Log een succesvolle actie gerelateerd aan een huis
   */
  success: (message: string, home?: Partial<Home> | null) => {
    console.log(`🏠 SUCCES: ${message}`, home ? home : "")
  },

  /**
   * Log een debug bericht gerelateerd aan een huis
   */
  debug: (message: string, data?: any) => {
    console.debug(`🏠 DEBUG: ${message}`, data ? data : "")
  },
}
