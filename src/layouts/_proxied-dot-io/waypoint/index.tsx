import React from 'react'
import HashiHead from '@hashicorp/react-head'
import HashiStackMenu from '@hashicorp/react-hashi-stack-menu'
import AlertBanner from '@hashicorp/react-alert-banner'
import Min100Layout from '@hashicorp/react-min-100-layout'
import useProductMeta, {
	ProductMetaProvider,
	Products,
} from '@hashicorp/platform-product-meta'
import usePageviewAnalytics from '@hashicorp/platform-analytics'
import createConsentManager from '@hashicorp/react-consent-manager/loader'
import localConsentManagerServices from 'lib/consent-manager-services/io-sites'
// product-specific layout elements
import Footer from 'components/_proxied-dot-io/waypoint/footer'
import ProductSubnav from 'components/_proxied-dot-io/waypoint/subnav'
import productData from 'data/waypoint.json'
import { CardProps } from 'components/_proxied-dot-io/waypoint/card'

const { ConsentManager, openConsentManager } = createConsentManager({
	segmentWriteKey: productData.analyticsConfig.segmentWriteKey,
	preset: 'oss',
	otherServices: [...localConsentManagerServices],
})

function WaypointIoLayout({
	footer,
	children,
}: {
	footer: {
		heading: string
		description: string
		cards: [CardProps, CardProps]
		ctaLinks: Array<{
			text: string
			url: string
		}>
		navLinks: Array<{
			text: string
			url: string
		}>
	}
	/** Page contents to render in the layout */
	children: React.ReactNode
}): React.ReactElement {
	usePageviewAnalytics({
		siteId: process.env.NEXT_PUBLIC_FATHOM_SITE_ID_WAYPOINT,
		includedDomains: productData.analyticsConfig.includedDomains,
	})
	const { themeClass } = useProductMeta(productData.name as Products)

	return (
		<>
			<HashiHead
				title={productData.metadata.title}
				pageName={productData.metadata.title}
				siteName={productData.metadata.title}
				description={productData.metadata.description}
				image={productData.metadata.image}
				icon={productData.metadata.icon}
			/>

			<Min100Layout
				footer={
					<Footer
						openConsentManager={openConsentManager}
						heading={footer.heading}
						description={footer.description}
						cards={footer.cards}
						ctaLinks={footer.ctaLinks}
						navLinks={footer.navLinks}
					/>
				}
			>
				<ProductMetaProvider product={productData.slug as Products}>
					{productData.alertBannerActive && (
						<AlertBanner
							{...productData.alertBanner}
							product={productData.slug as Products}
							hideOnMobile
						/>
					)}
					<HashiStackMenu onPanelChange={() => null} />
					<ProductSubnav />
					<div className={themeClass}>{children}</div>
				</ProductMetaProvider>
			</Min100Layout>
			<ConsentManager />
		</>
	)
}

export default WaypointIoLayout
