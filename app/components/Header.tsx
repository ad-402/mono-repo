import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wrapper } from "./Wrapper";

const Header = () => {
  return (
    <header className="py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Wrapper>
        <div className="flex items-center justify-between">
          <h1 className="text-lg tracking-tight font-sans font-semibold text-foreground">
            AD-402
          </h1>
          {/* <ConnectButton
            showBalance={false}
            accountStatus="address"
            label="Connect"
          /> */}
        </div>
      </Wrapper>
    </header>
  );
};

export { Header };
