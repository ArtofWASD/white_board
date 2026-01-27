#!/bin/bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test_debug_v2@example.com", "password": "password123", "name": "Test Debug", "role": "ATHLETE"}'
