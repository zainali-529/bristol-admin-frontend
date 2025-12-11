import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function DocsAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Documents"}
      pricePKR={100000}
      priceGBP={250}
      featureKey="documents"
    />
  )
}

export default DocsAccessSheet
