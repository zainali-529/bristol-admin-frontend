import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function ThemeAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Theme Customization"}
      pricePKR={200000}
      priceGBP={500}
      featureKey="theme"
    />
  )
}

export default ThemeAccessSheet
