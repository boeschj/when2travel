import type { AnchorHTMLAttributes, Ref } from "react";
import { createLink } from "@tanstack/react-router";
import type { LinkComponent } from "@tanstack/react-router";

interface BasicLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
}

function BasicLinkComponent({ ref, children, ...props }: BasicLinkProps) {
  return (
    <a
      ref={ref}
      {...props}
    >
      {children}
    </a>
  );
}

const CreatedLink = createLink(BasicLinkComponent);

export const AppLink: LinkComponent<typeof BasicLinkComponent> = props => (
  <CreatedLink
    preload="intent"
    {...props}
  />
);
