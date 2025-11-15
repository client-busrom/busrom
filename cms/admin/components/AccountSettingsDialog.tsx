/** @jsxRuntime classic */
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react'
import { jsx } from '@keystone-ui/core'
import { Button } from '@keystone-ui/button'
import { useState } from 'react'
import { gql, useMutation, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { useTheme, Stack, Box, Heading, Text } from '@keystone-ui/core'
import { FieldLabel, FieldDescription, TextInput } from '@keystone-ui/fields'
import { SettingsIcon } from '@keystone-ui/icons/icons/SettingsIcon'
import { useRouter } from 'next/router'

const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`

const GET_CURRENT_USER = gql`
  query GetCurrentUserForSettings {
    authenticatedItem {
      ... on User {
        id
        name
        email
        isAdmin
        twoFactorEnabled
        roles {
          id
          name
          code
        }
      }
    }
  }
`

type Message = {
  type: 'success' | 'error'
  text: string
} | null

export function AccountSettingsDialog() {
  const { spacing, colors, radii, shadow } = useTheme()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<Message>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { data } = useQuery(GET_CURRENT_USER)
  const [endSession, { loading: signingOut }] = useMutation(END_SESSION, {
    onCompleted: () => {
      window.location.reload()
    },
  })

  const [updatingPassword, setUpdatingPassword] = useState(false)

  const user = data?.authenticatedItem

  const handlePasswordChange = async () => {
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' })
      return
    }

    setUpdatingPassword(true)

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error' })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handle2FAClick = () => {
    setIsOpen(false)
    router.push('/two-factor-auth')
  }

  const handleClose = () => {
    setIsOpen(false)
    setMessage(null)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <>
      <Button
        size="small"
        onClick={() => setIsOpen(true)}
        aria-label="Account settings"
      >
        <SettingsIcon size="small" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            css={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            css={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors.background,
              borderRadius: radii.medium,
              boxShadow: shadow.s300,
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 1000,
              padding: spacing.xlarge,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Stack gap="large">
              {/* Header */}
              <Box>
                <Heading type="h3">Account Settings</Heading>
              </Box>

              {/* User Information */}
              <Box>
                <Heading type="h4" css={{ marginBottom: spacing.medium }}>
                  User Information
                </Heading>
                <Stack gap="small">
                  <div>
                    <Text weight="semibold">Name:</Text>
                    <Text css={{ marginLeft: spacing.small }}>{user?.name}</Text>
                  </div>
                  <div>
                    <Text weight="semibold">Email:</Text>
                    <Text css={{ marginLeft: spacing.small }}>{user?.email}</Text>
                  </div>
                  <div>
                    <Text weight="semibold">Role:</Text>
                    <Text css={{ marginLeft: spacing.small }}>
                      {user?.isAdmin ? 'Administrator' : user?.roles?.map((r: any) => r.name).join(', ') || 'No role assigned'}
                    </Text>
                  </div>
                </Stack>
              </Box>

              {/* Message Display */}
              {message && (
                <Box
                  padding="medium"
                  rounding="medium"
                  css={{
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  }}
                >
                  {message.text}
                </Box>
              )}

              {/* Change Password */}
              <Box>
                <Heading type="h4" css={{ marginBottom: spacing.medium }}>
                  Change Password
                </Heading>
                <Stack gap="medium">
                  <div>
                    <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                    <div css={{ position: 'relative' }}>
                      <TextInput
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        css={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#666',
                          '&:hover': {
                            color: '#333',
                          },
                        }}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <div css={{ position: 'relative' }}>
                      <TextInput
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        css={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#666',
                          '&:hover': {
                            color: '#333',
                          },
                        }}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <FieldDescription id="newPasswordDesc">Must be at least 8 characters long</FieldDescription>
                  </div>
                  <div>
                    <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                    <div css={{ position: 'relative' }}>
                      <TextInput
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        css={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#666',
                          '&:hover': {
                            color: '#333',
                          },
                        }}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <Button
                    tone="active"
                    onClick={handlePasswordChange}
                    isLoading={updatingPassword}
                  >
                    Update Password
                  </Button>
                </Stack>
              </Box>

              {/* Two-Factor Authentication */}
              <Box>
                <Heading type="h4" css={{ marginBottom: spacing.medium }}>
                  Two-Factor Authentication
                </Heading>
                <Stack gap="small">
                  <div>
                    <Text weight="semibold">Status:</Text>
                    <Text css={{ marginLeft: spacing.small }}>
                      {user?.twoFactorEnabled ? (
                        <span css={{ color: '#28a745' }}>✓ Enabled</span>
                      ) : (
                        <span css={{ color: '#6c757d' }}>Not enabled</span>
                      )}
                    </Text>
                  </div>
                  <Button onClick={handle2FAClick}>
                    {user?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                  </Button>
                </Stack>
              </Box>

              {/* Actions */}
              <Box css={{
                borderTop: `1px solid ${colors.border}`,
                paddingTop: spacing.medium,
                display: 'flex',
                gap: spacing.small,
                justifyContent: 'flex-end'
              }}>
                <Button
                  tone="negative"
                  onClick={() => endSession()}
                  isLoading={signingOut}
                >
                  Sign Out
                </Button>
                <Button onClick={handleClose}>
                  Close
                </Button>
              </Box>
            </Stack>
          </div>
        </>
      )}
    </>
  )
}
