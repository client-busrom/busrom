/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, H1, Stack } from '@keystone-ui/core';
import { Fragment, useState } from 'react';
import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo';
import { useRouter } from '@keystone-6/core/admin-ui/router';
import { Button } from '@keystone-ui/button';
import { Notice } from '@keystone-ui/notice';
import { TextInput } from '@keystone-ui/fields';

/**
 * Custom Busrom Initial Setup Page
 *
 * Based on Keystone's official InitPage with custom branding
 */

export default function CustomInitPage() {
  const { push } = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [createUser, { error, loading }] = useMutation(
    gql`
      mutation KsAuthInit($name: String!, $email: String!, $password: String!) {
        createInitialUser(
          data: {
            name: $name
            email: $email
            password: $password
          }
        ) {
          sessionToken
          item {
            id
            email
            isAdmin
            status
          }
        }
      }
    `,
    {
      variables: { name, email, password },
      onCompleted: (data) => {
        // Log for debugging - ensure user was created with admin privileges
        console.log('User created:', data.createInitialUser?.item);
      },
    }
  );

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
            maxWidth: '500px',
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
            <div
              css={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
              }}
            >
              <span
                css={{
                  fontSize: '2.5rem',
                }}
              >
                🚀
              </span>
            </div>
            <H1
              css={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
              }}
            >
              Welcome to Busrom CMS
            </H1>
            <p
              css={{
                color: '#666',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              Let's create your administrator account
            </p>
            <p
              css={{
                color: '#9ca3af',
                fontSize: '0.75rem',
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                borderLeft: '3px solid #D4AF37',
              }}
            >
              <strong>🔒 Security Note:</strong> This account will have full administrative privileges.
              Please use a strong password and keep your credentials secure.
            </p>
          </div>

          {/* Init Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await createUser();
              if (result.data?.createInitialUser?.item) {
                // Reload the page to refresh admin metadata
                window.location.href = '/';
              }
            }}
          >
            <Stack gap="large">
              {error && (
                <Notice tone="critical">
                  {error.message || 'Failed to create user'}
                </Notice>
              )}

              <TextInput
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                autoComplete="name"
              />

              <TextInput
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                type="email"
              />

              <TextInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                weight="bold"
                tone="active"
                isLoading={loading}
                css={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #C19B2E 0%, #E5C600 100%)',
                  }
                }}
              >
                Create Admin Account
              </Button>
            </Stack>
          </form>

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
              High-Quality Glass Hardware Solutions
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
        <div
          css={{
            position: 'absolute',
            top: '50%',
            right: '30%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
