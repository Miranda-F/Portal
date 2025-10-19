import { Star, ExternalLink, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ResortCardProps {
  image: string
  category: string
  categoryColor: string
  title: string
  description: string
  date: string
  slug: string
}

const ResortCard = ({ 
  image, 
  category, 
  categoryColor, 
  title, 
  description, 
  date,
  slug 
}: ResortCardProps) => {
  return (
    <Card className="group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-0 h-full flex flex-col py-0">
      {/* Imagem integrada ao topo sem nenhum espaçamento */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Badge de categoria no canto superior esquerdo */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant="secondary" 
            className={`${categoryColor} text-white font-medium px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm`}
          >
            <Star className="w-3 h-3" />
            {category}
          </Badge>
        </div>
        {/* Overlay sutil no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Container de conteúdo abaixo da imagem */}
      <CardContent className="flex-1 p-4 pt-3 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3 flex-1">
          {description}
        </p>
        
        <Link 
          href={`/publicacoes/${slug}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors group/link mt-auto"
        >
          Ler mais
          <ExternalLink className="w-4 h-4 ml-1.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  )
}

export const ResortCards = () => {
  const cardsData = [
    {
      image: "/resort-conference.jpg",
      category: "Comunicado",
      categoryColor: "bg-blue-600",
      title: "Novo Sistema de Gestão Integrada",
      description: "Conheça o novo sistema integrado de gestão que vai revolucionar nossos processos internos e aumentar a produtividade de toda a equipe.",
      date: "15 de Setembro, 2024",
      slug: "novo-sistema-de-gestao-integrada"
    },
    {
      image: "/resort-pool.jpg",
      category: "Eventos",
      categoryColor: "bg-green-600",
      title: "Workshop de Inovação e Tecnologia",
      description: "Participe do nosso workshop exclusivo sobre tendências e inovação na hotelaria com especialistas do mercado.",
      date: "22 de Setembro, 2024",
      slug: "workshop-de-inovacao-e-tecnologia"
    },
    {
      image: "/resort-spa.jpg",
      category: "Informativo",
      categoryColor: "bg-purple-600",
      title: "Atualização de Procedimentos Operacionais",
      description: "Mantenha-se atualizado com as últimas alterações nos procedimentos operacionais e normas de segurança.",
      date: "18 de Setembro, 2024",
      slug: "atualizacao-de-procedimentos-operacionais"
    },
    {
      image: "/resort-lobby.jpg",
      category: "Cultura",
      categoryColor: "bg-orange-600",
      title: "Programa de Bem-Estar Corporativo",
      description: "Descubra as novas iniciativas do nosso programa de bem-estar corporativo focado em saúde e qualidade de vida.",
      date: "20 de Setembro, 2024",
      slug: "programa-de-bem-estar-corporativo"
    }
  ]

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsData.map((card, index) => (
          <ResortCard
            key={index}
            image={card.image}
            category={card.category}
            categoryColor={card.categoryColor}
            title={card.title}
            description={card.description}
            date={card.date}
            link={`/publicacoes/${card.slug}`}
          />
        ))}
      </div>
    </div>
  )
}