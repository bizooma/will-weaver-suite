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

interface UserConfirmationEmailProps {
  name: string
  subject: string
}

export const UserConfirmationEmail = ({
  name,
  subject,
}: UserConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for contacting Amicus Edge</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Contacting Us</Heading>
        <Text style={text}>
          Dear {name},
        </Text>
        <Text style={text}>
          Thank you for reaching out to Amicus Edge regarding "{subject}". We have received your message and will get back to you within 24 hours.
        </Text>
        <Text style={text}>
          Our team is excited to help you transform your law firm with cutting-edge technology solutions including:
        </Text>
        <ul style={list}>
          <li style={listItem}>Custom Alexa Skills for Legal Practices</li>
          <li style={listItem}>Mobile Apps for Client Management</li>
          <li style={listItem}>AI-Powered Chatbots</li>
          <li style={listItem}>Legal Document Automation</li>
        </ul>
        <Text style={text}>
          In the meantime, feel free to explore our services on our website or call us at <Link href="tel:8453779730" style={link}>845-377-9730</Link>.
        </Text>
        <Text style={text}>
          Best regards,<br/>
          The Amicus Edge Team
        </Text>
        <Text style={footer}>
          <Link
            href="https://amicusedge.com"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            Amicus Edge
          </Link>
          <br/>
          200 N Laura St<br/>
          Jacksonville, FL 32202
        </Text>
      </Container>
    </Body>
  </Html>
)

export default UserConfirmationEmail

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

const list = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
  paddingLeft: '20px',
}

const listItem = {
  margin: '8px 0',
}

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}