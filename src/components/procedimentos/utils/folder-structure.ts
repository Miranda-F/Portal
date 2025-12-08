import { Document } from '@/types/document'

export interface FolderNode {
  id: string
  name: string
  path: string
  type?: string
  children?: FolderNode[]
  documentCount?: number
}

/**
 * Constrói uma árvore de pastas dinâmica baseada nos documentos
 */
export function buildFolderTree(documents: Document[]): FolderNode[] {
  // Estrutura hierárquica base padrão (pode ser expandida)
  const defaultStructure: FolderNode = {
    id: 'root',
    name: 'Root',
    path: 'Root',
    children: [
      {
        id: 'area-tecnica',
        name: 'Área Técnica',
        path: 'Root/Área Técnica',
        children: []
      },
          {
            id: 'gestao-qualidade',
            name: 'Gestão da Qualidade',
        path: 'Root/Gestão da Qualidade',
            children: [
              {
                id: 'certificados',
                name: 'Certificados',
            path: 'Root/Gestão da Qualidade/Certificados',
            children: []
          },
          { id: 'form', name: 'Formulários', path: 'Root/Gestão da Qualidade/Formulários', type: 'form' },
          { id: 'instruction', name: 'Instrução Técnica', path: 'Root/Gestão da Qualidade/Instrução Técnica', type: 'instruction' },
          { id: 'procedure', name: 'Procedimentos', path: 'Root/Gestão da Qualidade/Procedimentos', type: 'procedure' },
              {
                id: 'modelo-doc',
                name: 'Modelo de Doc',
            path: 'Root/Gestão da Qualidade/Modelo de Doc',
                children: []
              },
              {
                id: 'normas',
                name: 'Normas',
            path: 'Root/Gestão da Qualidade/Normas',
                children: []
              },
              {
                id: 'treinamento',
                name: 'Treinamento',
            path: 'Root/Gestão da Qualidade/Treinamento',
                children: []
          }
        ]
              },
              {
                id: 'meio-ambiente',
                name: 'Meio Ambiente',
        path: 'Root/Meio Ambiente',
                children: []
              },
              {
                id: 'producao',
                name: 'Produção',
        path: 'Root/Produção',
                children: []
              },
              {
                id: 'recursos-humanos',
                name: 'Recursos Humanos',
        path: 'Root/Recursos Humanos',
                children: []
              },
              {
                id: 'seguranca-trabalho',
                name: 'Segurança do Trabalho',
        path: 'Root/Segurança do Trabalho',
                children: []
              },
              {
                id: 'sgi',
                name: 'SGI',
        path: 'Root/SGI',
                children: []
      },
      { id: 'policy', name: 'Políticas', path: 'Root/Políticas', type: 'policy' },
      { id: 'manual', name: 'Manuais', path: 'Root/Manuais', type: 'manual' },
      { id: 'record', name: 'Registros', path: 'Root/Registros', type: 'record' }
    ]
  }

  // Função recursiva para contar documentos em uma pasta e suas subpastas
  const countDocumentsInFolder = (node: FolderNode): number => {
    let count = 0
    
    // Se é um nó folha com type (tipo de documento), contar apenas documentos desse tipo
    // que estão no folderPath padrão (ou sem folderPath)
    if (node.type && (!node.children || node.children.length === 0)) {
      // Usar a mesma lógica de getDocumentsByType para evitar duplicação
      const typeToDefaultFolderPath: Record<string, string> = {
        'form': 'Root/Gestão da Qualidade/Formulários',
        'instruction': 'Root/Gestão da Qualidade/Instrução Técnica',
        'procedure': 'Root/Gestão da Qualidade/Procedimentos',
        'policy': 'Root/Políticas',
        'manual': 'Root/Manuais',
        'record': 'Root/Registros',
      }
      const defaultFolderPath = typeToDefaultFolderPath[node.type]
      
      if (defaultFolderPath) {
        // Contar apenas documentos que estão no folderPath padrão ou não têm folderPath
        count = documents.filter(doc => {
          if (doc.type !== node.type) return false
          return !doc.folderPath || doc.folderPath === defaultFolderPath
        }).length
      } else {
        // Para tipos sem folderPath padrão, contar todos os documentos desse tipo
        // que não estão em pastas específicas de tipo
        count = documents.filter(doc => {
          if (doc.type !== node.type) return false
          return !doc.folderPath || !Object.values(typeToDefaultFolderPath).includes(doc.folderPath)
        }).length
      }
    } else if (node.path && !node.type) {
      // Se é uma pasta sem type, contar documentos que estão exatamente nesta pasta ou em subpastas
      // Documentos que começam com o caminho da pasta
      count = documents.filter(doc => {
        if (!doc.folderPath) return false
        // Documento está exatamente nesta pasta
        if (doc.folderPath === node.path) return true
        // Documento está em uma subpasta
        if (doc.folderPath.startsWith(`${node.path}/`)) return true
        return false
      }).length
    }
    
    // Contar documentos nas subpastas recursivamente
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        const childCount = countDocumentsInFolder(child)
        // Se este nó não tem type próprio, incluir contagem dos filhos
        if (!node.type) {
          count += childCount
        }
      })
    }
    
    node.documentCount = count
    return count
  }

  // Contar documentos em toda a árvore
  countDocumentsInFolder(defaultStructure)

  // Função recursiva para descobrir pastas dinâmicas baseadas nos documentos
  const discoverDynamicFolders = (documents: Document[]): FolderNode[] => {
    const folderMap = new Map<string, FolderNode>()
    
    documents.forEach(doc => {
      if (doc.folderPath) {
        const pathParts = doc.folderPath.split('/').filter(Boolean)
        
        let currentPath = ''
        pathParts.forEach((part, index) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part
          
          if (!folderMap.has(currentPath)) {
            const parentPath = index > 0 ? pathParts.slice(0, index).join('/') : ''
            const parent = parentPath ? folderMap.get(parentPath) : null
            
            const folder: FolderNode = {
              id: currentPath.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
              name: part,
              path: currentPath,
              children: [],
              documentCount: 0
            }
            
            folderMap.set(currentPath, folder)
            
            if (parent) {
              if (!parent.children) parent.children = []
              parent.children.push(folder)
            }
          }
        })
      }
    })
    
    // Encontrar pastas raiz (sem pai)
    const rootFolders: FolderNode[] = []
    folderMap.forEach((folder, path) => {
      const pathParts = path.split('/').filter(Boolean)
      if (pathParts.length === 1) {
        rootFolders.push(folder)
      }
    })
    
    return rootFolders
  }

  // Descobrir pastas dinâmicas dos documentos
  const dynamicFolders = discoverDynamicFolders(documents)
  
  // Mapear tipo de documento para folderPath padrão (para identificar pastas com type)
  const typeToDefaultFolderPath: Record<string, string> = {
    'form': 'Root/Área Técnica/Gestão da Qualidade/Formulários',
    'instruction': 'Root/Área Técnica/Gestão da Qualidade/Instrução Técnica',
    'procedure': 'Root/Área Técnica/Gestão da Qualidade/Procedimentos',
    'policy': 'Root/Área Técnica/Gestão da Qualidade/Políticas',
    'manual': 'Root/Área Técnica/Gestão da Qualidade/Manuais',
    'record': 'Root/Área Técnica/Gestão da Qualidade/Registros',
  }
  
  // Criar mapa reverso: folderPath padrão -> type
  const defaultFolderPathToType = new Map<string, string>()
  Object.entries(typeToDefaultFolderPath).forEach(([type, path]) => {
    defaultFolderPathToType.set(path, type)
  })
  
  // Função para identificar o type de uma pasta baseado nos documentos nela
  const identifyFolderType = (folderPath: string): string | undefined => {
    // Encontrar documentos exatamente nesta pasta (não em subpastas)
    const docsInFolder = documents.filter(doc => doc.folderPath === folderPath)
    
    if (docsInFolder.length === 0) return undefined
    
    // Verificar se todos os documentos têm o mesmo tipo
    const types = new Set(docsInFolder.map(doc => doc.type).filter(Boolean))
    
    if (types.size === 1) {
      const type = Array.from(types)[0] as string
      // Verificar se este tipo corresponde a um tipo padrão
      if (typeToDefaultFolderPath[type]) {
        // Verificar se a pasta está no caminho padrão para este tipo
        const defaultPath = typeToDefaultFolderPath[type]
        if (folderPath === defaultPath) {
            return type
        }
      }
    }
    
    return undefined
  }
  
  // Atribuir types às pastas descobertas dentro de Certificados
  const assignTypesToDiscoveredFolders = (nodes: FolderNode[]): void => {
    nodes.forEach(node => {
      // Se a pasta está dentro de Certificados, tentar identificar o type
      if (node.path.includes('Root/Área Técnica/Gestão da Qualidade/Certificados/')) {
        const folderType = identifyFolderType(node.path)
        if (folderType) {
          node.type = folderType
        }
      }
      
      if (node.children) {
        assignTypesToDiscoveredFolders(node.children)
      }
    })
  }
  
  // Atribuir types às pastas descobertas
  assignTypesToDiscoveredFolders(dynamicFolders)
  
  // Construir árvore completa a partir dos documentos, preservando estrutura padrão para pastas raiz
  const buildCompleteTree = (): FolderNode => {
    // Criar mapa de todas as pastas descobertas
    const folderMap = new Map<string, FolderNode>()
    
    const addToMap = (nodes: FolderNode[]) => {
      nodes.forEach(node => {
        folderMap.set(node.path, node)
        if (node.children) {
          addToMap(node.children)
        }
      })
    }
    
    addToMap(dynamicFolders)
    
    // Construir estrutura usando pastas descobertas, mas adicionando pastas padrão que não foram descobertas
    const buildNode = (path: string, name: string, type?: string): FolderNode => {
      const discoveredNode = folderMap.get(path)
      
      if (discoveredNode) {
        // Se foi descoberta, usar dados descobertos mas preservar type se fornecido
        return {
          ...discoveredNode,
          type: discoveredNode.type || type
        }
      }
      
      // Se não foi descoberta, criar nó padrão
      const node: FolderNode = {
        id: path.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
        name,
        path,
        type,
        children: []
      }
      
      return node
    }
    
    // Construir estrutura raiz
    const root = buildNode('Root', 'Root')
    
    // Construir Área Técnica e Gestão da Qualidade no mesmo nível
    const areaTecnica = buildNode('Root/Área Técnica', 'Área Técnica')
    const gestaoQualidade = buildNode('Root/Gestão da Qualidade', 'Gestão da Qualidade')
    root.children = [areaTecnica, gestaoQualidade]
    
    // Construir Certificados (pasta comum)
    const certificados = buildNode('Root/Gestão da Qualidade/Certificados', 'Certificados')
    
    // Adicionar pastas de tipo diretamente em Gestão da Qualidade (não dentro de Certificados)
    const typeFolders = new Map<string, FolderNode>()
    
    // Primeiro, adicionar pastas descobertas que têm type (podem ter sido renomeadas)
    folderMap.forEach((node, path) => {
      // Verificar se é uma pasta de tipo (no caminho padrão ou renomeada)
      if (node.type && typeToDefaultFolderPath[node.type]) {
        typeFolders.set(path, node)
      }
    })
    
    // Garantir que TODAS as 6 pastas padrão apareçam
    // Se uma pasta foi renomeada, ela já foi adicionada acima
    // Se não foi renomeada, usar a pasta padrão
    Object.entries(typeToDefaultFolderPath).forEach(([type, defaultPath]) => {
      // Verificar se já existe uma pasta descoberta com este type
      let foundFolder = false
      typeFolders.forEach((node) => {
        if (node.type === type) {
          foundFolder = true
        }
      })
      
      // Se não encontrou uma pasta com este type, adicionar a pasta padrão
      if (!foundFolder) {
        // Verificar se há uma pasta descoberta no caminho padrão
        const discoveredAtDefaultPath = folderMap.get(defaultPath)
        if (discoveredAtDefaultPath) {
          // Usar a pasta descoberta e atribuir o type
          typeFolders.set(defaultPath, {
            ...discoveredAtDefaultPath,
            type
          })
        } else {
          // Criar pasta padrão (SEMPRE criar, mesmo sem documentos)
          const defaultNode = buildNode(defaultPath, defaultPath.split('/').pop() || '', type)
          typeFolders.set(defaultPath, defaultNode)
        }
      }
    })
    
    // Filtrar pastas de tipo que ficam dentro de Gestão da Qualidade (Formulários, Instrução Técnica, Procedimentos)
    const gestaoQualidadeTypeFolders = Array.from(typeFolders.values()).filter(node => 
      node.path?.startsWith('Root/Gestão da Qualidade/') && 
      !node.path.includes('Políticas') && 
      !node.path.includes('Manuais') && 
      !node.path.includes('Registros')
    )
    
    // Adicionar Certificados e pastas de tipo como filhos de Gestão da Qualidade
    gestaoQualidade.children = [
      certificados,
      ...gestaoQualidadeTypeFolders
    ]
    
    // Adicionar outras pastas dentro de Gestão da Qualidade (Modelo de Doc, Normas, Treinamento)
    const gestaoQualidadeSubfolders = [
      { id: 'modelo-doc', name: 'Modelo de Doc', path: 'Root/Gestão da Qualidade/Modelo de Doc' },
      { id: 'normas', name: 'Normas', path: 'Root/Gestão da Qualidade/Normas' },
      { id: 'treinamento', name: 'Treinamento', path: 'Root/Gestão da Qualidade/Treinamento' },
    ]
    
    // Garantir que children existe
    if (!gestaoQualidade.children) {
      gestaoQualidade.children = []
    }
    
    gestaoQualidadeSubfolders.forEach(folder => {
      const discovered = folderMap.get(folder.path)
      if (discovered) {
        gestaoQualidade.children!.push(discovered)
      } else {
        // Verificar se há documentos nesta pasta ou subpastas
        const hasDocuments = documents.some(doc => 
          doc.folderPath === folder.path || doc.folderPath?.startsWith(folder.path + '/')
        )
        if (hasDocuments) {
          gestaoQualidade.children!.push(buildNode(folder.path, folder.name))
        } else {
          // Adicionar mesmo sem documentos (pastas padrão)
          gestaoQualidade.children!.push(buildNode(folder.path, folder.name))
        }
      }
    })
    
    // Adicionar outras pastas no mesmo nível de Gestão da Qualidade (Meio Ambiente, Produção, etc.)
    const rootLevelFolders = [
      { id: 'meio-ambiente', name: 'Meio Ambiente', path: 'Root/Meio Ambiente' },
      { id: 'producao', name: 'Produção', path: 'Root/Produção' },
      { id: 'recursos-humanos', name: 'Recursos Humanos', path: 'Root/Recursos Humanos' },
      { id: 'seguranca-trabalho', name: 'Segurança do Trabalho', path: 'Root/Segurança do Trabalho' },
      { id: 'sgi', name: 'SGI', path: 'Root/SGI' },
    ]
    
    rootLevelFolders.forEach(folder => {
      const discovered = folderMap.get(folder.path)
      if (discovered) {
        root.children!.push(discovered)
      } else {
        // Verificar se há documentos nesta pasta ou subpastas
        const hasDocuments = documents.some(doc => 
          doc.folderPath === folder.path || doc.folderPath?.startsWith(folder.path + '/')
        )
        if (hasDocuments) {
          root.children!.push(buildNode(folder.path, folder.name))
        } else {
          // Adicionar mesmo sem documentos (pastas padrão)
          root.children!.push(buildNode(folder.path, folder.name))
        }
      }
    })
    
    // Adicionar pastas de tipo que ficam no mesmo nível de Gestão da Qualidade (Políticas, Manuais, Registros)
    const rootLevelTypeFolders = [
      { id: 'policy', name: 'Políticas', path: 'Root/Políticas', type: 'policy' },
      { id: 'manual', name: 'Manuais', path: 'Root/Manuais', type: 'manual' },
      { id: 'record', name: 'Registros', path: 'Root/Registros', type: 'record' },
    ]
    
    // Verificar se já existem pastas de tipo no nível raiz
    rootLevelTypeFolders.forEach(folder => {
      const discovered = folderMap.get(folder.path)
      if (discovered) {
        root.children!.push({ ...discovered, type: folder.type })
      } else {
        // Verificar se há documentos desta pasta de tipo
        const hasDocuments = documents.some(doc => 
          doc.folderPath === folder.path || doc.folderPath?.startsWith(folder.path + '/')
        )
        if (hasDocuments || typeFolders.has(folder.path)) {
          root.children!.push(buildNode(folder.path, folder.name, folder.type))
        }
      }
    })
    
    // Adicionar subpastas descobertas dentro de outras pastas
    const addDiscoveredSubfolders = (parent: FolderNode) => {
      folderMap.forEach((node, path) => {
        if (path.startsWith(parent.path + '/') && path !== parent.path) {
          const pathParts = path.split('/').filter(Boolean)
          const parentPathParts = parent.path.split('/').filter(Boolean)
          
          // Se está diretamente dentro do pai
          if (pathParts.length === parentPathParts.length + 1) {
            // Verificar se já não está nos filhos
            if (!parent.children?.some(child => child.path === path)) {
              if (!parent.children) parent.children = []
              parent.children.push(node)
            }
          }
        }
      })
      
      // Processar filhos recursivamente
      if (parent.children) {
        parent.children.forEach(child => {
          addDiscoveredSubfolders(child)
        })
      }
    }
    
    addDiscoveredSubfolders(root)
    
    return root
  }
  
  // Construir árvore completa
  const completeTree = buildCompleteTree()
  
  // Recontar documentos
  countDocumentsInFolder(completeTree)
  
  return [completeTree]
}

