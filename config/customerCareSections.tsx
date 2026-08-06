import type { ReactNode } from "react";

// Customer care accordion sections (label + body). Shipping has real policy
// copy; the rest are placeholders — swap in real text before launch.
export const supportSections: { label: string; content: ReactNode }[] = [
  {
    label: "Shipping",
    content: (
      <div className="space-y-4">
        <div>
          <p>
            orders purchased from ère are packaged with care in our signature
            packaging. our team may document the packaging and shipping
            process for quality control, order verification, fraud
            prevention, and customer support. ère is operated by ère world
            llc, a new york limited liability company.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Order Processing
          </p>
          <p>
            most orders are dispatched within three business days after
            purchase. orders may take longer to process during holidays,
            promotions, product launches, high-volume periods, or
            circumstances outside our reasonable control. we appreciate your
            patience during these periods. processing time is separate from
            carrier delivery time.
          </p>
          <p className="mt-2">
            if we cannot ship an order within the promised timeframe, we will
            provide the notice, cancellation option, or refund required by
            applicable law.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Shipping Within The United States
          </p>
          <p>
            we currently ship only to eligible addresses within the united
            states. domestic orders are generally shipped through united
            parcel service (&ldquo;UPS&rdquo;). we may use another carrier
            when reasonably necessary. we do not currently ship to
            international destinations.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Complimentary U.S. Shipping
          </p>
          <p>
            we offer complimentary ground shipping to eligible United States
            addresses on qualifying orders over $250. complimentary shipping:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>applies only when displayed on ere-world.com or at checkout;</li>
            <li>
              may be subject to a minimum purchase amount or location
              restrictions;
            </li>
            <li>may exclude certain products; and</li>
            <li>
              cannot be combined with another offer unless expressly stated.
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Tracking Your Order
          </p>
          <p>
            once your order ships, you will receive a shipment-confirmation
            email with available tracking information. please allow time for the carrier&apos;s system to update after
            receiving your tracking number.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Shipping Addresses
          </p>
          <p>
            customers are responsible for providing a complete and accurate
            shipping address. contact us immediately if your address needs to
            be corrected. we cannot guarantee that an address can be changed
            after an order has entered processing or shipped. except where
            otherwise required by law, ère is not responsible for delays,
            losses, or additional charges caused by incorrect or incomplete
            information provided by the customer.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Delivery Estimates
          </p>
          <p>
            delivery dates are estimates unless we expressly state that a date
            is guaranteed. delivery may be delayed by carrier disruptions,
            weather, holidays, address problems, security reviews, or other
            circumstances outside our reasonable control.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Missing Or Damaged Shipments
          </p>
          <p>please contact us promptly if your package:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>arrives damaged;</li>
            <li>is missing an item;</li>
            <li>contains an incorrect item;</li>
            <li>has not arrived within a reasonable time; or</li>
            <li>is marked delivered but cannot be located.</li>
          </ul>
          <p className="mt-2">
            include your order number and, when relevant, clear photographs
            of the product, packaging, and shipping label. keep all products
            and packaging until our review is complete. contact, customer
            care:{" "}
            <a
              href="mailto:customerservice@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              customerservice@ere-world.com
            </a>
          </p>
        </div>
      </div>
    ),
  },
  {
    label: "Return & Exchanges",
    content: (
      <div className="space-y-4">
        <div>
          <p>
            products sold by ère are carefully selected from small
            businesses, independent brands, and artisans from around the
            world. to reduce unnecessary waste and help eligible returned
            products find a new owner, we ask customers to handle all items
            carefully while they are in their possession.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Return Period
          </p>
          <p>
            eligible items may be returned for an exchange or store credit
            within 14 days after delivery. to request a return, contact:{" "}
            <a
              href="mailto:customerservice@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              customerservice@ere-world.com
            </a>
            . please do not send an item back before receiving return
            instructions.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Refund Policy
          </p>
          <p>
            we do not provide refunds for change-of-mind returns. approved
            returns may receive:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>an exchange for the same item;</li>
            <li>an exchange for another item of equal or similar value; or</li>
            <li>
              store credit equal to the approved value of the returned item.
            </li>
          </ul>
          <p className="mt-2">
            this no-refund policy does not apply when a refund is required by
            law, including certain canceled or unshipped orders. products
            that arrive damaged, defective, incorrect, or materially
            different from their description will be handled in accordance
            with applicable law.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Store Credit
          </p>
          <p>
            store credit must be used within 180 days after it is issued,
            where legally permitted. if an approved item is exchanged for an item of lesser value, the
            remaining balance will be issued as store credit. store credit:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>may be used only on ere-world.com;</li>
            <li>is not redeemable for cash except where required by law;</li>
            <li>cannot be transferred or resold; and</li>
            <li>may be subject to additional terms provided when it is issued.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            General Return Conditions
          </p>
          <p>to qualify for an exchange or store credit, an item must be:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>unused and unworn;</li>
            <li>unwashed and unaltered;</li>
            <li>
              free from stains, odors, hair, makeup, deodorant, and other
              signs of use;
            </li>
            <li>returned with all original tags attached;</li>
            <li>
              returned with all original packaging, accessories, and
              documentation; and
            </li>
            <li>accompanied by valid proof of purchase.</li>
          </ul>
          <p className="mt-2">
            original packaging may include a shoe box, dust bag, brand tag,
            authenticity card, protective wrapping, manual, cable, accessory,
            or other material supplied with the product. packaging must not
            be removed, written on, altered, or damaged. all returned items
            are inspected. approval of a return request does not guarantee
            approval after inspection.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Return Shipping
          </p>
          <p>
            customers are responsible for return shipping and any additional
            shipping costs associated with an exchange unless:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>the item arrived damaged, defective, or incorrect;</li>
            <li>we made an error with the order; or</li>
            <li>applicable law requires otherwise.</li>
          </ul>
          <p className="mt-2">
            return packages must be packed securely. we recommend using the
            original shipping materials and a trackable, insured shipping
            service. except where otherwise required by law, ère is not responsible
            for loss or damage that occurs during return shipping. items damaged during return shipping or returned in an
            unsaleable condition may be rejected.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Final-Sale Purchases
          </p>
          <p>
            the following purchases are final sale and are not eligible for a
            discretionary return, exchange, refund, or store credit:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>products purchased at an ère retail location;</li>
            <li>sale or discounted products identified as final sale;</li>
            <li>face masks and face coverings;</li>
            <li>self-care products;</li>
            <li>sexual-wellness toys; and</li>
            <li>dangerous goods listed below.</li>
          </ul>
          <p className="mt-2">
            final-sale restrictions do not eliminate remedies required by law
            for products that arrive damaged, defective, incorrect, or
            materially different from their description.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Face Masks & Face Coverings
          </p>
          <p>
            face masks and face coverings are final sale for hygiene and
            health reasons.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Self-Care Products
          </p>
          <p>
            all face, body, hair, skincare, cosmetic, and makeup products are
            final sale.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Sexual-Wellness Toys
          </p>
          <p>
            all sexual-wellness toys are final sale and cannot be returned or
            exchanged for health and safety reasons.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Intimate Apparel & Swimwear
          </p>
          <p>
            all intimate apparel swimwear are final sale and cannot be
            returned or exchanged for health and safety reasons.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Dangerous Goods
          </p>
          <p>
            the following products are final sale because of safety,
            handling, or shipping restrictions:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>candles;</li>
            <li>fragrances and perfumes;</li>
            <li>oils;</li>
            <li>aerosol or pressurized canned products; and</li>
            <li>electronics containing batteries.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Damaged, Defective, Or Incorrect Products
          </p>
          <p>
            contact us promptly if an item arrives damaged, defective,
            incorrect, or incomplete. your email should include:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>your order number;</li>
            <li>a description of the issue;</li>
            <li>clear photographs or video; and</li>
            <li>photographs of the shipping package and label when relevant.</li>
          </ul>
          <p className="mt-2">
            do not discard the product or packaging before our review is
            complete. depending on the circumstances and applicable law, we may provide
            a repair, replacement, exchange, store credit, or refund.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Rejected Returns
          </p>
          <p>
            ère reserves the right to reject any return that does not comply
            with this policy. a return may be rejected if the item:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>shows signs of wear, use, washing, or alteration;</li>
            <li>is stained, damaged, incomplete, or unsaleable;</li>
            <li>
              is missing tags, seals, hygienic protection, accessories, or
              packaging;
            </li>
            <li>is returned outside the 14-day return period;</li>
            <li>is identified as final sale; or</li>
            <li>was not purchased directly from ère.</li>
          </ul>
          <p className="mt-2">
            rejected items may be sent back to the original shipping address
            without an exchange or store credit being processed. where
            legally permitted, the customer may be responsible for the cost
            of sending a rejected item back. please contact customer care
            before returning an item if you have questions about
            eligibility.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Frequent Or Abusive Returns
          </p>
          <p>
            we monitor return activity to protect our customers and business
            from fraud and misuse. we may reject discretionary returns,
            cancel pending or future orders, restrict future purchases, or
            suspend an account when we reasonably believe this policy is
            being abused. examples may include:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>excessive or repeated returns;</li>
            <li>returning used, altered, or incomplete products;</li>
            <li>returning a different product;</li>
            <li>false claims of damage or non-delivery;</li>
            <li>chargeback abuse; or</li>
            <li>using multiple accounts to avoid restrictions.</li>
          </ul>
          <p className="mt-2">
            we will not restrict a return, refund, warranty, or consumer
            right protected by law.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Purchases From Other Sellers
          </p>
          <p>
            this policy applies only to products purchased directly from
            ère. products purchased from another retailer, marketplace, or
            third-party seller must be returned through the original seller
            and are subject to that seller&apos;s policies.
          </p>
        </div>
      </div>
    ),
  },
  {
    label: "Term of Service",
    content: (
      <div className="space-y-4">
        <div>
          <p>effective date: [month day, year]</p>
          <p className="mt-2">
            this website is owned and operated by ère world llc, a new york
            limited liability company doing business as ère. throughout these Terms, &ldquo;ère,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; and &ldquo;our&rdquo; refer to ère world llc and the ère brand. by visiting ere-world.com, creating an account, placing an order,
            or otherwise using our website or services, you agree to these
            terms of Service and our shipping, returns & exchanges, and
            privacy policies. please do not use our website or services if
            you do not agree to these policies.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Eligibility
          </p>
          <p>
            you must be at least 18 years old, or the legal age of majority
            in your state, to place an order. by placing an order, you confirm that:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>the information you provide is complete and accurate;</li>
            <li>you are authorized to use the selected payment method; and</li>
            <li>you have the legal authority to enter into the transaction.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Product Information
          </p>
          <p>
            we make reasonable efforts to display product photographs,
            descriptions, materials, measurements, colors, and other
            information accurately. actual colors and appearances may vary
            because of screen settings, lighting, photography, manufacturing
            differences, or natural variations in materials. we may correct
            errors, update product information, limit quantities, or
            discontinue a product at any time.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Orders
          </p>
          <p>all orders are subject to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>product availability;</li>
            <li>payment approval;</li>
            <li>address verification;</li>
            <li>fraud and security screening; and</li>
            <li>acceptance by ère.</li>
          </ul>
          <p className="mt-2">
            an order-confirmation email confirms that we received your
            order. it does not guarantee acceptance or shipment. we may
            refuse, limit, or cancel an order because of:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>product unavailability;</li>
            <li>pricing, inventory, or description errors;</li>
            <li>payment or address problems;</li>
            <li>suspected fraud or unauthorized activity;</li>
            <li>unauthorized commercial resale;</li>
            <li>violation of our policies; or</li>
            <li>legal, safety, or security concerns.</li>
          </ul>
          <p className="mt-2">
            if we cancel an order after collecting payment, we will return
            the applicable amount to the original payment method.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Pricing And Payment
          </p>
          <p>
            prices are shown in the currency displayed on the website or at
            checkout. orders delivered within the united states are
            generally charged in U.S. dollars. applicable sales tax and shipping charges will be displayed
            before the order is completed. prices, products, and promotions
            may change without notice. promotional offers may have separate
            conditions, exclusions, quantity limits, and expiration dates. we
            accept the payment methods shown at checkout. payments may be
            processed by third-party payment providers. by submitting
            payment information, you confirm that you are authorized to use
            that payment method and authorize us and our payment providers
            to charge the total displayed at checkout. we are not
            responsible for fees charged by a customer&apos;s bank, card
            issuer, or payment provider.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Shipping, Returns, And Exchanges
          </p>
          <p>
            shipping, returns, exchanges, store credits, final-sale products,
            and delivery issues are governed by our shipping policy and
            returns & exchanges policy. those policies are incorporated into and form part of these
            terms of service.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Customer Accounts
          </p>
          <p>you are responsible for:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>providing accurate account information;</li>
            <li>protecting your password and login details;</li>
            <li>restricting access to your account and devices; and</li>
            <li>activity conducted through your account.</li>
          </ul>
          <p className="mt-2">
            contact us promptly if you suspect unauthorized access. we may
            suspend or close an account used for fraud, abusive returns,
            unauthorized resale, harmful conduct, or repeated policy
            violations.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Product Care And Use
          </p>
          <p>
            customers must follow all product labels, warnings, care
            instructions, manuals, and recommended uses. to the fullest
            extent permitted by law, ère is not responsible for damage
            caused by:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>misuse;</li>
            <li>improper care, cleaning, washing, or storage;</li>
            <li>accidents;</li>
            <li>unauthorized repairs or alterations;</li>
            <li>failure to follow instructions;</li>
            <li>normal wear and tear; or</li>
            <li>use of a product for an unintended purpose.</li>
          </ul>
          <p className="mt-2">
            this section does not limit rights relating to defective,
            damaged, or incorrectly supplied products.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Website Content And Intellectual Property
          </p>
          <p>
            the ère name, logos, branding, text, photographs, graphics,
            videos, designs, product content, and website layout belong to
            or are licensed to ère world llc. you may use the website only for lawful, personal shopping
            purposes. without prior written permission from ère world LLC,
            you may not:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>copy or reproduce our content;</li>
            <li>modify, publish, sell, or distribute our content;</li>
            <li>use our branding or photographs commercially;</li>
            <li>scrape or systematically collect website data;</li>
            <li>use automated purchasing technology; or</li>
            <li>remove copyright, trademark, or ownership notices.</li>
          </ul>
          <p className="mt-2">
            no ownership right is transferred to you through your use of the
            website.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Reviews And Customer Content
          </p>
          <p>
            if you submit a review, photograph, comment, or other content,
            you confirm that:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>you own the content or have permission to submit it;</li>
            <li>it reflects your honest experience;</li>
            <li>
              it is not false, misleading, unlawful, threatening, or
              defamatory;
            </li>
            <li>it does not violate another person&apos;s rights; and</li>
            <li>
              you have disclosed any payment, free product, or other
              incentive connected to it.
            </li>
          </ul>
          <p className="mt-2">
            you retain ownership of your content. by submitting it, you give
            ère world LLC a non-exclusive, worldwide, royalty-free permission
            to use, reproduce, edit, display, and share it for operating and
            promoting ère. we may remove content that violates these Terms.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Prohibited Uses
          </p>
          <p>you may not use our website or services to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>commit fraud or another unlawful act;</li>
            <li>provide false identity, payment, or shipping information;</li>
            <li>access another person&apos;s account;</li>
            <li>interfere with website operation or security;</li>
            <li>introduce viruses or harmful code;</li>
            <li>
              scrape or automatically collect website data without
              permission;
            </li>
            <li>use unauthorized automated purchasing tools;</li>
            <li>infringe intellectual-property, privacy, or other rights;</li>
            <li>harass our employees, contractors, or customers;</li>
            <li>abuse promotional or return programs; or</li>
            <li>purchase products for unauthorized commercial resale.</li>
          </ul>
          <p className="mt-2">
            we may cancel orders, restrict access, close accounts, or take
            appropriate legal action in response to prohibited activity.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Third-Party Services
          </p>
          <p>
            our website may use or link to services operated by third
            parties, including payment processors, shipping carriers,
            social-media platforms, analytics providers, and advertising
            services. we do not control and are not responsible for
            third-party websites, services, content, availability, security,
            or privacy practices. use of a third-party service may be
            governed by that provider&apos;s own terms and policies.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Website Availability
          </p>
          <p>
            we do not guarantee that our website will always be
            uninterrupted, error-free, or completely secure. we may modify,
            restrict, suspend, or discontinue part of the website when
            reasonably necessary. to the extent permitted by law, we are not
            responsible for interruptions caused by maintenance, internet
            failures, third-party providers, cyberattacks, natural
            disasters, or events outside our reasonable control.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Disclaimer And Limitation Of Liability
          </p>
          <p>
            to the fullest extent permitted by law, our website and its
            content are provided on an &ldquo;as available&rdquo; basis. we
            do not make guarantees concerning uninterrupted website
            operation or the complete accuracy of all website content. to
            the fullest extent permitted by law, ère world llc and its
            members, owners, employees, contractors, affiliates, and service
            providers will not be liable for indirect, incidental, special,
            punitive, or consequential damages arising from the use of our
            website, services, or products. for a claim arising from a
            product purchase, our total liability will not exceed the amount
            paid for the product involved, except where a greater remedy is
            required by law. nothing in these terms limits liability or
            consumer rights that cannot legally be limited, including
            certain claims involving defective products, personal injury,
            fraud, or intentional misconduct.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Governing Law
          </p>
          <p>
            these terms are governed by the laws of the state of new york
            and applicable federal law, without regard to conflict-of-law
            principles. unless applicable law permits or requires otherwise, legal
            proceedings relating to these terms must be brought in a court
            with jurisdiction in new york county, new york. customers retain
            mandatory consumer protections provided by the state in which
            they reside.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Changes To These Terms
          </p>
          <p>
            we may update these Terms when our business, services,
            technology, or legal obligations change. updated terms will be
            posted with a revised effective date and will apply going
            forward.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Contact
          </p>
          <p>
            ère world llc
            <br />
            new york, new york
            <br />
            united states
            <br />
            email:{" "}
            <a
              href="mailto:contact@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              contact@ere-world.com
            </a>
            <br />
            website: ere-world.com
          </p>
        </div>
      </div>
    ),
  },
  {
    label: "Privacy Policy",
    content: (
      <div className="space-y-4">
        <div>
          <p>effective date: [month day, year]</p>
          <p className="mt-2">
            this privacy policy explains how ère world llc, doing business as
            ère, collects, uses, discloses, and protects personal information
            when you visit ere-world.com, place an order, create an account,
            contact us, or otherwise use our services.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Information We Collect
          </p>
          <p>we may collect information you provide directly, including:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>your name;</li>
            <li>email address;</li>
            <li>telephone number;</li>
            <li>billing and shipping addresses;</li>
            <li>account details;</li>
            <li>order and return history;</li>
            <li>customer-service messages;</li>
            <li>reviews and other content;</li>
            <li>marketing preferences; and</li>
            <li>payment-related information.</li>
          </ul>
          <p className="mt-2">
            payments may be handled by third-party payment providers. we may
            not receive or store your complete payment-card number. when you
            use our website, we and our service providers may automatically
            collect information such as:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>IP address;</li>
            <li>browser and device details;</li>
            <li>operating system;</li>
            <li>approximate location;</li>
            <li>referring website;</li>
            <li>pages and products viewed;</li>
            <li>shopping-cart and checkout activity;</li>
            <li>dates and times of visits; and</li>
            <li>other website interactions.</li>
          </ul>
          <p className="mt-2">
            this information may be collected through cookies, pixels, log
            files, and similar technologies.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            How We Use Information
          </p>
          <p>we may use personal information to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>process orders, payments, deliveries, returns, and exchanges;</li>
            <li>create and maintain customer accounts;</li>
            <li>provide customer service;</li>
            <li>send order and shipping updates;</li>
            <li>detect fraud, abuse, and security threats;</li>
            <li>personalize and improve the website;</li>
            <li>analyze business and website performance;</li>
            <li>send marketing communications when permitted;</li>
            <li>maintain tax, accounting, and business records;</li>
            <li>enforce our policies;</li>
            <li>comply with legal obligations; and</li>
            <li>protect our customers, business, and legal rights.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            How We Disclose Information
          </p>
          <p>
            we may disclose personal information to companies that help us
            operate our business, including:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>website and e-commerce providers;</li>
            <li>payment processors;</li>
            <li>warehouses and fulfillment providers;</li>
            <li>shipping carriers;</li>
            <li>customer-support providers;</li>
            <li>analytics and marketing providers;</li>
            <li>information-security and fraud-prevention services;</li>
            <li>accountants, attorneys, and professional advisers; and</li>
            <li>government authorities when disclosure is legally required.</li>
          </ul>
          <p className="mt-2">
            we may also disclose or transfer information as part of a
            merger, financing, reorganization, acquisition, sale, or
            transfer of all or part of our business.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Cookies And Similar Technologies
          </p>
          <p>we may use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>operate the website;</li>
            <li>maintain shopping carts and customer sessions;</li>
            <li>remember preferences;</li>
            <li>protect accounts;</li>
            <li>prevent fraud;</li>
            <li>measure website performance;</li>
            <li>understand customer activity; and</li>
            <li>support marketing and advertising.</li>
          </ul>
          <p className="mt-2">
            you may manage cookies through your browser or through any
            cookie-preference tool offered on our website. disabling certain
            cookies may prevent parts of the website from working properly.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Analytics And Advertising
          </p>
          <p>
            we may use analytics services to understand website traffic,
            performance, and customer interactions. we may also use
            advertising services that collect information about website
            activity to measure advertising or show more relevant
            advertisements. under some state privacy laws, certain
            advertising activities may be considered a sale or sharing of
            personal information or the use of information for targeted
            advertising. where legally required, eligible customers may opt
            out through:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>our cookie-preference tool;</li>
            <li>a &ldquo;your privacy choices&rdquo; link;</li>
            <li>a legally recognized browser-based opt-out signal; or</li>
            <li>
              a request sent to{" "}
              <a
                href="mailto:customerservice@ere-world.com"
                className="underline hover:text-foreground transition-colors"
              >
                customerservice@ere-world.com
              </a>
              .
            </li>
          </ul>
          <p className="mt-2">
            this section must be updated to accurately reflect the
            analytics, advertising, and tracking technologies actually used
            on ere-world.com.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Marketing Communications
          </p>
          <p>
            you may unsubscribe from promotional emails by selecting the
            unsubscribe link in the message or contacting us at{" "}
            <a
              href="mailto:customerservice@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              customerservice@ere-world.com
            </a>
            . even after unsubscribing, you may continue to receive
            necessary communications concerning orders, payments,
            deliveries, returns, account security, or customer-service
            requests.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Privacy Rights
          </p>
          <p>
            depending on your state of residence and whether the relevant
            law applies to us, you may have the right to request:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>access to personal information;</li>
            <li>correction of inaccurate information;</li>
            <li>deletion of personal information;</li>
            <li>a portable copy of certain information;</li>
            <li>
              information about how personal information is collected and
              disclosed;
            </li>
            <li>
              an opt-out from certain sales, sharing, or targeted
              advertising; or
            </li>
            <li>an appeal of a decision concerning a privacy request.</li>
          </ul>
          <p className="mt-2">
            these rights may be subject to legal exceptions. to submit a
            request, email:{" "}
            <a
              href="mailto:customerservice@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              customerservice@ere-world.com
            </a>{" "}
            — use the subject line &ldquo;Privacy Request&rdquo; and explain
            the request you wish to make. we may ask for information
            reasonably necessary to verify your identity. we will not
            unlawfully discriminate against you for exercising an applicable
            privacy right.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Data Retention
          </p>
          <p>
            we retain personal information for as long as reasonably
            necessary to:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>complete transactions;</li>
            <li>maintain accounts;</li>
            <li>provide customer support;</li>
            <li>process returns and exchanges;</li>
            <li>prevent fraud;</li>
            <li>resolve disputes;</li>
            <li>maintain required business, accounting, and tax records;</li>
            <li>enforce our agreements; and</li>
            <li>meet legal obligations.</li>
          </ul>
          <p className="mt-2">
            when information is no longer reasonably needed, we may delete,
            de-identify, or securely dispose of it.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Information Security
          </p>
          <p>
            we use reasonable administrative, technical, and physical
            safeguards designed to protect personal information. however, no
            website, transmission method, or storage system can be
            guaranteed to be completely secure. customers are responsible
            for protecting their passwords and account credentials.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Children&apos;s Privacy
          </p>
          <p>
            our website is not intended for children under 13, and we do not
            knowingly collect personal information online from children
            under 13. a parent or guardian who believes that a child has
            provided us with personal information may contact{" "}
            <a
              href="mailto:customerservice@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              customerservice@ere-world.com
            </a>
            .
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Third-Party Links
          </p>
          <p>
            our website may contain links to websites or services operated
            by other companies. we do not control and are not responsible
            for their content, security, terms, or privacy practices. please
            review their policies before providing personal information.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Changes To This Privacy Policy
          </p>
          <p>
            we may update this Privacy Policy when our practices,
            technology, services, or legal obligations change. the updated
            policy will be posted with a revised effective date. we will
            provide additional notice when required by law.
          </p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Contact
          </p>
          <p>
            questions about this Privacy Policy or our privacy practices may
            be sent to:
          </p>
          <p className="mt-2">
            ère world llc
            <br />
            new york, new york
            <br />
            united states
            <br />
            email:{" "}
            <a
              href="mailto:contact@ere-world.com"
              className="underline hover:text-foreground transition-colors"
            >
              contact@ere-world.com
            </a>
            <br />
            website: ere-world.com
          </p>
        </div>
      </div>
    ),
  },
  {
    label: "FAQ",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-semibold uppercase tracking-wide text-foreground mb-1">
            Preorder
          </p>
          <p>
            our most requested pieces rarely stay in stock. preorder gives
            you early access to sold-out styles, offered in limited runs and
            available only while allocations last. if it&apos;s available to
            preorder, it&apos;s worth acting quickly. secure yours before
            it&apos;s gone.
          </p>
          <p className="mt-2">
            our pieces are produced in intentionally limited quantities to
            reduce excess and avoid overproduction - supporting a more
            thoughtful, sustainable approach to fashion. preordering allows
            us to better align demand with production, meaning less waste
            and a lighter environmental impact.
          </p>
          <p className="mt-2">
            our preorder items secure goods that have not landed in our
            warehouse as yet, whereby limited numbers have been made
            available for purchase. you will be charged when the order is
            placed in the same way you would a normal purchase, and your
            garment will be priority dispatched once stock arrives.
          </p>
          <p className="mt-2">
            we do our best to estimate arrival times, but note that this can
            vary at times due to circumstances out of our control. for all
            orders containing preorder items, the full order will be sent
            when the preorder item arrives.
          </p>
          <p className="mt-2 italic">
            if your order includes both in-stock and preorder items, the
            full order will ship once the preorder item becomes available.
          </p>
        </div>
      </div>
    ),
  },
];
