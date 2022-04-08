/* eslint-disable react/no-array-index-key */
import React, { ReactElement } from 'react'
import slugify from 'slugify'
import SidebarSidecarLayout from 'layouts/sidebar-sidecar'
import Heading from 'components/heading'
import Text from 'components/text'
import DevDotContent from 'components/dev-dot-content'
import GetStarted from './components/get-started'
import Cards from './components/cards'
import { ProductLandingProps } from './types'
import s from './product-landing.module.css'

function ProductLandingView({ content }: ProductLandingProps): ReactElement {
  return (
    <DevDotContent>
      <Heading
        className={s.pageHeading}
        size={500}
        level={1}
        slug={slugify(content.heading)}
        weight="bold"
      >
        {content.heading}
      </Heading>
      {content.subheading && (
        <Text className={s.pageSubheading}>{content.subheading}</Text>
      )}
      {content.blocks.map((block, idx) => {
        const { type } = block
        if (type === 'heading') {
          const { heading, slug, level, size } = block
          return (
            <Heading
              className={s[`h${level}`]}
              key={idx}
              weight="bold"
              {...{ slug, level, size }}
            >
              {heading}
            </Heading>
          )
        } else if (type === 'get_started') {
          const { heading, product, text, link } = block
          return <GetStarted key={idx} {...{ product, heading, text, link }} />
        } else if (type === 'cards') {
          const { columns, cards } = block
          return <Cards key={idx} {...{ columns, cards }} />
        }
        // If we don't have a recognized card type,
        // return a dev-oriented debug view of the block data
        // TODO: remove this for production, this is here
        // TODO: temporarily as we work through demo-oriented implementation
        return (
          <pre key={idx} style={{ border: '1px solid red' }}>
            <code>{JSON.stringify({ type, block }, null, 2)}</code>
          </pre>
        )
      })}
    </DevDotContent>
  )
}

ProductLandingView.layout = SidebarSidecarLayout
export default ProductLandingView