/**
 * Extrai todas as pastas únicas dos documentos
 */
export function extractUniqueFolders(documents: Document[]): string[] {
  const folders = new Set<string>()
  
  documents.forEach(doc => {
    if (doc.folderPath) {
      const pathParts = doc.folderPath.split('/').filter(Boolean)
      let currentPath = ''
      pathParts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        folders.add(currentPath)
      })
    }
  })
  
  return Array.from(folders).sort()
}

/**
 * Encontra todos os documentos em uma pasta específica
 * Se folderPath for null, retorna documentos sem pasta
 * Se folderPath for fornecido, retorna documentos que estão exatamente nessa pasta ou em subpastas
 */
export function getDocumentsInFolder(documents: Document[], folderPath: string | null): Document[] {
  if (!folderPath) {
    // Documentos sem pasta
    return documents.filter(doc => !doc.folderPath)
  }
  
  // Documentos que estão exatamente nesta pasta ou em subpastas
  return documents.filter(doc => {
    if (!doc.folderPath) return false
    // Documento está exatamente nesta pasta
    if (doc.folderPath === folderPath) return true
    // Documento está em uma subpasta
    if (doc.folderPath.startsWith(`${folderPath}/`)) return true
    return false
  })
}

/**
 * Encontra documentos por tipo de documento
 * Retorna apenas documentos que têm o tipo correspondente E que estão no folderPath padrão para esse tipo
 * (ou não têm folderPath, ou seja, ainda não foram movidos para outra pasta)
 */
