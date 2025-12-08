import { FolderNode } from './folder-structure'

/**
 * Pastas raiz que NÃO podem ser alteradas (apenas visualização)
 */
const PROTECTED_ROOT_FOLDERS = [
  'Root',
  'Root/Área Técnica',
  'Root/Gestão da Qualidade',
  'Root/Gestão da Qualidade/Certificados',
  'Root/Meio Ambiente',
  'Root/Produção',
  'Root/Recursos Humanos',
  'Root/Segurança do Trabalho',
  'Root/SGI',
  'Root/Gestão da Qualidade/Modelo de Doc',
  'Root/Gestão da Qualidade/Normas',
  'Root/Gestão da Qualidade/Treinamento',
]

/**
 * Pastas de tipo padrão da qualidade que NÃO podem ser alteradas (excluir, renomear ou criar)
 * Essas pastas mantêm a classificação dos documentos
 */
const PROTECTED_TYPE_FOLDERS = [
  'Root/Gestão da Qualidade/Formulários',
  'Root/Gestão da Qualidade/Instrução Técnica',
  'Root/Gestão da Qualidade/Procedimentos',
  'Root/Políticas',
  'Root/Manuais',
  'Root/Registros',
]

/**
 * Pastas que podem ser apenas renomeadas (não podem ser excluídas)
 */
const RENAME_ONLY_FOLDERS: string[] = [
  // Adicione aqui pastas que podem ser apenas renomeadas
]

/**
 * Verifica se uma pasta pode ser editada (criar, renomear, excluir)
 */
export function canEditFolder(folderPath: string | null): boolean {
  if (!folderPath) return false
  
  // Pastas raiz protegidas não podem ser editadas
  if (PROTECTED_ROOT_FOLDERS.includes(folderPath)) {
    return false
  }
  
  // Pastas de tipo padrão da qualidade não podem ser editadas
  if (PROTECTED_TYPE_FOLDERS.includes(folderPath)) {
    return false
  }
  
  return true
}

/**
 * Verifica se uma pasta pode ser excluída
 */
export function canDeleteFolder(folderPath: string | null): boolean {
  if (!folderPath) return false
  
  // Pastas raiz protegidas não podem ser excluídas
  if (PROTECTED_ROOT_FOLDERS.includes(folderPath)) {
    return false
  }
  
  // Pastas de tipo padrão da qualidade não podem ser excluídas
  if (PROTECTED_TYPE_FOLDERS.includes(folderPath)) {
    return false
  }
  
  // Pastas que podem ser apenas renomeadas não podem ser excluídas
  if (RENAME_ONLY_FOLDERS.includes(folderPath)) {
    return false
  }
  
  return true
}

/**
 * Verifica se uma pasta pode ser renomeada
 */
export function canRenameFolder(folderPath: string | null): boolean {
  if (!folderPath) return false
  
  // Pastas raiz protegidas não podem ser renomeadas
  if (PROTECTED_ROOT_FOLDERS.includes(folderPath)) {
    return false
  }
  
  // Pastas de tipo padrão da qualidade não podem ser renomeadas
  if (PROTECTED_TYPE_FOLDERS.includes(folderPath)) {
    return false
  }
  
  return true
}

/**
 * Verifica se uma pasta pode ter subpastas criadas dentro dela
 */
export function canCreateSubfolderIn(folderPath: string | null): boolean {
  if (!folderPath) return false
  
  // Não pode criar subpastas em pastas raiz protegidas (exceto Certificados)
  if (PROTECTED_ROOT_FOLDERS.includes(folderPath)) {
    // Mas pode criar dentro de Certificados
    return folderPath === 'Root/Gestão da Qualidade/Certificados'
  }
  
  return true
}

/**
 * Verifica se um nó de pasta pode ser editado
 */
export function canEditFolderNode(node: FolderNode): boolean {
  // Pastas de tipo padrão da qualidade não podem ser editadas
  if (node.type && PROTECTED_TYPE_FOLDERS.includes(node.path || '')) {
    return false
  }
  
  // Pastas dentro de "Certificados" podem ser editadas (subpastas)
  if (node.path && node.path.includes('Root/Gestão da Qualidade/Certificados/')) {
    const pathParts = node.path.split('/').filter(Boolean)
    const certificadosIndex = pathParts.indexOf('Certificados')
    // Se estamos dentro de Certificados e não somos a pasta Certificados em si
    if (certificadosIndex >= 0 && pathParts.length > certificadosIndex + 1) {
      return true
    }
  }
  // Verificar se a pasta não está protegida
  return canEditFolder(node.path)
}

/**
 * Verifica se um nó de pasta pode ser excluído
 */
