import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface BusinessNotificationEmailProps {
  name: string
  email: string
  subject: string
  message: string
  lawFirm?: string
  city?: string
  state?: string
  submissionId: string
}

export const BusinessNotificationEmail = ({
  name,
  email,
  subject,
  message,
  lawFirm,
  city,
  state,
  submissionId,
}: BusinessNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New contact form submission from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Form Submission</Heading>
        <Text style={text}>
          You have received a new contact form submission from your website.
        </Text>
        
        <div style={section}>
          <Text style={sectionTitle}>Contact Information</Text>
          <Text style={field}><strong>Name:</strong> {name}</Text>
          <Text style={field}><strong>Email:</strong> <Link href={`mailto:${email}`} style={link}>{email}</Link></Text>
          <Text style={field}><strong>Subject:</strong> {subject}</Text>
          {lawFirm && <Text style={field}><strong>Law Firm:</strong> {lawFirm}</Text>}
          {city && <Text style={field}><strong>City:</strong> {city}</Text>}
          {state && <Text style={field}><strong>State:</strong> {state}</Text>}
        </div>

        <div style={section}>
          <Text style={sectionTitle}>Message</Text>
          <div style={messageBox}>
            <Text style={messageText}>{message}</Text>
          </div>
        </div>

        <Text style={footer}>
          Submission ID: {submissionId}<br/>
          Sent via Amicus Edge Contact Form
        </Text>
      </Container>
    </Body>
  </Html>
)

export default BusinessNotificationEmail

const main = {
  backgroundColor: '#ffffff',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
}

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const section = {
  marginBottom: '32px',
}

const sectionTitle = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0 8px 0',
}

const field = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '8px 0',
}

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
}

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
}

const messageBox = {
  backgroundColor: '#f4f4f4',
  border: '1px solid #eee',
  borderRadius: '5px',
  padding: '16px',
  margin: '8px 0',
}

const messageText = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  marginBottom: '24px',
  borderTop: '1px solid #eee',
  paddingTop: '16px',
}