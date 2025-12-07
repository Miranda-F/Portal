'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface SimpleWordEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SimpleWordEditor({ 
  value, 
  onChange, 
  placeholder = "Digite seu texto aqui...",
  className = "" 
}: SimpleWordEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <Card className={`border ${isFocused ? 'border-primary' : 'border-input'} ${className}`}>
      <CardContent className="p-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full min-h-[200px] p-4 resize-none focus:outline-none bg-transparent"
        />
      </CardContent>
    </Card>
  )
}