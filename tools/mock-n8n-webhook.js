#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

function buildResponse(data) {
  const { tool, name, email, startTime } = data || {};

  if (!tool || !name) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Missing required fields: tool, name'
      }
    };
  }

  if (tool === 'check') {
    const now = new Date();
    const slots = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0, 0)
    ].map(d => d.toISOString());

    return {
      status: 200,
      body: {
        success: true,
        action: 'check',
        requested: { name, email, startTime },
        availableSlots: slots
      }
    };
  }

  if (tool === 'book') {
    if (!startTime) {
      return {
        status: 400,
        body: { success: false, error: 'Missing startTime for booking' }
      };
    }
    const confirmationId = 'RDV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      status: 200,
      body: {
        success: true,
        action: 'book',
        confirmationId,
        scheduledAt: startTime,
        customer: { name, email }
      }
    };
  }

  return {
    status: 400,
    body: { success: false, error: `Unknown tool: ${tool}` }
  };
}

function registerWebhook(path) {
  app.post(path, (req, res) => {
    const result = buildResponse(req.body);
    res.status(result.status).json(result.body);
  });
  app.get(path, (_req, res) => res.status(200).send('OK'));
}

registerWebhook('/webhook/appointment-webhook');
registerWebhook('/webhook-test/appointment-webhook');

app.listen(port, () => {
  console.log(`Mock n8n webhook server listening on http://127.0.0.1:${port}`);
  console.log('Endpoints:');
  console.log('  POST /webhook/appointment-webhook');
  console.log('  POST /webhook-test/appointment-webhook');
});