import breakpoints from "@/utils/breakpoints";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useMedia } from "react-use";
import PageContainer from "../layout/PageContainer";
import Header from "../layout/components/Header";
import MobileFooter from "../layout/components/MobileFooter";

function RootLayout() {
  const isSmallerThanSm = useMedia(`(max-width: ${breakpoints.sm}px)`);
  return (
    <PageContainer>
      <Header />
      <Outlet />
      {isSmallerThanSm && <MobileFooter />}
    </PageContainer>
  );
}

interface RootRouteContext {
  shouldShowRuleButton?: boolean;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootLayout,
  beforeLoad: ({ location }) => {
    // Redirect from root to /daily if we're at the root path
    if (location.pathname === "/") {
      throw redirect({
        to: "/daily",
        search: location.search,
        hash: location.hash,
        replace: true,
      });
    }
  },
});
