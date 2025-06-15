
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  responseTime?: number;
  response?: any;
  headers?: Record<string, string>;
  error?: string;
}

interface WebhookTestResultProps {
  testResult: TestResult;
}

export function WebhookTestResult({ testResult }: WebhookTestResultProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        {testResult.success ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
        <h3 className="text-lg font-semibold">
          {testResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
        </h3>
      </div>

      <div className="space-y-4">
        {testResult.status && (
          <div>
            <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {testResult.status} {testResult.statusText}
            </Badge>
            {testResult.responseTime && (
              <span className="ml-2 text-sm text-gray-500">
                {testResult.responseTime}ms
              </span>
            )}
          </div>
        )}

        {testResult.response && (
          <div>
            <Label>Resposta:</Label>
            <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(testResult.response, null, 2)}
            </pre>
          </div>
        )}

        {testResult.error && (
          <div>
            <Label>Erro:</Label>
            <p className="mt-1 p-3 bg-red-50 text-red-800 rounded text-sm">
              {testResult.error}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
