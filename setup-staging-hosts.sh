#!/bin/bash

# Setup hosts file for AWS Staging environment
# Run with: sudo bash setup-staging-hosts.sh

ALB_IP="198.18.0.90"

echo "Adding AWS Staging hosts entries..."

# Backup current hosts file
cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)

# Remove old entries if they exist
sed -i '' '/cms-staging.busrom.com/d' /etc/hosts
sed -i '' '/staging.busrom.com/d' /etc/hosts

# Add new entries
echo "" >> /etc/hosts
echo "# AWS Staging Environment" >> /etc/hosts
echo "$ALB_IP cms-staging.busrom.com" >> /etc/hosts
echo "$ALB_IP staging.busrom.com" >> /etc/hosts

echo "✅ Hosts file updated!"
echo ""
echo "You can now access:"
echo "  CMS: http://cms-staging.busrom.com"
echo "  Web: http://staging.busrom.com"
echo ""
echo "To test:"
echo "  Clear users: http://cms-staging.busrom.com/force-clear-users"
echo "  Init page:   http://cms-staging.busrom.com/init"
