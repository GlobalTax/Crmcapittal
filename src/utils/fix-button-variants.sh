#!/bin/bash
# Quick script to replace button variants globally
find src -name "*.tsx" -exec sed -i 's/variant="outline"/variant="secondary"/g' {} \;
find src -name "*.tsx" -exec sed -i 's/variant="destructive"/variant="primary"/g' {} \;
find src -name "*.tsx" -exec sed -i 's/variant="link"/variant="ghost"/g' {} \;
find src -name "*.tsx" -exec sed -i 's/variant="success"/variant="primary"/g' {} \;
find src -name "*.tsx" -exec sed -i 's/variant="warning"/variant="primary"/g' {} \;
echo "Button variants updated successfully!"