# 🔐 AWS Permissions Setup Guide for Busrom Deployment

## ❌ Current Issue

The IAM user `busrom-develop` is missing required AWS permissions to run the deployment scripts.

**Error encountered:**
```
User: arn:aws:iam::660753258365:user/busrom-develop is not authorized to perform:
ecr:CreateRepository on resource: arn:aws:ecr:us-east-1:660753258365:repository/busrom-cms-staging
```

## 🎯 Required Permissions

The IAM user needs the following AWS services access:
- ✅ **ECR** (Elastic Container Registry) - Store Docker images
- ✅ **ECS** (Elastic Container Service) - Run containers
- ✅ **EC2** - VPC, Security Groups, Subnets
- ✅ **S3** - Media storage
- ✅ **RDS** - PostgreSQL database
- ✅ **CloudWatch Logs** - Application logs
- ✅ **Secrets Manager** - Store sensitive data
- ✅ **ELB** (Elastic Load Balancer) - Load balancing
- ✅ **IAM** - Create service roles for ECS tasks

---

## 🛠️ Solution: Two Options

### Option 1: Use AWS Managed Policies (Recommended - Easiest)

Have an AWS administrator run these commands:

```bash
# Attach necessary AWS managed policies to the user
aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess

# EC2 permissions for VPC and Security Groups
aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess

# IAM permissions (limited - for creating ECS task roles)
aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

**Or use the helper script:**
```bash
./scripts/attach-managed-policies.sh busrom-develop
```

---

### Option 2: Use Custom Policy (More Secure - Least Privilege)

Have an AWS administrator run:

```bash
# Create the custom policy
aws iam create-policy \
  --policy-name BusromDeploymentPolicy \
  --policy-document file://scripts/iam-policy.json \
  --description "Custom policy for Busrom deployment"

# Attach it to the user (replace AWS_ACCOUNT_ID with your account number)
aws iam attach-user-policy \
  --user-name busrom-develop \
  --policy-arn arn:aws:iam::660753258365:policy/BusromDeploymentPolicy
```

---

## 🌐 AWS Console Method (Alternative)

If you prefer using the AWS Console:

1. **Login to AWS Console** with an administrator account
2. Go to **IAM** → **Users** → **busrom-develop**
3. Click **Add permissions** → **Attach policies directly**
4. Search and select the following managed policies:
   - ✅ `AmazonEC2ContainerRegistryFullAccess`
   - ✅ `AmazonECS_FullAccess`
   - ✅ `AmazonS3FullAccess`
   - ✅ `AmazonRDSFullAccess`
   - ✅ `CloudWatchLogsFullAccess`
   - ✅ `SecretsManagerReadWrite`
   - ✅ `ElasticLoadBalancingFullAccess`
   - ✅ `AmazonVPCFullAccess`
   - ✅ `IAMFullAccess` ⚠️ (Use with caution - only if you need to create IAM roles)
5. Click **Add permissions**

**Screenshots to help:**
- Step 1: IAM Console → Users
  ![IAM Users](https://console.aws.amazon.com/iam/home#/users)
- Step 2: Select `busrom-develop`
- Step 3: Permissions tab → Add permissions
- Step 4: Attach policies directly → Search and select policies

---

## 📋 Verification

After attaching the policies, verify they're attached:

```bash
# List all attached policies
aws iam list-attached-user-policies --user-name busrom-develop

# Expected output should include:
# - AmazonEC2ContainerRegistryFullAccess
# - AmazonECS_FullAccess
# - AmazonS3FullAccess
# - etc.
```

---

## 🧪 Test the Setup

Once permissions are attached, try running the infrastructure script again:

```bash
./scripts/setup-aws-infrastructure.sh staging
```

If successful, you should see:
```
[1/7] Creating ECR Repositories...
  ✓ Created ECR repository: busrom-cms-staging
  ✓ Created ECR repository: busrom-web-staging
  ...
```

---

## ⚠️ Security Considerations

### For Production Environments:

1. **Use Option 2 (Custom Policy)** - Provides minimum required permissions
2. **Enable MFA** on the IAM user
3. **Use separate users** for staging and production
4. **Regularly rotate** access keys
5. **Use IAM roles** for EC2/ECS instead of IAM users where possible
6. **Enable CloudTrail** to audit all API calls

### Reducing IAM Permissions:

If you don't need `IAMFullAccess`, you can create a more restrictive policy that only allows:
- Creating ECS task execution roles
- Passing roles to ECS services

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "iam:GetRole"
      ],
      "Resource": "arn:aws:iam::660753258365:role/busrom-*"
    }
  ]
}
```

---

## 🆘 Still Having Issues?

1. **Check you're using the right AWS profile:**
   ```bash
   aws configure list
   aws sts get-caller-identity
   ```

2. **Verify the user exists:**
   ```bash
   aws iam get-user --user-name busrom-develop
   ```

3. **Check for denied permissions in CloudTrail:**
   - AWS Console → CloudTrail → Event history
   - Filter by user `busrom-develop`
   - Look for `AccessDenied` errors

4. **Contact your AWS administrator** if you don't have sufficient permissions to modify IAM policies

---

## 📞 Need Help?

- **AWS IAM Documentation**: https://docs.aws.amazon.com/iam/
- **AWS Support**: Open a support ticket if you have AWS Support plan
- **Check the deployment guide**: `AWS_DEPLOYMENT_GUIDE.md`

---

**Last Updated**: 2025-11-16
