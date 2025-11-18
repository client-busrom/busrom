/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, H1, Stack } from '@keystone-ui/core';
import { Fragment, useState, useEffect } from 'react';
import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo';
import { useRouter } from '@keystone-6/core/admin-ui/router';
import { useRawKeystone } from '@keystone-6/core/admin-ui/context';
import { Button } from '@keystone-ui/button';
import { TextInput } from '@keystone-ui/fields';

/**
 * Custom Busrom Sign In Page with 2FA Support
 *
 * Based on Keystone's official SigninPage with custom branding and 2FA
 */

export default function CustomSigninPage() {
  const { push } = useRouter();
  const { authenticatedItem } = useRawKeystone();
  const [identity, setIdentity] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [authenticate, { error, loading, data }] = useMutation(
    gql`
      mutation KsAuthSignin($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            item {
              id
            }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    {
      variables: {
        email: identity,
        password: secret,
      },
    }
  );

  if (authenticatedItem.state === 'authenticated') {
    push('/');
    return null;
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Step 1: Authenticate with password
      const result = await authenticate();

      if (result.data?.authenticateUserWithPassword?.__typename === 'UserAuthenticationWithPasswordSuccess') {
        // Step 2: Check if 2FA is required
        const check2FAResponse = await fetch('/api/2fa/check-required', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: identity }),
        });

        const check2FAData = await check2FAResponse.json();

        if (check2FAData.required) {
          // Show 2FA input
          setShowTwoFactor(true);
          setIsLoading(false);
        } else {
          // No 2FA required, reload to complete login
          window.location.href = '/';
        }
      } else if (result.data?.authenticateUserWithPassword?.message) {
        setErrorMessage(result.data.authenticateUserWithPassword.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed (认证失败)');
      setIsLoading(false);
    }
  };

  const handleTwoFactorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Verify 2FA code
      const verify2FAResponse = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: identity,
          token: twoFactorCode,
        }),
      });

      const verify2FAData = await verify2FAResponse.json();

      if (verify2FAResponse.ok && verify2FAData.success) {
        // 2FA verification successful, reload page
        window.location.href = '/';
      } else {
        setErrorMessage(verify2FAData.error || 'Invalid 2FA code (无效的2FA代码)');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || '2FA verification failed (2FA验证失败)');
      setIsLoading(false);
    }
  };

  return (
    <div
      css={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      }}
    >
      {/* Header with Logo */}
      <div
        css={{
          padding: '2rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h1
          css={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          Busrom
        </h1>
        <p
          css={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            letterSpacing: '0.1em',
          }}
        >
          Content Management System
        </p>
      </div>

      {/* Main Content Area */}
      <div
        css={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          css={{
            width: '100%',
            maxWidth: '450px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Welcome Message */}
          <div css={{ marginBottom: '2rem', textAlign: 'center' }}>
            <H1
              css={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
              }}
            >
              {showTwoFactor ? 'Two-Factor Authentication (双因素认证)' : 'Sign In (登录)'}
            </H1>
            <p
              css={{
                color: '#666',
                fontSize: '0.875rem',
              }}
            >
              {showTwoFactor
                ? 'Enter your 2FA code (输入您的2FA代码)'
                : 'Sign in to manage your content (登录以管理内容)'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              css={{
                marginBottom: '1rem',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Password Login Form */}
          {!showTwoFactor && (
            <form onSubmit={handlePasswordLogin}>
              <Stack gap="large">
                <TextInput
                  name="email"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Email (邮箱)"
                  autoComplete="email"
                  type="email"
                  disabled={isLoading}
                />

                <TextInput
                  name="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Password (密码)"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  weight="bold"
                  tone="active"
                  isLoading={isLoading}
                  css={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #C19B2E 0%, #E5C600 100%)',
                    }
                  }}
                >
                  Sign In (登录)
                </Button>
              </Stack>
            </form>
          )}

          {/* 2FA Verification Form */}
          {showTwoFactor && (
            <form onSubmit={handleTwoFactorLogin}>
              <Stack gap="large">
                <div>
                  <p css={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                    Enter the 6-digit code from your authenticator app.
                    <br />
                    <span css={{ fontSize: '0.75rem' }}>
                      输入验证器应用中的6位数字代码。
                    </span>
                  </p>
                  <TextInput
                    name="twoFactorCode"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    disabled={isLoading}
                    css={{
                      fontSize: '1.5rem',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  weight="bold"
                  tone="active"
                  isLoading={isLoading}
                  css={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #C19B2E 0%, #E5C600 100%)',
                    }
                  }}
                >
                  Verify (验证)
                </Button>

                <Button
                  type="button"
                  weight="none"
                  tone="passive"
                  onClick={() => {
                    setShowTwoFactor(false);
                    setTwoFactorCode('');
                    setErrorMessage('');
                  }}
                  css={{ width: '100%' }}
                >
                  Back to Login (返回登录)
                </Button>
              </Stack>
            </form>
          )}

          {/* Footer Info */}
          <div
            css={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <p
              css={{
                color: '#9ca3af',
                fontSize: '0.75rem',
              }}
            >
              © 2024 Busrom Hardware Co., Ltd.
            </p>
            <p
              css={{
                color: '#9ca3af',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
              }}
            >
              All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        css={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.1,
        }}
      >
        <div
          css={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
        <div
          css={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
