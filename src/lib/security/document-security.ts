/**
 * Security utilities for document management
 */

export class DocumentSecurity {
  /**
   * Validates and sanitizes user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Validates file upload security
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds maximum limit of 10MB' }
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' }
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: 'File extension not allowed' }
    }

    // Check for malicious file patterns
    const fileName = file.name.toLowerCase()
    const maliciousPatterns = [
      '..', '..', '/', '\\', ':', '*', '?', '"', '<', '>', '|',
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.ps1'
    ]

    if (maliciousPatterns.some(pattern => fileName.includes(pattern))) {
      return { isValid: false, error: 'Malicious file detected' }
    }

    return { isValid: true }
  }

  /**
   * Validates API response data structure
   */
  static validateApiResponse(data: any, expectedFields: string[]): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    return expectedFields.every(field => field in data)
  }

  /**
   * Generates a secure download filename
   */
  static generateSecureFilename(originalName: string, documentCode: string): string {
    // Remove path traversal attempts
    let sanitized = originalName.replace(/\.\./g, '').replace(/[\/\\]/g, '_')
    
    // Remove special characters but keep basic filename characters
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_')
    
    // Limit length
    if (sanitized.length > 100) {
      const extension = sanitized.includes('.') ? sanitized.split('.').pop() : ''
      const nameWithoutExt = sanitized.includes('.') ? 
        sanitized.substring(0, sanitized.lastIndexOf('.')) : sanitized
      sanitized = nameWithoutExt.substring(0, 100 - (extension.length + 1)) + '.' + extension
    }
    
    // Add document code prefix
    const sanitizedCode = documentCode.replace(/[^a-zA-Z0-9\-_]/g, '_')
    return `${sanitizedCode}_${sanitized}`
  }

  /**
   * Validates URL safety for document access
   */
  static isSafeUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url, window.location.origin)
      
      // Allow same-origin URLs
      if (parsedUrl.origin === window.location.origin) {
        return true
      }
      
      // Allow localhost for development
      if (parsedUrl.hostname === 'localhost') {
        return true
      }
      
      // Basic validation for external URLs
      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        // Check for potentially dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'file:', 'ftp:']
        if (dangerousProtocols.some(proto => url.toLowerCase().startsWith(proto))) {
          return false
        }
        
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return domainRegex.test(parsedUrl.hostname)
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * Rate limiting helper (client-side)
   */
  static checkRateLimit(action: string, limit: number, windowMs: number): boolean {
    const key = `rate_limit_${action}`
    const now = Date.now()
    
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        localStorage.setItem(key, JSON.stringify([now]))
        return true
      }
      
      const timestamps = JSON.parse(stored)
      const validTimestamps = timestamps.filter((timestamp: number) => 
        now - timestamp < windowMs
      )
      
      if (validTimestamps.length >= limit) {
        return false
      }
      
      validTimestamps.push(now)
      localStorage.setItem(key, JSON.stringify(validTimestamps))
      return true
    } catch {
      return true // Fail open if localStorage is not available
    }
  }
}