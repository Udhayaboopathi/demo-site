import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal-page'
import { bakeryEntity, shop } from '@/lib/shop'

export const metadata: Metadata = {
  title: 'Terms of use | Crumb & Bloom',
  description: 'How Crumb & Bloom orders, pickup at 28 Willow Street in Brooklyn, custom cakes, prices, and allergens work.',
}

const updated = 'October 22, 2026'

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="House rules"
      title="Terms for orders"
      emphasis="and visits."
      lede="These terms explain how Crumb & Bloom handles the website, the order bag, pickup at 28 Willow Street, Brooklyn, NY 11211, and custom cake requests. Placing items in the bag does not charge a card and does not reserve the food until the shop confirms it."
      updated={updated}
      current="Terms of use"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms of use',
        description: 'Terms for Crumb & Bloom website orders, pickup, custom cakes, prices, and allergens.',
        dateModified: '2026-10-22',
        about: bakeryEntity(),
      }}
    >
      <LegalSection title="What do these terms cover?">
        <p>These terms cover the Crumb & Bloom website and orders for pickup at {shop.streetAddress}, {shop.addressLocality}, {shop.addressRegion} {shop.postalCode}. Crumb & Bloom is the bakery named on this site. Using the site or asking the shop to prepare food means you are using these house rules.</p>
      </LegalSection>
      <LegalSection title="How do online orders work?">
        <p>The <a href="/menu">menu</a> and the <a href="/checkout">order page</a> keep a bag of items in this browser. The bag stores each item’s name, price, and quantity on your device. It is not sent to Crumb & Bloom by the current order page.</p>
        <p>The total on the order page is the sum of the items in that bag, shown in Indian rupees. An item is reserved only when the shop at Willow Street confirms the pickup. The counter hours are Monday–Friday, 7am–4pm, and Saturday–Sunday, 8am–3pm.</p>
      </LegalSection>
      <LegalSection title="Can menu prices change?">
        <p>Prices on the menu are the prices shown when you add an item. Crumb & Bloom can change a menu price before an order is confirmed. The price that matters for pickup is the price the shop confirms with you.</p>
      </LegalSection>
      <LegalSection title="How does a custom cake get confirmed?">
        <p>A custom cake is a request until Crumb & Bloom agrees on the flavor, size, date, and price. The website does not confirm a cake by itself. Call <a href={shop.phoneHref}>{shop.phoneDisplay}</a> or ask at the counter to start that conversation.</p>
      </LegalSection>
      <LegalSection title="What if I have a food allergy?">
        <p>The menu includes wheat breads and nut pastries, including the Almond Croissant. The kitchen is not allergen-free, and this website does not publish a complete ingredient list. Ask the shop about a specific item before you order. Call <a href={shop.phoneHref}>{shop.phoneDisplay}</a> or speak to someone at the counter.</p>
      </LegalSection>
      <LegalSection title="How do I change or cancel an order?">
        <p>Call the shop as soon as you can. Same-day bread and pastry may already be in the oven, so Crumb & Bloom may not be able to change it. Reach the counter at <a href={shop.phoneHref}>{shop.phoneDisplay}</a> during the hours on the <a href="/visit-us">visit page</a>.</p>
      </LegalSection>
      <LegalSection title="Who owns the website content?">
        <p>The Crumb & Bloom name, menu text, and page copy on this site belong to the bakery. You may look at them for a personal order. Please do not copy the site and present it as another bakery.</p>
      </LegalSection>
      <LegalSection title="Who do I contact about an order?">
        <p>Start with the shop: {shop.name}, {shop.streetAddress}, {shop.addressLocality}, {shop.addressRegion} {shop.postalCode}, <a href={shop.phoneHref}>{shop.phoneDisplay}</a>. The <a href="/privacy">privacy notice</a> explains what the website stores on your device.</p>
      </LegalSection>
    </LegalPage>
  )
}