export function getDocumentsByType(documents: Document[], type: string): Document[] {
      // Mapear tipo para folderPath padrão
      const typeToDefaultFolderPath: Record<string, string> = {
        'form': 'Root/Gestão da Qualidade/Formulários',
        'instruction': 'Root/Gestão da Qualidade/Instrução Técnica',
        'procedure': 'Root/Gestão da Qualidade/Procedimentos',
        'policy': 'Root/Políticas',
        'manual': 'Root/Manuais',
        'record': 'Root/Registros',
      }
  
  const defaultFolderPath = typeToDefaultFolderPath[type]
  
  // Filtrar documentos que:
  // 1. Têm o tipo correspondente
  // 2. E (estão no folderPath padrão para esse tipo OU não têm folderPath)
  return documents.filter(doc => {
    if (doc.type !== type) return false
    
    // Se o tipo tem um folderPath padrão
    if (defaultFolderPath) {
      // Retornar apenas se o documento está no folderPath padrão ou não tem folderPath
      return !doc.folderPath || doc.folderPath === defaultFolderPath
    }
    
    // Se o tipo não tem folderPath padrão (ex: 'other'), retornar todos os documentos desse tipo
    // que não têm folderPath ou que não estão em pastas específicas de tipo
    return !doc.folderPath || !Object.values(typeToDefaultFolderPath).includes(doc.folderPath)
  })
}

