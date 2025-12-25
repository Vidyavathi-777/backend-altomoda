import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define CSS variables
const cssVariables = {
  primary: "#30486B",
  secondary: "#FFAA6B",
  neutral: "#30486B",
  fontHeading: "'Cormorant Garamond', serif",
  fontBody: "'Inter', sans-serif",
  fontAccent: "'Inter', sans-serif",
};

const PrivacyPolicy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const policySections = [
    {
      id: "commitment",
      title: "1. Commitment to Data Protection",
      content: `Alto Moda assures every client that their personal and transactional information is collected, processed, and stored with the highest standards of confidentiality and integrity. We employ industry-grade encryption (SSL) technology to secure all payment transactions and communication between your device and our servers. All data handling complies with applicable laws of India, including the Information Technology Act, 2000 and relevant data protection regulations.`
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      content: `When you interact with Alto Moda — whether by exploring our collections, creating an account, or making a purchase — we collect information to enhance your experience and ensure seamless service. This information includes:`,
      list: [
        "Personal Information: Name, email, contact number, shipping address, billing info, and account credentials.",
        "Payment Information: Banking or card details are not stored. Transactions are securely handled by PCI DSS Level 1 payment gateways.",
        "Device & Technical Information: IP, browser type, time zone, OS, pages viewed, cookies, and session logs.",
        "Transactional Information: Order history, product preferences, purchase value, and delivery details."
      ]
    },
    {
      id: "information-use",
      title: "3. Use of Collected Information",
      content: `We collect and use your information solely to offer a personalized, seamless, and secure luxury shopping experience. Specifically, we may use your data to:`,
      list: [
        "Process and fulfill your orders efficiently",
        "Provide delivery updates and after-sale assistance",
        "Send you exclusive offers and recommendations (opt-in only)",
        "Improve website performance and prevent fraudulent activity"
      ],
      additionalContent: `We respect your privacy and will never sell, rent, or trade your personal information with any third party.`
    },
    {
      id: "data-sharing",
      title: "4. Data Sharing & Third Parties",
      content: `Alto Moda collaborates only with trusted partners who adhere to strict data protection standards. We may share limited information with:`,
      list: [
        "Payment processors for transaction completion",
        "Logistics partners for order delivery",
        "Customer service platforms for support",
        "Analytics providers for website optimization"
      ],
      additionalContent: `All third-party partners are contractually bound to maintain confidentiality and may not use your data for any purpose beyond providing services to Alto Moda.`
    },
    {
      id: "cookies",
      title: "5. Cookies & Tracking Technologies",
      content: `Our website uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. Cookies help us:`,
      list: [
        "Remember your preferences and shopping cart",
        "Understand how you interact with our website",
        "Provide relevant product recommendations",
        "Improve website performance and security"
      ],
      additionalContent: `You can control cookie settings through your browser preferences. However, disabling cookies may limit certain website functionalities.`
    },
    {
      id: "data-security",
      title: "6. Data Security Measures",
      content: `We implement comprehensive security measures to protect your information:`,
      list: [
        "SSL encryption for all data transmissions",
        "Regular security audits and vulnerability assessments",
        "Secure data storage with access controls",
        "Employee training on data protection protocols"
      ],
      additionalContent: `While we implement robust security measures, no method of transmission over the Internet is 100% secure. We continuously update our security practices to address emerging threats.`
    },
    {
      id: "your-rights",
      title: "7. Your Rights & Choices",
      content: `You have the right to:`,
      list: [
        "Access and review your personal information",
        "Correct inaccurate or incomplete data",
        "Request deletion of your personal data",
        "Opt-out of marketing communications",
        "Withdraw consent for data processing"
      ],
      additionalContent: `To exercise these rights, please contact our Data Protection Officer at privacy@altomoda.in. We will respond to your request within 30 days.`
    },
    {
      id: "data-retention",
      title: "8. Data Retention Period",
      content: `We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Typically, we maintain:`,
      list: [
        "Account information: Until account deletion request",
        "Transaction records: 7 years for legal compliance",
        "Marketing preferences: Until opt-out request",
        "Customer service records: 3 years for quality assurance"
      ]
    },
    {
      id: "international-transfers",
      title: "9. International Data Transfers",
      content: `As a global luxury brand, Alto Moda may transfer and process your personal information in countries outside your residence. We ensure all international data transfers comply with applicable data protection laws through:`,
      list: [
        "Adequacy decisions by relevant authorities",
        "Standard contractual clauses",
        "Binding corporate rules",
        "Other approved transfer mechanisms"
      ],
      additionalContent: `By using our services, you consent to the transfer of your information to countries that may have different data protection rules than your country of residence.`
    },
    {
      id: "policy-updates",
      title: "10. Policy Updates & Contact",
      content: `We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements. The updated version will be indicated by the \"Last Revised\" date at the bottom of this page.`,
      additionalContent: `For any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:\n\nEmail: privacy@altomoda.in\nPhone: +91-XXXXXXXXXX\nAddress: Alto Moda Privacy Team, [Your Office Address]`
    }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-8 py-12"
      style={{
        color: cssVariables.neutral,
        fontFamily: cssVariables.fontBody,
      }}
    >
      <div className="max-w-4xl mx-auto lg:pt-[180px] pt-[100px] ">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-1 bg-gradient-to-r from-[#30486B] to-[#FFAA6B] mx-auto mb-4"></div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight"
              style={{
                color: cssVariables.primary,
                fontFamily: cssVariables.fontHeading,
              }}
            >
              Privacy Policy
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[#FFAA6B] to-[#30486B] mx-auto mt-4"></div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-600 italic max-w-2xl mx-auto leading-relaxed">
            Your Privacy, Our Promise — Protecting your personal information with the highest standards of luxury service
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              At <span className="font-semibold" style={{ color: cssVariables.primary }}>Alto Moda</span>, we understand that privacy is an integral part of luxury. Your trust is our most valued asset — and protecting your personal information is our highest priority.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              This Privacy Policy explains how Company Name ("Alto Moda", "we", "our", "us") collects, uses, discloses, and safeguards your information when you visit or make a purchase from <strong className="font-semibold">www.altomoda.in</strong> ("Website").
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <p className="text-blue-800 font-medium mb-2">Important Notice</p>
              <p className="text-blue-700 text-sm">
                By accessing or using our website, you consent to the terms outlined in this Privacy Policy. Please note that this policy may be updated periodically to reflect changes in our practices or for regulatory reasons. We encourage you to review it regularly to stay informed.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {policySections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                style={{ fontFamily: cssVariables.fontHeading }}
              >
                <h2
                  className="text-xl font-semibold pr-4"
                  style={{ color: cssVariables.primary }}
                >
                  {section.title}
                </h2>
                {openSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: cssVariables.primary }} />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: cssVariables.primary }} />
                )}
              </button>
              
              <div
                className={`px-6 pb-6 transition-all duration-300 ${
                  openSections[section.id] ? 'block' : 'hidden'
                }`}
              >
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  
                  {section.list && (
                    <ul className="space-y-3 mb-4">
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div
                            className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                            style={{ backgroundColor: cssVariables.secondary }}
                          ></div>
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.additionalContent && (
                    <p className="text-gray-700 leading-relaxed">
                      {section.additionalContent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-[#30486B] to-[#FFAA6B] p-0.5 rounded-2xl inline-block">
            <div className="bg-white rounded-2xl px-8 py-6">
              <p className="text-sm text-gray-600 mb-2">Last Updated</p>
              <p className="font-semibold" style={{ color: cssVariables.primary }}>
                December 2024
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Alto Moda — Redefining Luxury, Respecting Privacy
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .prose ul {
          list-style: none;
          padding-left: 0;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;