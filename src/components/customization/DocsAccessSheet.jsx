import FeatureAccessSheet from '@/components/customization/FeatureAccessSheet'

function DocsAccessSheet({ open, onOpenChange }) {
  return (
    <FeatureAccessSheet
      open={open}
      onOpenChange={onOpenChange}
      product={"Documents"}
      pricePKR={49140}
      priceGBP={130}
      featureKey="documents"
    />
  )
}

export default DocsAccessSheet
