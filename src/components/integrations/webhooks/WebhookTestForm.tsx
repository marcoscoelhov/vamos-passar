
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Play, Loader2, Copy } from 'lucide-react';

interface TestData {
  url: string;
  method: string;
  headers: string;
  payload: string;
}

interface WebhookTestFormProps {
  testData: TestData;
  setTestData: React.Dispatch<React.SetStateAction<TestData>>;
  testing: boolean;
  onTest: () => void;
  onLoadKwifyTemplate: () => void;
}

export function WebhookTestForm({ 
  testData, 
  setTestData, 
  testing, 
  onTest, 
  onLoadKwifyTemplate 
}: WebhookTestFormProps) {
  const { toast } = useToast();

  const copyKwifyUrl = () => {
    navigator.clipboard.writeText(testData.url);
    toast({
      title: 'URL copiada',
      description: 'URL do webhook copiada para a área de transferência'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Testador de Webhook</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadKwifyTemplate}
          >
            Template Kwify
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyKwifyUrl}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar URL
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="url">URL do Webhook</Label>
            <Input
              id="url"
              value={testData.url}
              onChange={(e) => setTestData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="method">Método HTTP</Label>
            <Select value={testData.method} onValueChange={(value) => setTestData(prev => ({ ...prev, method: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="headers">Headers (JSON)</Label>
          <Textarea
            id="headers"
            value={testData.headers}
            onChange={(e) => setTestData(prev => ({ ...prev, headers: e.target.value }))}
            rows={3}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="payload">Payload (JSON)</Label>
          <Textarea
            id="payload"
            value={testData.payload}
            onChange={(e) => setTestData(prev => ({ ...prev, payload: e.target.value }))}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={onTest}
          disabled={testing}
          className="gap-2"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {testing ? 'Testando...' : 'Testar Webhook'}
        </Button>
      </div>
    </Card>
  );
}
