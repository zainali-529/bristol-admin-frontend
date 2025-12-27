import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function ThemeAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Theme Customization"}
      pricePKR={37800}
      priceGBP={100}
      featureKey="theme"
    />
  )
}

export default ThemeAccessSheet
