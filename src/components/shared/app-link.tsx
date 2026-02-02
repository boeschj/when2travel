import { forwardRef } from 'react'
import { createLink } from '@tanstack/react-router'

import type { AnchorHTMLAttributes } from 'react'
import type { LinkComponent } from '@tanstack/react-router'

const BasicLinkComponent = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => <a ref={ref} {...props} />)

const CreatedLink = createLink(BasicLinkComponent)

export const AppLink: LinkComponent<typeof BasicLinkComponent> = (props) => (
  <CreatedLink preload="intent" {...props} />
)
