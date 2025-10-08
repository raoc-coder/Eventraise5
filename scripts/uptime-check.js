#!/usr/bin/env node

/**
 * Simple uptime check script for EventraiseHub
 * Run with: node scripts/uptime-check.js
 */

const https = require('https');

const BASE_URL = process.env.BASE_URL || 'https://www.eventraisehub.com';
const HEALTH_ENDPOINT = `${BASE_URL}/api/health`;

function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = https.get(HEALTH_ENDPOINT, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          reject(new Error(`Invalid JSON: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  const start = Date.now();
  try {
    const { status, data } = await checkHealth();
    const duration = Date.now() - start;
    
    if (status === 200 && data.ok) {
      console.log(`✅ Health check passed (${duration}ms)`);
      console.log(`   Timestamp: ${data.timestamp}`);
      process.exit(0);
    } else {
      console.log(`❌ Health check failed: ${status}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    process.exit(1);
  }
}

main();
