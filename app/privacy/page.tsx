import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal-page'
import { bakeryEntity, shop } from '@/lib/shop'

export const metadata: Metadata = {
  title: 'Privacy notice | Crumb & Bloom',
  description: 'What the Crumb & Bloom website stores: an order bag in your browser, and how to reach the Willow Street shop.',
}

const updated = 'October 22, 2026'

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your information"
      title="Privacy at"
      emphasis="the bakery."
      lede="The Crumb & Bloom website stores an order bag in your browser. The sign-in, sign-up, and account pages are previews and do not create an account or save what you type. Details you share by phone or at 28 Willow Street are used to prepare that order."
      updated={updated}
      current="Privacy notice"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy notice',
        description: 'Privacy notice for the Crumb & Bloom website and the Willow Street bakery.',
        dateModified: '2026-10-22',
        about: bakeryEntity(),
      }}
    >
      <LegalSection title="What personal information does this website collect?">
        <p>The order page does not upload the bag to Crumb & Bloom. The <a href="/login">sign-in</a> and <a href="/signup">sign-up</a> pages show name, email, and password fields for layout only. Submitting them stays in this browser and is not sent to Crumb & Bloom. The <a href="/accounts">account page</a> shows sample orders, not a saved profile. There is no third-party analytics tool on this site.</p>
      </LegalSection>
      <LegalSection title="Where is my order bag stored?">
        <p>The <a href="/checkout">order page</a> saves the bag in this browser’s local storage under the name crumb-bloom-order. Each saved line has the product name, the price, and the quantity. That information stays on the device you used. It remains until you empty the bag or clear this site’s data in the browser.</p>
      </LegalSection>
      <LegalSection title="What do you learn if I call or visit?">
        <p>If you call <a href={shop.phoneHref}>{shop.phoneDisplay}</a> or talk to the counter at {shop.streetAddress}, {shop.addressLocality}, {shop.addressRegion} {shop.postalCode}, the shop uses what you say to prepare the order. That can include a name for pickup, a cake date, a flavor, and an allergy note you choose to share. The shop does not sell that information.</p>
      </LegalSection>
      <LegalSection title="Does Crumb & Bloom sell personal information?">
        <p>No. Crumb & Bloom does not sell personal information, and this website does not pass an order bag to an advertising network.</p>
      </LegalSection>
      <LegalSection title="How can I remove the order bag?">
        <p>Empty the bag on the order page, or clear site data for this website in your browser. Clearing site data removes crumb-bloom-order from that browser. It does not cancel a pickup the shop has already confirmed. Call <a href={shop.phoneHref}>{shop.phoneDisplay}</a> to change a confirmed order.</p>
      </LegalSection>
      <LegalSection title="Does this notice cover children?">
        <p>The website is a bakery menu and shop page. The account pages are samples and do not create a real account or store personal details. A parent or guardian can order and can ask the counter about ingredients.</p>
      </LegalSection>
      <LegalSection title="When will this notice change?">
        <p>Crumb & Bloom will update this page if the website starts collecting something new, such as an account or a payment form. The date under the title is the latest review: {updated}. Questions about the website or an order can go to the counter, or through the <a href="/terms">terms of use</a>.</p>
      </LegalSection>
    </LegalPage>
  )
}
