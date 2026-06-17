import { eq } from 'drizzle-orm'
import nodemailer from 'nodemailer'
import type { ReactNode } from 'react'
import { render, toPlainText } from 'react-email'
import { db } from '@/db'
import { user } from '@/db/schema'

function getTransporter() {
  const host = process.env.SMTP_HOST || 'localhost'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = port === 465

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

interface SendEmailParams {
  to: string
  subject: string
  component: ReactNode
}

export async function sendEmail({ to, subject, component }: SendEmailParams) {
  try {
    const html = await render(component)
    const text = toPlainText(html)

    // getTransporter validates SMTP_USER exists
    const transporter = getTransporter()
    const smtpUser = process.env.SMTP_USER!
    const defaultFromName = process.env.SMTP_FROM_NAME

    await transporter.sendMail({
      from: {
        address: smtpUser,
        name: defaultFromName,
      },
      to,
      subject,
      text,
      html: html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const [result] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return result?.email ?? null
}
