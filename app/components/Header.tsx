import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wrapper } from "./Wrapper";

const Header = () => {
  return (
    <header className="py-6 border-b">
      <Wrapper>
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold font-mono">
            Ad402 Platform
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
