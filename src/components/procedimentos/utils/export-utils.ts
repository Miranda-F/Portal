import JSZip from 'jszip'
import { Document } from '@/types/document'

export const exportDocuments = async (filteredDocs: Document[], filename: string = 'documentos_exportados') => {
  if (filteredDocs.length === 0) {
    alert('Nenhum documento encontrado para exportar.')
    return
  }

  // Cria instância do JSZip
  const zip = new JSZip()
  let processedCount = 0
  let failedCount = 0

  // Função para sanitizar nome do arquivo
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^a-z0-9\s\-_\.]/gi, '_')
      .replace(/\s+/g, '_')
      .substring(0, 100) // Limita tamanho do nome
  }

  // Processa cada documento
  for (const doc of filteredDocs) {
    if (!doc.fileUrl) {
      failedCount++
      continue
    }

    try {
      // Faz fetch do arquivo
      const response = await fetch(doc.fileUrl)
      if (!response.ok) {
        failedCount++
        continue
      }

      const blob = await response.blob()
      
      // Gera nome do arquivo baseado no título e código
      const code = sanitizeFilename(doc.code || 'documento')
      const title = sanitizeFilename(doc.title || 'sem_titulo')
      // Tenta extrair extensão da URL se fileType não estiver disponível
      let extension = doc.fileType ? `.${doc.fileType}` : '.pdf'
      if (!doc.fileType && doc.fileUrl) {
        const urlMatch = doc.fileUrl.match(/\.([a-z0-9]+)(?:\?|$)/i)
        if (urlMatch) {
          extension = `.${urlMatch[1]}`
        }
      }
      const fileName = `${code}_${title}${extension}`

      // Adiciona ao ZIP
      zip.file(fileName, blob)
      processedCount++
    } catch (error) {
      console.error(`Erro ao processar arquivo ${doc.title}:`, error)
      failedCount++
    }
  }

  // Gera o ZIP e faz download
  if (processedCount === 0) {
    alert('Não foi possível baixar nenhum arquivo. Verifique se os arquivos estão disponíveis.')
    return
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  if (failedCount > 0) {
    alert(`${processedCount} arquivo(s) exportado(s) com sucesso. ${failedCount} arquivo(s) falharam.`)
  }
}

