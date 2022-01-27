/**
 * Abstracted from the ProductSwitcher component in development for the new dev portal UI. This is a temporary component
 * so there's not too much point trying to DRY this up.
 */
import Cookies from 'js-cookie'
import Popover, { positionDefault } from '@reach/popover'
import { IconBoundaryColor16 } from '@hashicorp/flight-icons/svg-react/boundary-color-16'
import { IconConsulColor16 } from '@hashicorp/flight-icons/svg-react/consul-color-16'
import { IconHashicorp16 } from '@hashicorp/flight-icons/svg-react/hashicorp-16'
import { IconNomadColor16 } from '@hashicorp/flight-icons/svg-react/nomad-color-16'
import { IconPackerColor16 } from '@hashicorp/flight-icons/svg-react/packer-color-16'
import { IconTerraformColor16 } from '@hashicorp/flight-icons/svg-react/terraform-color-16'
import { IconVagrantColor16 } from '@hashicorp/flight-icons/svg-react/vagrant-color-16'
import { IconVaultColor16 } from '@hashicorp/flight-icons/svg-react/vault-color-16'
import { IconWaypointColor16 } from '@hashicorp/flight-icons/svg-react/waypoint-color-16'
import {
  Fragment,
  KeyboardEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import { IconCaret16 } from '@hashicorp/flight-icons/svg-react/caret-16'
import { Product, ProductGroup, ProductSlug } from 'types/products'
import { products } from '../../../../../config/products'
import s from './style.module.css'

// TODO: is there a programmatic way to build this from productNamesToIcons?
interface ProductIconProps {
  product: ProductSlug
}

const productNamesToIcons = {
  boundary: IconBoundaryColor16,
  consul: IconConsulColor16,
  hcp: IconHashicorp16,
  nomad: IconNomadColor16,
  packer: IconPackerColor16,
  sentinel: null,
  terraform: IconTerraformColor16,
  vagrant: IconVagrantColor16,
  vault: IconVaultColor16,
  waypoint: IconWaypointColor16,
}

const ProductIcon: React.FC<
  ProductIconProps & React.HTMLProps<SVGSVGElement>
> = ({ product, ...rest }) => {
  const Icon = productNamesToIcons[product]
  if (!Icon) return null
  return <Icon {...rest} />
}

const OPTION_LIST_ID = 'product-chooser-option-list'
const OPTION_ID_PREFIX = 'product-chooser-list-item-'

const generateSwitcherOptionIdFromProduct = (product: Product) => {
  return `${OPTION_ID_PREFIX}${product.slug}`
}

const getFirstProduct = (products: Product[][]) => {
  return products[0][0]
}

const getLastProduct = (products: Product[][]) => {
  const lastProductGroup = products[products.length - 1]
  const lastProduct = lastProductGroup[lastProductGroup.length - 1]
  return lastProduct
}

const ProductSwitcher: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const productChooserRef = useRef<HTMLDivElement>()
  const buttonRef = useRef<HTMLButtonElement>()
  const firstAnchorRef = useRef<HTMLAnchorElement>()
  const lastAnchorRef = useRef<HTMLAnchorElement>()
  const shouldFocusFirstAnchor = useRef<boolean>(false)
  const firstProduct = getFirstProduct(products)
  const lastProduct = getLastProduct(products)

  const currentProduct =
    typeof window === 'undefined'
      ? null
      : products
          .flat()
          .find((product) => product.slug === Cookies.get('io_preview'))

  useEffect(() => {
    setIsMounted(true)
  }, [])

  /* @TODO: handle case where there is no
     currentProduct, eg on the home page */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Focuses the first anchor element if needed
    if (shouldFocusFirstAnchor.current) {
      firstAnchorRef.current.focus()
      shouldFocusFirstAnchor.current = false
    }

    const handleDocumentClick = (e) => {
      const isClickOutside = !productChooserRef.current.contains(e.target)
      if (isClickOutside) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => document.removeEventListener('click', handleDocumentClick)
  }, [isOpen])

  /**
   * It would be more optimal to set onKeyDown for the containing element, but
   * that is not allowed on a <div> with no role. We do not want to use a menu
   * role (see Adrian Roselli link below) so there is no role currently set on
   * the containing <div>. If we find an appropriate role, then we can change
   * the approach. For now, it's most appropriate to set onKeyDown on the
   * <button> and <ul>, hence this defintion:
   * `KeyboardEventHandler<HTMLButtonElement | HTMLUListElement>`.
   *
   * https://adrianroselli.com/2017/10/dont-use-aria-menu-roles-for-site-nav.html
   */
  const handleKeyDown: KeyboardEventHandler<
    HTMLButtonElement | HTMLUListElement
  > = (e) => {
    const isEscapeKey = e.key === 'Escape'
    const isEnterKey = e.key === 'Enter'
    const isSpaceKey = e.key === ' '

    /**
     * The reason we can't focus the first anchor here is because we have the
     * anchor element is not rendered until after `setIsOpen(true)` is called by
     * the <button>'s onClick (default behavior of <button> elements).
     *
     * Might be possible to do e.preventDefault and then do the focus() call
     * here? Not sure we need to do that though unless we are very against this
     * approach. I'd rather not prevent default behavior if we don't have to.
     */
    if (!isOpen && (isEnterKey || isSpaceKey)) {
      shouldFocusFirstAnchor.current = true
      return
    }

    if (isEscapeKey) {
      setIsOpen(false)
      buttonRef?.current?.focus()
      return
    }
  }

  const renderProductListItem = (product: Product): ReactElement => {
    const isFirstProduct = product.slug === firstProduct.slug
    const isLastProduct = product.slug === lastProduct.slug
    const isCurrentProduct = product.slug === currentProduct?.slug

    /**
     * TODO: this is temporary for the Vault icon since:
     *   - we do not have a yellow version of the icon available from
     *     flight-icons yet
     *   - the icon is currently on a dark background and appears "invisible"
     */
    const productIconClassName =
      product.slug === 'vault' ? s.vaultProductIcon : undefined

    const handleButtonKeyDown: KeyboardEventHandler<HTMLButtonElement> = (
      e
    ) => {
      const isFirstItem = firstAnchorRef.current.contains(e.currentTarget)
      const isLastItem = lastAnchorRef.current.contains(e.currentTarget)
      if (!(isFirstItem || isLastItem)) {
        return
      }

      const isTabbingForward = !e.shiftKey && e.key === 'Tab'
      const isTabbingBackward = e.shiftKey && e.key === 'Tab'
      if (!(isTabbingForward || isTabbingBackward)) {
        return
      }

      if (isFirstItem && isTabbingBackward) {
        lastAnchorRef.current.focus()
        e.preventDefault()
      } else if (isLastItem && isTabbingForward) {
        firstAnchorRef.current.focus()
        e.preventDefault()
      }
    }

    const setPreviewProduct = (slug: ProductSlug) => {
      if (slug !== currentProduct.slug) {
        Cookies.set('io_preview', slug)
        window.location.reload()
      }
    }

    let refToPass
    if (isFirstProduct) {
      refToPass = firstAnchorRef
    } else if (isLastProduct) {
      refToPass = lastAnchorRef
    }

    return (
      <li
        className={classNames(s.switcherOption, {
          [s.activeSwitcherOption]: isCurrentProduct,
        })}
        id={generateSwitcherOptionIdFromProduct(product)}
        key={product.slug}
      >
        <button
          aria-current={isCurrentProduct ? 'page' : undefined}
          className={classNames(
            s.switcherOptionAnchor,
            s.switcherOptionContainer
          )}
          onClick={() => setPreviewProduct(product.slug)}
          onKeyDown={handleButtonKeyDown}
          ref={refToPass}
        >
          <span className={s.focusContainer}>
            <ProductIcon
              className={productIconClassName}
              product={product.slug}
            />
            <span>{product.name}</span>
          </span>
        </button>
      </li>
    )
  }

  const renderProductGroup = (productGroup: ProductGroup, index: number) => {
    const shouldRenderHorizontalRule = index > 0
    return (
      <Fragment key={`product-group-${index}`}>
        {shouldRenderHorizontalRule && (
          <li className={s.separator} role="separator" />
        )}
        <li>
          <ul role="group">
            {productGroup.map((product) => renderProductListItem(product))}
          </ul>
        </li>
      </Fragment>
    )
  }

  if (!isMounted) return null

  /**
   * I _think_ we want the containing element to be a nav, currently clashes
   * with other styles so not using that element just yet
   */
  return (
    <div className={s.productSwitcher} ref={productChooserRef}>
      <button
        aria-controls={OPTION_LIST_ID}
        aria-expanded={isOpen}
        aria-labelledby={
          currentProduct
            ? generateSwitcherOptionIdFromProduct(currentProduct)
            : undefined
        }
        aria-label={currentProduct ? undefined : 'Product switcher'}
        className={s.switcherButton}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
      >
        <span className={s.switcherOptionContainer}>
          <ProductIcon
            className={classNames({
              [s.vaultProductIcon]: currentProduct?.slug === 'vault',
            })}
            product={currentProduct?.slug}
          />
          <span>{currentProduct ? currentProduct.name : 'Products'}</span>
        </span>
        <IconCaret16 className={s.switcherCaret} />
      </button>
      <Popover targetRef={buttonRef} style={{ display: 'block' }}>
        <ul
          className={s.switcherOptionList}
          id={OPTION_LIST_ID}
          onKeyDown={handleKeyDown}
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          {products.map(renderProductGroup)}
        </ul>
      </Popover>
    </div>
  )
}

export default ProductSwitcher
