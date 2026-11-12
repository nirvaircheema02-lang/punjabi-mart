export type InfoPage = {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};
export const helpPages: Record<string, InfoPage> = {
  faqs: {
    title: "Frequently asked questions",
    intro: "Answers about ordering from PunjabiMarts.",
    sections: [
      {
        heading: "How do I place an order?",
        body: "Choose a product and any required size or colour, add it to your cart, enter a delivery address and review the final amount before placing your order.",
      },
      {
        heading: "Which payment options are available?",
        body: "Cash on delivery is available only when checkout is enabled for your delivery pincode. The final checkout step shows the available method.",
      },
      {
        heading: "Can I change my order?",
        body: "You can cancel an order before packing in My orders. For a later change, contact support with your order number.",
      },
      {
        heading: "How do I report a problem?",
        body: "Open My orders and report an issue with a delivered item. You can also contact support with your order number.",
      },
    ],
  },
  shipping: {
    title: "Shipping and delivery",
    intro: "Availability and fees are confirmed at checkout for your pincode.",
    sections: [
      {
        heading: "Where do you deliver?",
        body: "Delivery areas are set by PunjabiMarts. Enter your full delivery address at checkout to confirm whether your pincode is currently covered.",
      },
      {
        heading: "What does shipping cost?",
        body: "Your cart and checkout show the fee and any free delivery threshold before you place an order. Shop settings may change, so the checkout total is authoritative.",
      },
      {
        heading: "Where can I see tracking?",
        body: "Open My orders. When a parcel is shipped, the carrier and tracking reference appear with that shipment.",
      },
    ],
  },
  returns: {
    title: "Returns and replacements",
    intro:
      "Correctly supplied products do not offer a general change-of-mind return during the initial launch.",
    sections: [
      {
        heading: "When can I report a problem?",
        body: "Please report damaged, defective, wrong, expired or materially misdescribed products. PunjabiMarts will review the details and arrange an appropriate replacement or refund when required.",
      },
      {
        heading: "How do I start?",
        body: "For delivered orders, use Report an issue in My orders. For an undelivered or late order, contact support with your order number.",
      },
      {
        heading: "Do I need an unboxing video?",
        body: "No. Photos may help us understand damage or a wrong item, but a video is not required to submit a request.",
      },
      {
        heading: "Who pays to correct a mistake?",
        body: "Customers are not charged to correct a seller or delivery error. We will explain pickup or disposal instructions after reviewing the item.",
      },
    ],
  },
  tracking: {
    title: "Track your order",
    intro: "Your order and shipment status are available in your account.",
    sections: [
      {
        heading: "Where is the tracking number?",
        body: "Open My orders and choose the shipment. Courier and tracking details appear after the seller or PunjabiMarts marks it shipped.",
      },
      {
        heading: "No tracking yet?",
        body: "Orders begin as Placed, then move through Confirmed, Packed, Shipped and Delivered. Contact support if a shipment needs attention.",
      },
    ],
  },
  "size-guide": {
    title: "Size guide",
    intro:
      "Sizing depends on the product and maker. Check each product’s listed option before adding it to your cart.",
    sections: [
      {
        heading: "Footwear and clothing",
        body: "Use the exact size options shown on the product. If you are unsure, contact us with the product name and your measurements before ordering.",
      },
      {
        heading: "Wrong size delivered",
        body: "If the delivered size differs from what you ordered, report it in My orders. That is a fulfilment issue, not a discretionary size exchange.",
      },
    ],
  },
};
export const policyPages: Record<string, InfoPage> = {
  returns: helpPages.returns,
  shipping: helpPages.shipping,
  privacy: {
    title: "Privacy information",
    intro:
      "This is a local preview. PunjabiMarts stores the details needed to manage your account and orders.",
    sections: [
      {
        heading: "Details you provide",
        body: "The app stores your name, email, saved addresses, order details, support messages and optional newsletter subscription. Passwords are hashed; the app does not display them to staff.",
      },
      {
        heading: "How details are used",
        body: "Account and delivery details support ordering, fulfilment and customer service. We do not ask you to enter payment card details in this preview.",
      },
      {
        heading: "Your questions",
        body: "Contact PunjabiMarts to ask about account or order information. Formal legal identity, retention periods and external service providers must be added before a public launch.",
      },
    ],
  },
  terms: {
    title: "Store terms",
    intro:
      "This local preview is for testing the shopping journey. Demo products and test orders are marked as such.",
    sections: [
      {
        heading: "Orders",
        body: "A final amount, delivery eligibility and payment method are confirmed at checkout. An order is recorded only after you submit the final step.",
      },
      {
        heading: "Products and sellers",
        body: "Some items belong to PunjabiMarts; partner shops manage others. The product page identifies the seller and current option availability.",
      },
      {
        heading: "Support and statutory rights",
        body: "For an issue with an order, use My orders or contact support. These preview terms do not limit rights provided by applicable consumer law.",
      },
      {
        heading: "Before public launch",
        body: "Business identity, grievance contact and complete legal terms require review and publication before accepting real orders.",
      },
    ],
  },
};
