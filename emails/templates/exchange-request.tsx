import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components"

interface ExchangeRequestEmailProps {
  hostName: string
  requesterName: string
  requesterHomeName: string
  hostHomeName: string
  startDate: string
  endDate: string
  guests: number
  message: string
  exchangeUrl: string
}

export default function ExchangeRequestEmail({
  hostName = "Host",
  requesterName = "Guest",
  requesterHomeName = "Beautiful Home",
  hostHomeName = "Your Home",
  startDate = "Check-in Date",
  endDate = "Check-out Date",
  guests = 2,
  message = "No message provided",
  exchangeUrl = "https://swapbnb.vercel.app/exchanges",
}: ExchangeRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New swap request from {requesterName} for {hostHomeName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src="https://swapbnb.vercel.app/swapbnb-logo.png" width="120" height="40" alt="SwapBnB" style={logo} />
          </Section>

          <Heading style={h1}>New Swap Request! 🏠</Heading>

          <Text style={text}>Hi {hostName},</Text>

          <Text style={text}>
            <strong>{requesterName}</strong> would like to swap homes with you!
          </Text>

          <Section style={detailsSection}>
            <Text style={detailsTitle}>Swap Details:</Text>
            <Text style={details}>
              <strong>Their home:</strong> {requesterHomeName}
              <br />
              <strong>Your home:</strong> {hostHomeName}
              <br />
              <strong>Dates:</strong> {startDate} - {endDate}
              <br />
              <strong>Guests:</strong> {guests} {guests === 1 ? "person" : "people"}
            </Text>
          </Section>

          <Section style={messageSection}>
            <Text style={detailsTitle}>Their message:</Text>
            <Text style={messageText}>"{message}"</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={exchangeUrl}>
              View & Respond to Request
            </Button>
          </Section>

          <Text style={text}>
            You can accept, decline, or ask questions about this swap request. Don't keep them waiting too long! 😊
          </Text>

          <Text style={footer}>
            Happy swapping!
            <br />
            The SwapBnB Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const logoSection = {
  padding: "32px 40px",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
  textAlign: "center" as const,
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 40px",
}

const detailsSection = {
  backgroundColor: "#f8fafc",
  margin: "24px 40px",
  padding: "24px",
  borderRadius: "8px",
}

const detailsTitle = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
}

const details = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
}

const messageSection = {
  margin: "24px 40px",
  padding: "24px",
  borderLeft: "4px solid #0d9488",
  backgroundColor: "#f0fdfa",
}

const messageText = {
  color: "#555",
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: "0",
}

const buttonSection = {
  padding: "32px 40px",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0",
  padding: "0 40px",
}
