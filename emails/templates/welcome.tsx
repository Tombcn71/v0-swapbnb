import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface WelcomeEmailProps {
  userName: string
  loginUrl?: string
}

export default function WelcomeEmail({
  userName = "there",
  loginUrl = "https://swapbnb.vercel.app/login",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to SwapBnB - Start your home swapping journey!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src="https://swapbnb.vercel.app/swapbnb-logo.png" width="120" height="40" alt="SwapBnB" style={logo} />
          </Section>

          <Heading style={h1}>Welcome to SwapBnB, {userName}! 🏠</Heading>

          <Text style={text}>
            We're excited to have you join our community of home swappers! SwapBnB makes it easy to exchange homes with
            other travelers around the world.
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={loginUrl}>
              Complete Your Profile
            </Button>
          </Section>

          <Text style={text}>
            <strong>Next steps:</strong>
          </Text>

          <Text style={text}>
            • Complete your profile verification
            <br />• Add your first property
            <br />• Browse available homes
            <br />• Start your first swap!
          </Text>

          <Text style={text}>
            Need help getting started? Check out our{" "}
            <Link href="https://swapbnb.vercel.app/help" style={link}>
              Help Center
            </Link>{" "}
            or reply to this email.
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

const link = {
  color: "#0d9488",
  textDecoration: "underline",
}

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0",
  padding: "0 40px",
}
