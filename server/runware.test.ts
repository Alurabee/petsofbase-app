import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';

describe('Runware API', () => {
  it('should validate API key with a simple text-to-image request', async () => {
    const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
    
    expect(RUNWARE_API_KEY).toBeDefined();
    expect(RUNWARE_API_KEY).not.toBe('');

    // Create WebSocket connection to Runware API
    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket('wss://ws-api.runware.ai/v1');
      
      socket.on('open', () => resolve(socket));
      socket.on('error', reject);
      
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });

    // Authenticate
    await new Promise<void>((resolve, reject) => {
      ws.send(JSON.stringify([{
        taskType: 'authentication',
        apiKey: RUNWARE_API_KEY
      }]));

      ws.on('message', (data: Buffer) => {
        const response = JSON.parse(data.toString());
        
        if (response.errors) {
          reject(new Error(`Authentication failed: ${JSON.stringify(response.errors)}`));
        } else if (response.data && response.data[0]?.taskType === 'authentication') {
          resolve();
        }
      });

      setTimeout(() => reject(new Error('Authentication timeout')), 10000);
    });

    // Test simple image generation
    const taskUUID = crypto.randomUUID();
    
    const result = await new Promise<any>((resolve, reject) => {
      ws.send(JSON.stringify([{
        taskType: 'imageInference',
        taskUUID,
        positivePrompt: 'A simple test image',
        model: 'runware:100@1',
        width: 512,
        height: 512,
        numberResults: 1,
        includeCost: true
      }]));

      ws.on('message', (data: Buffer) => {
        const response = JSON.parse(data.toString());
        
        if (response.errors) {
          reject(new Error(`Image generation failed: ${JSON.stringify(response.errors)}`));
        } else if (response.data && response.data[0]?.taskUUID === taskUUID) {
          resolve(response.data[0]);
        }
      });

      setTimeout(() => reject(new Error('Image generation timeout')), 30000);
    });

    ws.close();

    expect(result).toBeDefined();
    expect(result.imageURL).toBeDefined();
    expect(result.cost).toBeDefined();
    
    console.log('✅ Runware API key is valid!');
    console.log(`Generated image: ${result.imageURL}`);
    console.log(`Cost: $${result.cost}`);
  }, 60000);
});
