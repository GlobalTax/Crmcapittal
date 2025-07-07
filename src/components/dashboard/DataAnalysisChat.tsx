import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, TrendingUp, Users, Building2 } from 'lucide-react';
import { useOpenAIAssistant } from '@/hooks/useOpenAIAssistant';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DataAnalysisChatProps {
  data?: {
    operations?: any[];
    leads?: any[];
    contacts?: any[];
    companies?: any[];
  };
}

const suggestedQuestions = [
  "¿Cuáles son las operaciones más grandes del último trimestre?",
  "¿Qué sectores tienen más actividad?",
  "¿Cuál es el estado de nuestro pipeline de leads?",
  "¿Qué empresas deberían ser contactadas prioritariamente?",
  "¿Cuáles son las tendencias de facturación por sector?",
  "¿Qué operaciones están más cerca de cerrarse?"
];

export const DataAnalysisChat = ({ data = {} }: DataAnalysisChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy tu asistente de análisis de datos. Puedo ayudarte a entender mejor tu información de CRM. ¿Qué te gustaría saber?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const { analyzeDataWithAI, isLoading } = useOpenAIAssistant();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await analyzeDataWithAI(data, input);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo analizar los datos",
        variant: "destructive"
      });
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Análisis Inteligente de Datos
          <Badge variant="secondary" className="text-xs">
            <Bot className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Analizando datos...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preguntas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1 px-2 whitespace-normal text-left"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="flex gap-2 text-xs text-muted-foreground">
          {data.operations && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {data.operations.length} operaciones
            </div>
          )}
          {data.leads && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {data.leads.length} leads
            </div>
          )}
          {data.companies && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {data.companies.length} empresas
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre tus datos..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};