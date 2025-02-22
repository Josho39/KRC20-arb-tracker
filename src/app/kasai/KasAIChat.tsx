'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, Loader2, AlertCircle, Copy, Bug } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
  rawContent?: string
}

const formatCode = (codeContent: string) => {
  return codeContent.split('\n').map((line, i) => (
    <div key={i} className="whitespace-pre">
      {line.split(/(import\s+.*|from\s+.*|\/\/.*|#.*|".*"|'.*')/g).map((segment, j) => {
        if (segment.startsWith('import') || segment.startsWith('from')) {
          return <span key={j} className="text-blue-400">{segment}</span>
        } else if (segment.startsWith('#') || segment.startsWith('//')) {
          return <span key={j} className="text-green-400">{segment}</span>
        } else if (segment.startsWith('"') || segment.startsWith("'")) {
          return <span key={j} className="text-yellow-300">{segment}</span>
        }
        return <span key={j} className="text-gray-100">{segment}</span>
      })}
    </div>
  ))
}

const formatMessage = (content: string) => {
  if (!content.includes('**') && !content.includes('```')) {
    return <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
  }

  const parts = content.split(/(```[\s\S]*?```|\*\*[^*\n]+\*\*)/g)
  
  return (
    <div className="space-y-4 w-full break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3)
          const codeContent = code.split('\n').slice(1).join('\n')
          
          return (
            <div key={index} className="relative group w-full">
              <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto font-mono text-sm w-full">
                {formatCode(codeContent)}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(codeContent)}
              >
                <Copy className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          )
        } else if (part.startsWith('**') && part.endsWith('**')) {
          const text = part.slice(2, -2).trim()
          if (text) {
            return <h3 key={index} className="text-lg font-bold">{text}</h3>
          }
          return null
        } else if (part.trim()) {
          const cleanedPart = part.replace(/\*(?!\*)/g, '')
          return <p key={index} className="leading-relaxed whitespace-pre-wrap break-words">{cleanedPart}</p>
        }
        return null
      })}
    </div>
  )
}

const TypeWriter = ({ content, onComplete }: { content: string; onComplete: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState('')
  const speed = 4

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(prev => prev + content[currentIndex])
        currentIndex++
        const scrollableArea = document.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollableArea) {
          scrollableArea.scrollTop = scrollableArea.scrollHeight
        }
      } else {
        clearInterval(interval)
        onComplete()
      }
    }, 2 / speed)

    return () => clearInterval(interval)
  }, [content, onComplete])

  return <div>{formatMessage(displayedContent)}</div>
}

const Message = ({ message }: { message: Message }) => {
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  const handleTypingComplete = () => {
    setIsTypingComplete(true)
    setIsDebugOpen(false)
  }

  return (
    <div className={cn(
      "flex gap-3 max-w-[90%] group/message",
      message.role === 'assistant' ? 'mr-auto' : 'ml-auto flex-row-reverse'
    )}>
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="relative">
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm",
          message.role === 'assistant' ? "bg-muted" : "bg-primary text-primary-foreground"
        )}>
          {message.role === 'assistant' && message.isTyping && !isTypingComplete ? (
            <TypeWriter content={message.content} onComplete={handleTypingComplete} />
          ) : (
            formatMessage(message.content)
          )}
        </div>
        {message.role === 'assistant' && isTypingComplete && (
          <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-6 top-2 h-8 w-8 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity"
              >
                <Bug className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[800px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Message Debug View</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Raw Response:</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    {message.rawContent || message.content}
                  </pre>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Processed Response:</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    {message.content}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

const KasAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input.trim() }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      setMessages(prev => {
        const isLastMessageUser = prev[prev.length - 1]?.role === 'user'
        if (!isLastMessageUser) return prev
        return [...prev, { 
          role: 'assistant', 
          content: data.response,
          rawContent: data.rawResponse,
          isTyping: true 
        }]
      })
    } catch (err) {
      setError('Failed to get response. Please try again.')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
      scrollToBottom()
    }
  }

  return (
    <Card className="w-full h-[800px] flex flex-col">
      <CardHeader className="shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>KAS AI Assistant</CardTitle>
            <CardDescription>Your guide to the Kaspa ecosystem</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Welcome to KAS AI</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Ask me anything about Kaspa, KRC20 tokens, wallets, or the ecosystem.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <Message key={index} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking about Kaspa...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="pt-4 shrink-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask about Kaspa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="flex gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export default KasAIChat