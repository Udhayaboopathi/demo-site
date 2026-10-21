export const shop = {
  name: 'Crumb & Bloom',
  streetAddress: '28 Willow Street',
  addressLocality: 'Brooklyn',
  addressRegion: 'NY',
  postalCode: '11211',
  telephone: '+1-718-555-0148',
  phoneDisplay: '(718) 555-0148',
  phoneHref: 'tel:+17185550148',
}

export function bakeryEntity() {
  return {
    '@type': 'Bakery',
    name: shop.name,
    telephone: shop.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: shop.streetAddress,
      addressLocality: shop.addressLocality,
      addressRegion: shop.addressRegion,
      postalCode: shop.postalCode,
      addressCountry: 'US',
    },
  }
}
