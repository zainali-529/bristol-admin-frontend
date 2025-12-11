import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function HeroAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Hero Section Templates"}
      pricePKR={150000}
      priceGBP={375}
      featureKey="hero"
    />
  )
}

export default HeroAccessSheet
