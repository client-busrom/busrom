# 🚨 Quick Fix: AWS Permissions Error

## The Problem

```
User: arn:aws:iam::660753258365:user/busrom-develop is not authorized to perform:
ecr:CreateRepository
```

**Root Cause**: The IAM user `busrom-develop` doesn't have the necessary AWS permissions.

---

## ✅ Quick Solution (Choose One)

### Option 1: Have AWS Admin Attach Policies (Recommended)

Send this to your AWS administrator:

**Run this command on a machine with AWS admin access:**

```bash
cd /path/to/busrom-work
./scripts/attach-managed-policies.sh busrom-develop
```

Or manually run these commands:

```bash
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess
aws iam attach-user-policy --user-name busrom-develop --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

---

### Option 2: Use AWS Console

1. Login to **AWS Console** with admin account
2. Go to **IAM** → **Users** → **busrom-develop**
3. Click **Permissions** tab → **Add permissions**
4. Select **Attach policies directly**
5. Search and check these policies:
   - ✅ AmazonEC2ContainerRegistryFullAccess
   - ✅ AmazonECS_FullAccess
   - ✅ AmazonS3FullAccess
   - ✅ AmazonRDSFullAccess
   - ✅ CloudWatchLogsFullAccess
   - ✅ SecretsManagerReadWrite
   - ✅ ElasticLoadBalancingFullAccess
   - ✅ AmazonVPCFullAccess
   - ✅ IAMFullAccess
6. Click **Add permissions**

**Direct link**: https://console.aws.amazon.com/iam/home#/users/busrom-develop

---

## 🧪 Verify It Worked

After permissions are added, run:

```bash
./scripts/setup-aws-infrastructure.sh staging
```

You should see:
```
[1/7] Creating ECR Repositories...
  ✓ Created ECR repository: busrom-cms-staging
  ✓ Created ECR repository: busrom-web-staging
```

---

## 📚 More Information

- Full guide: `PERMISSIONS_SETUP_GUIDE.md`
- Deployment guide: `AWS_DEPLOYMENT_GUIDE.md`
- IAM Policy: `scripts/iam-policy.json`

---

## ⚠️ Important Notes

1. **IAMFullAccess** is powerful - only grant if you trust the user
2. For production, use the custom policy in `scripts/iam-policy.json` (more restrictive)
3. Consider using separate IAM users for staging and production
4. Enable MFA on IAM users with elevated permissions

---

**Quick Checklist:**

- [ ] AWS admin has attached the policies (or you used AWS Console)
- [ ] Run verification: `aws iam list-attached-user-policies --user-name busrom-develop`
- [ ] Retry infrastructure setup: `./scripts/setup-aws-infrastructure.sh staging`
- [ ] If still failing, check `PERMISSIONS_SETUP_GUIDE.md`
