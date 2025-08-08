#!/bin/bash

echo "🧪 Running Lead Closure Action Dialog Test Suite"
echo "=============================================="

echo ""
echo "📋 1. Unit Tests - Keyword Matrix & RPC Logic"
npm run test -- src/components/leads/__tests__/LeadClosureActionDialog.test.tsx

echo ""
echo "🔄 2. Integration Tests - Complete User Flows" 
npm run test -- src/components/leads/__tests__/LeadClosureActionDialog.integration.test.tsx

echo ""
echo "🌐 3. E2E Tests - Pipeline & Navigation Flows"
npm run test:e2e -- src/test/e2e/lead-closure.spec.ts

echo ""
echo "✅ Lead Closure Test Suite Complete!"
echo ""
echo "📊 Coverage Areas:"
echo "   ✓ suggest() keyword matrix → type recommendation"
echo "   ✓ buildPayload() mapping correctness by type"
echo "   ✓ createFromLead() RPC calls + error handling"
echo "   ✓ Complete user flows (create/open, create/stay, close)"
echo "   ✓ Inline input validation scenarios"
echo "   ✓ E2E pipeline → dialog → navigation flows"
echo "   ✓ Analytics tracking verification"