export function canDeleteFolderNode(node: FolderNode): boolean {
  // Pastas de tipo padrão da qualidade não podem ser excluídas
  if (node.type && PROTECTED_TYPE_FOLDERS.includes(node.path || '')) {
    return false
  }
  
  // Pastas dentro de "Certificados" podem ser excluídas (subpastas)
  if (node.path && node.path.includes('Root/Área Técnica/Gestão da Qualidade/Certificados/')) {
    const pathParts = node.path.split('/').filter(Boolean)
    const certificadosIndex = pathParts.indexOf('Certificados')
    // Se estamos dentro de Certificados e não somos a pasta Certificados em si
    if (certificadosIndex >= 0 && pathParts.length > certificadosIndex + 1) {
      return true
    }
  }
  // Outras pastas sem type podem ser excluídas se não forem protegidas
  if (node.type) return false
  return canDeleteFolder(node.path)
}

/**
 * Verifica se um nó de pasta pode ser movido
 */
export function canMoveFolderNode(node: FolderNode): boolean {
  // Pastas de tipo padrão da qualidade não podem ser movidas
  if (node.type && PROTECTED_TYPE_FOLDERS.includes(node.path || '')) {
    return false
  }
  
  // Pastas dentro de "Certificados" podem ser movidas (subpastas)
  if (node.path && node.path.includes('Root/Gestão da Qualidade/Certificados/')) {
    const pathParts = node.path.split('/').filter(Boolean)
    const certificadosIndex = pathParts.indexOf('Certificados')
    // Se estamos dentro de Certificados e não somos a pasta Certificados em si
    if (certificadosIndex >= 0 && pathParts.length > certificadosIndex + 1) {
      return true
    }
  }
  
  // Outras pastas sem type podem ser movidas se não forem protegidas
  if (node.type) return false
  
  // Verificar se a pasta não está protegida
  if (!node.path) return false
  
  // Pastas protegidas não podem ser movidas
  if (PROTECTED_ROOT_FOLDERS.includes(node.path) || PROTECTED_TYPE_FOLDERS.includes(node.path)) {
    return false
  }
  
  return true
}

/**
 * Verifica se um nó de pasta pode ser renomeado
 */
export function canRenameFolderNode(node: FolderNode): boolean {
  // Pastas de tipo padrão da qualidade não podem ser renomeadas
  if (node.type && PROTECTED_TYPE_FOLDERS.includes(node.path || '')) {
    return false
  }
  
  // Pastas dentro de "Certificados" podem ser renomeadas (subpastas)
  if (node.path && node.path.includes('Root/Área Técnica/Gestão da Qualidade/Certificados/')) {
    const pathParts = node.path.split('/').filter(Boolean)
    const certificadosIndex = pathParts.indexOf('Certificados')
    // Se estamos dentro de Certificados e não somos a pasta Certificados em si
    if (certificadosIndex >= 0 && pathParts.length > certificadosIndex + 1) {
      return true
    }
  }
  // Outras pastas sem type podem ser renomeadas se não forem protegidas
  if (node.type) return false
  return canRenameFolder(node.path)
}

/**
 * Verifica se pode criar subpastas dentro de um nó
 */
export function canCreateSubfolderInNode(node: FolderNode): boolean {
  if (!node.path) return false
  
  // Permitir criar subpastas dentro de "Certificados"
  if (node.path === 'Root/Gestão da Qualidade/Certificados') {
    return true
  }
  
  // Permitir criar subpastas dentro de pastas dentro de "Certificados" (subpastas)
  if (node.path.includes('Root/Gestão da Qualidade/Certificados/')) {
    return true
  }
  
  // Permitir criar subpastas dentro de pastas de tipo
  if (node.type && PROTECTED_TYPE_FOLDERS.includes(node.path)) {
    return true
  }
  
  // Permitir criar subpastas dentro de outras pastas pré-definidas (exceto Root e pastas raiz principais)
  const protectedButAllowSubfolders = [
    'Root/Gestão da Qualidade/Modelo de Doc',
    'Root/Gestão da Qualidade/Normas',
    'Root/Gestão da Qualidade/Treinamento',
    'Root/Meio Ambiente',
    'Root/Produção',
    'Root/Recursos Humanos',
    'Root/Segurança do Trabalho',
    'Root/SGI',
    'Root/Área Técnica',
  ]
  
  if (protectedButAllowSubfolders.includes(node.path)) {
    return true
  }
  
  // Permitir criar subpastas dentro de subpastas criadas pelo usuário
  if (node.path.includes('/')) {
    const pathParts = node.path.split('/').filter(Boolean)
    // Se não é uma pasta raiz protegida, pode criar subpastas
    if (pathParts.length > 1 && !PROTECTED_ROOT_FOLDERS.includes(node.path)) {
      return true
    }
  }
  
  // Outras pastas sem type podem ter subpastas criadas se não forem protegidas
  if (node.type) return false
  return canCreateSubfolderIn(node.path)
}

