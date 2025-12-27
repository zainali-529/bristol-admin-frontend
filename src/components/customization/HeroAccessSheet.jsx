import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function HeroAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Hero Section Templates"}
      pricePKR={30240}
      priceGBP={80}
      featureKey="hero"
    />
  )
}

export default HeroAccessSheet
