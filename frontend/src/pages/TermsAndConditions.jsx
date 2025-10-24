import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Shield, Truck, CreditCard, RotateCcw, XCircle, CheckCircle } from "lucide-react";

const cssVariables = {
  primary: "#30486B",
  secondary: "#FFAA6B",
  neutral: "#30486B",
  fontHeading: "'Cormorant Garamond', serif",
  fontBody: "'Inter', sans-serif",
  fontAccent: "'Inter', sans-serif",
};

const CancellationsPolicy = () => {
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
      title: "Our Commitment",
      icon: Shield,
      content: `At Alto Moda, every product is sourced exclusively from our network of authorized international luxury fashion partners. Each piece is meticulously curated, inspected, and handled with the utmost care before reaching your doorstep.`,
      additionalContent: `We understand that on rare occasions, you may wish to return an item. Our return policy is designed to offer you a seamless, secure, and transparent experience — in keeping with the sophistication and integrity that define the Alto Moda standard of service.`
    },
    {
      id: "eligibility",
      title: "Eligibility for Returns",
      icon: CheckCircle,
      content: `Returns are applicable on all items except Final Sale items. All return requests must be initiated within 7 calendar days of receiving your order.`,
      list: [
        "Returns must be shipped back using the official Alto Moda return shipping label provided to you",
        "Each return request will be reviewed and approved at the discretion of our Quality Assurance Team"
      ]
    },
    {
      id: "conditions",
      title: "Return Conditions",
      icon: RotateCcw,
      list: [
        "The item must be new, unused, and unworn, with all original tags, security seals, and packaging intact",
        "Brand packaging (box, dust bag, authenticity cards, and accessories) must be intact",
        "The item must not show signs of wear, alteration, or damage",
        "Return shipment must reach our Gurgaon HQ within 7 calendar days of delivery",
        "All returns must use the Alto Moda return label. Inclusion of incorrect or additional items may result in rejection"
      ],
      warning: "Items received in non-compliance with the above will be classified as Rejected Returns and will not be eligible for a refund or store credit."
    },
    {
      id: "refund-options",
      title: "Refund Options",
      icon: CreditCard,
      content: "Once your returned item passes our quality inspection, you may choose from the following two refund methods:",
      subsections: [
        {
          title: "1. Gift Voucher / Store Credit (Complimentary Returns)",
          list: [
            "Refunds processed within 1 business day of approval",
            "Store Credit valid indefinitely across all products",
            "Return shipping is complimentary for this refund method"
          ]
        },
        {
          title: "2. Refund to Original Payment Method",
          list: [
            "Refunds processed within 5–7 business days after approval",
            "Standard return shipping charges apply"
          ]
        }
      ],
      note: "If a Gift Voucher or Store Credit was applied in your original purchase, your refund will be issued only in the form of Store Credit."
    },
    {
      id: "customer-returns",
      title: "Returns Arising from Customer Preference",
      icon: "preference",
      list: [
        "Change of mind",
        "Ordered incorrect size or colour",
        "Product not matching personal style or expectations"
      ],
      note: "Colour and fit perceptions may vary slightly depending on manufacturer specifications, lighting, or display settings."
    },
    {
      id: "company-returns",
      title: "Returns Arising from Alto Moda's Error",
      icon: "error",
      content: "In the rare instance where you receive an incorrect or defective item, you are entitled to a full refund to your original payment method or Store Credit. Alto Moda will bear all return shipping costs for such cases."
    },
    {
      id: "quality-review",
      title: "Quality Review and Rejected Returns",
      icon: "quality",
      content: "All returned items undergo quality inspection. Items failing Return Conditions are classified as Rejected Returns. Customers will be notified via email and must arrange re-delivery at their cost."
    },
    {
      id: "exchange",
      title: "Exchange Policy",
      icon: "exchange",
      content: "Alto Moda does not facilitate direct exchanges. Please return your item and select Store Credit as the refund method. You may then place a new order in your desired size or colour."
    },
    {
      id: "undelivered",
      title: "Refused or Undelivered Orders",
      icon: XCircle,
      content: "If delivery is refused or undelivered and returned to Alto Moda, it will be treated as a return arising from customer preference."
    },
    {
      id: "cancellation",
      title: "Cancellation Policy",
      icon: Clock,
      subsections: [
        {
          title: "1. Cancellation by the Customer",
          content: "Orders may be cancelled within 3 hours of placing them or before confirmation by Alto Moda — whichever occurs first. Contact us at support@altomoda.in or via your My Account page.",
          list: [
            "Orders cancelled before confirmation are refunded minus 3% transaction fees",
            "Once confirmed or processed, orders cannot be cancelled"
          ],
          note: "You may return the item after delivery per our Return Policy."
        },
        {
          title: "2. Cancellation by Alto Moda",
          list: [
            "Incorrect pricing or information errors",
            "Product unavailable or out of stock",
            "Force majeure or unforeseen circumstances"
          ],
          note: "In such cases, a full refund is issued within 5–7 business days."
        }
      ]
    },
    {
      id: "timelines",
      title: "Refund Timelines",
      icon: "timeline",
      list: [
        "Store Credit Refunds: Within 1 business day after approval",
        "Original Payment Refunds: Within 5–7 business days after approval"
      ]
    },
    {
      id: "process",
      title: "Return Process",
      icon: Truck,
      steps: [
        "Go to 'My Account' → 'My Orders' → Select your order",
        "Choose 'Request a Return' and select your refund method",
        "Our Concierge Team will arrange pick-up with an official return label",
        "You will receive regular updates via email"
      ],
      note: "Alternatively, contact our Client Care Team at support@altomoda.in for assistance."
    }
  ];

  const getIconComponent = (icon) => {
    const iconProps = { className: "w-5 h-5", style: { color: cssVariables.primary } };
    
    switch (icon) {
      case Shield: return <Shield {...iconProps} />;
      case CheckCircle: return <CheckCircle {...iconProps} />;
      case RotateCcw: return <RotateCcw {...iconProps} />;
      case CreditCard: return <CreditCard {...iconProps} />;
      case Clock: return <Clock {...iconProps} />;
      case Truck: return <Truck {...iconProps} />;
      case XCircle: return <XCircle {...iconProps} />;
      default: return <Shield {...iconProps} />;
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-25 to-gray-100 px-4 sm:px-8 py-12 lg:pt-[250px] sm:pt-[150px]"
      style={{ fontFamily: cssVariables.fontBody }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="flex justify-center space-x-2 mb-6">
              <div className="w-12 h-1 bg-gradient-to-r from-[#30486B] to-[#FFAA6B]"></div>
              <div className="w-4 h-1 bg-[#FFAA6B]"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-[#FFAA6B] to-[#30486B]"></div>
            </div>
            
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4"
              style={{
                color: cssVariables.primary,
                fontFamily: cssVariables.fontHeading,
              }}
            >
              Cancellations, Returns & Refunds
            </h1>
            
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-12 h-1 bg-gradient-to-r from-[#30486B] to-[#FFAA6B]"></div>
              <div className="w-4 h-1 bg-[#FFAA6B]"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-[#FFAA6B] to-[#30486B]"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">Policy Last Updated</p>
            <p className="text-lg font-semibold" style={{ color: cssVariables.primary }}>
              October 10, 2025, at 00:00 hours IST
            </p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6" style={{ color: cssVariables.primary }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: cssVariables.primary }}>7-Day Returns</h3>
            <p className="text-sm text-gray-600">Initiate returns within 7 days of delivery</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6" style={{ color: cssVariables.primary }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: cssVariables.primary }}>2 Refund Options</h3>
            <p className="text-sm text-gray-600">Store credit or original payment method</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6" style={{ color: cssVariables.primary }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: cssVariables.primary }}>Free Returns</h3>
            <p className="text-sm text-gray-600">Complimentary shipping for store credit refunds</p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policySections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-gray-100 transition-colors">
                    {getIconComponent(section.icon)}
                  </div>
                  <div className="flex-1">
                    <h2
                      className="text-xl font-semibold pr-4 text-left"
                      style={{ 
                        color: cssVariables.primary,
                        fontFamily: cssVariables.fontHeading
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                </div>
                {openSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0 mt-2" style={{ color: cssVariables.primary }} />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0 mt-2" style={{ color: cssVariables.primary }} />
                )}
              </button>
              
              <div
                className={`px-8 pb-8 transition-all duration-300 ${
                  openSections[section.id] ? 'block' : 'hidden'
                }`}
              >
                <div className="pl-14">
                  {section.content && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {section.content}
                    </p>
                  )}
                  
                  {section.additionalContent && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {section.additionalContent}
                    </p>
                  )}
                  
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
                  
                  {section.steps && (
                    <ol className="space-y-3 mb-4">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <div
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-1 mr-3 flex-shrink-0 text-sm font-semibold"
                            style={{ color: cssVariables.primary }}
                          >
                            {stepIndex + 1}
                          </div>
                          <span className="text-gray-700 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  
                  {section.subsections && section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="mb-6 last:mb-0">
                      <h4 className="font-semibold mb-3" style={{ color: cssVariables.primary }}>
                        {subsection.title}
                      </h4>
                      {subsection.content && (
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {subsection.content}
                        </p>
                      )}
                      {subsection.list && (
                        <ul className="space-y-2 mb-3">
                          {subsection.list.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start">
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0"
                                style={{ backgroundColor: cssVariables.secondary }}
                              ></div>
                              <span className="text-gray-700 leading-relaxed text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {subsection.note && (
                        <p className="text-sm text-gray-600 italic">{subsection.note}</p>
                      )}
                    </div>
                  ))}
                  
                  {section.warning && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <p className="text-red-800 text-sm font-medium">{section.warning}</p>
                    </div>
                  )}
                  
                  {section.note && !section.warning && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-blue-800 text-sm">{section.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-[#30486B] to-[#FFAA6B] rounded-2xl p-8 text-white">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-light mb-4" style={{ fontFamily: cssVariables.fontHeading }}>
              Our Promise to You
            </h2>
            <p className="mb-6 leading-relaxed">
              Every product featured on Alto Moda passes through rigorous authentication and quality checks. 
              We take pride in ensuring your luxury shopping experience is flawless from discovery to delivery.
            </p>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <p className="font-semibold mb-4">For return requests or refund inquiries:</p>
              <div className="space-y-2 text-sm">
                <p>📧 support@altomoda.in</p>
                <p>📞 +91-XXXXXXXXXX</p>
                <p>📍 NR Wardrobe Fuss Private Limited, Gurgaon, Haryana, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationsPolicy;