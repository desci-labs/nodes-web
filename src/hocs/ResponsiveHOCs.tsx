import { useResponsive } from "hooks"

export const Desktop = ({ children }: any) => {
  const { isDesktop } = useResponsive()
  return isDesktop ? children : null
}

export const NotDesktop = ({ children }: any) => {
  const { isDesktop } = useResponsive()
  return !isDesktop ? children : null
}

export const Tablet = ({ children }: any) => {
  const { isTablet } = useResponsive()
  return isTablet ? children : null
}

export const NotTablet = ({ children }: any) => {
  const { isTablet } = useResponsive()
  return !isTablet ? children : null
}

export const Mobile = ({ children }: any) => {
  const { isMobile } = useResponsive()
  return isMobile ? children : null
}

export const NotMobile = ({ children }: any) => {
  const { isMobile } = useResponsive()
  return !isMobile ? children : null
}