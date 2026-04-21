import React from "react";
import { Container } from "react-bootstrap";

const PrivacyPolicy = () => {
  return (
    <Container className="my-5">
      <h2 className="fw-bold mb-4">Privacy Policy</h2>

      <section className="mb-4">
        <h5 className="fw-bold">1. Introduction</h5>
        <p>
          This Privacy Policy outlines how we collect, use, and protect your
          personal information when you visit or make a purchase from our website.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">2. Information We Collect</h5>
        <p>
          We may collect information such as your name, email, address, phone
          number, and payment details when you use our services.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">3. How We Use Your Information</h5>
        <p>
          Your information is used to process orders, communicate updates,
          personalize your experience, and improve our services.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">4. Sharing Your Information</h5>
        <p>
          We do not sell your personal data. We may share it with trusted
          partners only to fulfill your orders or comply with legal obligations.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">5. Cookies</h5>
        <p>
          Our site uses cookies to enhance your browsing experience. You can
          manage cookie preferences through your browser settings.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">6. Your Rights</h5>
        <p>
          You have the right to access, correct, or delete your personal data.
          Please contact us to exercise any of these rights.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold">7. Policy Updates</h5>
        <p>
          We may update this Privacy Policy from time to time. Please review this
          page periodically for the latest version.
        </p>
      </section>
    </Container>
  );
};

export default PrivacyPolicy;
