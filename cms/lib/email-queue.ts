/**
 * Email Queue System
 *
 * This module provides a simple in-memory email queue with:
 * - Non-blocking email sending (queue-based)
 * - Automatic retry on failure (3 attempts with exponential backoff)
 * - Email sending logs
 * - Batch processing
 *
 * For production with high volume, consider using:
 * - Redis-based queue (Bull, BullMQ)
 * - AWS SQS
 * - RabbitMQ
 */

import type { KeystoneContext } from '@keystone-6/core/types'
import { sendContactFormNotification, sendFormSubmissionNotification, type ContactFormData, type FormSubmissionData } from './email-sender'

/**
 * Email Job Interface
 */
interface EmailJob {
  id: string
  type: 'contact-form-notification' | 'form-submission-notification'
  data: ContactFormData | FormSubmissionData
  attempts: number
  maxAttempts: number
  createdAt: Date
  lastAttemptAt?: Date
  error?: string
}

/**
 * Email Queue Class
 */
class EmailQueue {
  private queue: EmailJob[] = []
  private processing = false
  private context: KeystoneContext | null = null

  /**
   * Initialize the queue with Keystone context
   */
  initialize(context: KeystoneContext) {
    this.context = context
    console.log('✅ Email queue initialized')
  }

  /**
   * Add a job to the queue
   */
  async addJob(type: 'contact-form-notification' | 'form-submission-notification', data: ContactFormData | FormSubmissionData): Promise<string> {
    const jobId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const job: EmailJob = {
      id: jobId,
      type,
      data,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    }

    this.queue.push(job)

    console.log(`📬 Email job added to queue: ${jobId} (Queue size: ${this.queue.length})`)

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    // Log to database (non-blocking)
    this.logEmailJob(job, 'QUEUED').catch(err => {
      console.error('Failed to log email job:', err)
    })

    return jobId
  }

  /**
   * Process the queue
   */
  private async processQueue() {
    if (this.processing) return
    if (this.queue.length === 0) return
    if (!this.context) {
      console.error('❌ Email queue not initialized with context')
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const job = this.queue[0]

      try {
        await this.processJob(job)
        // Remove successful job
        this.queue.shift()
      } catch (error) {
        console.error(`❌ Error processing email job ${job.id}:`, error)

        // Update job
        job.attempts++
        job.lastAttemptAt = new Date()
        job.error = error instanceof Error ? error.message : String(error)

        // Remove job if max attempts reached
        if (job.attempts >= job.maxAttempts) {
          console.error(`❌ Email job ${job.id} failed after ${job.attempts} attempts. Removing from queue.`)
          this.queue.shift()

          // Log failure
          this.logEmailJob(job, 'FAILED').catch(err => {
            console.error('Failed to log email job failure:', err)
          })
        } else {
          // Wait before retry (exponential backoff: 5s, 10s, 20s)
          const delay = Math.pow(2, job.attempts) * 5000
          console.log(`⏳ Retrying email job ${job.id} in ${delay / 1000}s (attempt ${job.attempts + 1}/${job.maxAttempts})`)

          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    this.processing = false
  }

  /**
   * Process a single job
   */
  private async processJob(job: EmailJob): Promise<void> {
    if (!this.context) {
      throw new Error('Email queue not initialized')
    }

    console.log(`📧 Processing email job: ${job.id} (Attempt ${job.attempts + 1}/${job.maxAttempts})`)

    switch (job.type) {
      case 'contact-form-notification':
        const success = await sendContactFormNotification(job.data as ContactFormData, this.context)
        if (!success) {
          throw new Error('Email sending failed')
        }

        // Log success
        this.logEmailJob(job, 'SENT').catch(err => {
          console.error('Failed to log email job success:', err)
        })
        break

      case 'form-submission-notification':
        const formSuccess = await sendFormSubmissionNotification(job.data as FormSubmissionData, this.context)
        if (!formSuccess) {
          throw new Error('Email sending failed')
        }

        // Log success
        this.logEmailJob(job, 'SENT').catch(err => {
          console.error('Failed to log email job success:', err)
        })
        break

      default:
        throw new Error(`Unknown email job type: ${job.type}`)
    }

    console.log(`✅ Email job completed: ${job.id}`)
  }

  /**
   * Log email job to database
   */
  private async logEmailJob(job: EmailJob, status: 'QUEUED' | 'SENT' | 'FAILED'): Promise<void> {
    if (!this.context) return

    try {
      // Note: You need to create an EmailLog model in your schema
      // For now, we'll just log to console
      console.log(`📝 [EMAIL LOG] Job: ${job.id} | Status: ${status} | Attempts: ${job.attempts}/${job.maxAttempts}`)

      // Uncomment this when EmailLog model is created:
      /*
      await this.context.db.EmailLog.createOne({
        data: {
          jobId: job.id,
          type: job.type,
          status: status,
          attempts: job.attempts,
          recipientEmail: job.data.email,
          recipientName: job.data.name,
          error: job.error,
          sentAt: status === 'SENT' ? new Date() : undefined,
        },
      })
      */
    } catch (error) {
      console.error('Error logging email job:', error)
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      processing: this.processing,
      jobs: this.queue.map(job => ({
        id: job.id,
        type: job.type,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        createdAt: job.createdAt,
      })),
    }
  }
}

// Singleton instance
export const emailQueue = new EmailQueue()

/**
 * Helper function to send email via queue
 *
 * This is a drop-in replacement for sendContactFormNotification
 * that uses the queue instead of blocking
 */
export async function queueContactFormNotification(
  form: ContactFormData,
  context: KeystoneContext
): Promise<string> {
  // Initialize queue if needed
  if (!emailQueue['context']) {
    emailQueue.initialize(context)
  }

  return await emailQueue.addJob('contact-form-notification', form)
}

/**
 * Helper function to queue FormSubmission notification
 */
export async function queueFormSubmissionNotification(
  form: FormSubmissionData,
  context: KeystoneContext
): Promise<string> {
  // Initialize queue if needed
  if (!emailQueue['context']) {
    emailQueue.initialize(context)
  }

  return await emailQueue.addJob('form-submission-notification', form)
}
