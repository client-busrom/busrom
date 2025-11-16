/**
 * Emergency user reset route
 * Visit this page to clear all users from database
 * Only available in non-production environments
 */

import type { Request } from 'express';

export default async function resetUsers(req: Request, context: any) {
  const { prisma } = context;

  // Security: Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return {
      status: 403,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Denied</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1>Access Denied</h1>
          <p>This endpoint is not available in production.</p>
        </body>
        </html>
      `,
    };
  }

  try {
    // Check if confirmation parameter is provided
    const confirm = req.query.confirm;

    if (confirm !== 'yes') {
      // Show confirmation page
      return {
        status: 200,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Reset Users - Confirmation Required</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #f57c00; margin-top: 0; }
              .warning {
                background: #fff3e0;
                border-left: 4px solid #f57c00;
                padding: 15px;
                margin: 20px 0;
              }
              button {
                background: #d32f2f;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
              }
              button:hover {
                background: #b71c1c;
              }
              .cancel {
                background: #757575;
                margin-left: 10px;
              }
              .cancel:hover {
                background: #616161;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>⚠️ Reset All Users</h1>
              <div class="warning">
                <strong>Warning:</strong> This action will permanently delete ALL users from the database.
                This cannot be undone!
              </div>
              <p>Are you sure you want to proceed?</p>
              <button onclick="window.location.href='/reset-users?confirm=yes'">
                Yes, Delete All Users
              </button>
              <button class="cancel" onclick="window.location.href='/'">
                Cancel
              </button>
            </div>
          </body>
          </html>
        `,
      };
    }

    // Execute deletion
    const countBefore = await prisma.user.count();
    const deleteResult = await prisma.user.deleteMany({});
    const countAfter = await prisma.user.count();

    return {
      status: 200,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Users Reset Complete</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .card {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #2e7d32; margin-top: 0; }
            .success {
              background: #e8f5e9;
              border-left: 4px solid #2e7d32;
              padding: 15px;
              margin: 20px 0;
            }
            .stats {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            button {
              background: #1976d2;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover {
              background: #1565c0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Users Reset Successfully</h1>
            <div class="success">
              All users have been deleted from the database.
            </div>
            <div class="stats">
              <strong>Statistics:</strong><br>
              Users before: ${countBefore}<br>
              Users deleted: ${deleteResult.count}<br>
              Users remaining: ${countAfter}
            </div>
            <p>You can now register a new admin user at the initialization page.</p>
            <button onclick="window.location.href='/init'">
              Go to Init Page
            </button>
          </div>
        </body>
        </html>
      `,
    };
  } catch (error) {
    console.error('Error resetting users:', error);

    return {
      status: 500,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #d32f2f; }
            .error { background: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; }
          </style>
        </head>
        <body>
          <h1>Error</h1>
          <div class="error">
            <strong>Failed to reset users:</strong><br>
            ${error instanceof Error ? error.message : String(error)}
          </div>
        </body>
        </html>
      `,
    };
  }
}
