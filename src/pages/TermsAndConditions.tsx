
import { Container } from "react-bootstrap";

export const TermsAndConditions = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Terms and Conditions</h1>

      <section className="mb-4">
        <h4>1. Introduction</h4>
        <p>
          Welcome to our eCommerce platform. By accessing or using our website,
          you agree to be bound by these Terms and Conditions.
        </p>
      </section>

      <section className="mb-4">
        <h4>2. User Responsibilities</h4>
        <p>
          Users are expected to provide accurate information during purchases and
          must not misuse any services provided on the platform.
        </p>
      </section>

      <section className="mb-4">
        <h4>3. Payments</h4>
        <p>
          All transactions are processed in a secure manner. We accept credit
          card payments and other methods mentioned at checkout.
        </p>
      </section>

      <section className="mb-4">
        <h4>4. Return & Refund Policy</h4>
        <p>
          Please read our refund policy carefully. Returns are accepted within 7
          days of delivery for eligible items.
        </p>
      </section>

      <section className="mb-4">
        <h4>5. Privacy Policy</h4>
        <p>
          Your privacy is important to us. Read our privacy policy to learn how
          we handle your data.
        </p>
      </section>

      <section className="mb-4">
        <h4>6. Changes to Terms</h4>
        <p>
          We reserve the right to modify these terms at any time. Please check
          this page periodically for updates.
        </p>
      </section>
    </Container>
  );
};