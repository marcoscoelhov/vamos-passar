
import React from 'react';
import { useWebhookTester } from './useWebhookTester';
import { WebhookTestForm } from './WebhookTestForm';
import { WebhookTestResult } from './WebhookTestResult';
import { WebhookTestLogs } from './WebhookTestLogs';

export function WebhookTester() {
  const {
    testData,
    setTestData,
    testing,
    testResult,
    logs,
    testWebhook,
    loadKwifyTemplate,
    clearLogs
  } = useWebhookTester();

  return (
    <div className="space-y-6">
      <WebhookTestForm
        testData={testData}
        setTestData={setTestData}
        testing={testing}
        onTest={testWebhook}
        onLoadKwifyTemplate={loadKwifyTemplate}
      />

      {testResult && (
        <WebhookTestResult testResult={testResult} />
      )}

      <WebhookTestLogs logs={logs} onClearLogs={clearLogs} />
    </div>
  );
}
