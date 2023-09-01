import { Connector, Actions } from "@web3-react/types";
import { DEFAULT_CHAIN } from "@components/molecules/ConnectWithSelect";

function parseChainId(chainId: string | number) {
  return typeof chainId === "string" ? Number.parseInt(chainId, 16) : chainId;
}
// const clientId = "BNEax8qoe0LpzrzELcDx_IDP2iZzkzwMaG4aZll3g21Ni9Tconvb9g6oNEoH3myYUR0a2Bga3VeGkGMAQygQSUo";
export interface Web3AuthConnectorArguments {
  apiKey: string;
}

export class Web3AuthConnector extends Connector {
  private readonly options: Web3AuthConnectorArguments;
  public torus?: any;
  private eagerConnection?: Promise<void> | null;
  constructor(actions: Actions, options: Web3AuthConnectorArguments) {
    super(actions);
    this.options = options;
  }

  public async deactivate(): Promise<void> {
    if ((window as any).torusChecker) {
      clearInterval((window as any).torusChecker);
    }
    await (window as any).torus.logout();
    (window as any).torus.provider.selectedAddress = null;
    this.actions.resetState();

    await (window as any).torus.cleanUp();
    this.eagerConnection = null;
  }
  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = new Promise(async (resolve, reject) => {
      let torus = (window as any).torus;
      if (!torus) {
        (window as any).torus = new (window as any).Torus.default();
        torus = (window as any).torus;
      }

      if (!torus.isInitialized) {
        await torus.init({
          // buildEnv,
          enabledVerifiers: {
            reddit: false,
            // facebook: false,
            // twitter: false,
            // discord: false,
            // apple: false,
            line: false,
            // linkedin: false,
          },
          enableLogging: true,
          network: {
            host: "https://eth-goerli.g.alchemy.com/v2/ZeIzCAJyPpRnTtPNSmddHGF-q2yp-2Uy",
            chainId: DEFAULT_CHAIN,
            // chainId: 336,
            // networkName: 'DES Network',
            // host: 'https://quorum.block360.io/https',
            // ticker: 'DES',
            // tickerName: 'DES Coin',
          },
          showTorusButton: true,
          integrity: {
            version: "2.2.9",
            check: false,
            // hash: 'sha384-jwXOV6VJu+PM89ksbCSZyQRjf5FdX8n39nWfE/iQBMh4r5m027ua2tkQ+83FPdp9'
          },
          loginConfig: undefined,
          // whiteLabel: whiteLabelData,
          skipTKey: true,
        });
      }

      // this.actions.startActivation();
      try {
        await torus.login();
      } catch (err) {
        this.actions.resetState();
        // await (window as any).torus.cleanUp();
        // (window as any).torus = new (window as any).Torus();
        this.eagerConnection = null;
        console.error(err);

        return;
      }

      await torus.ethereum.enable();
      const provider = torus.ethereum;

      // const provider = (window as any).torus.provider;
      if (provider) {
        this.provider = provider;

        // handle the case when e.g. metamask and coinbase wallet are both installed
        // if (this.provider.providers?.length) {
        //   this.provider =
        //     this.provider.providers.find((p) => p.isMetaMask) ??
        //     this.provider.providers[0];
        // }

        provider.on("connect", ({ chainId }: any): void => {
          this.actions.update({ chainId: parseChainId(chainId) });
        });

        provider.on("disconnect", (error: any): void => {
          this.actions.resetState();
          this.onError?.(error);
        });

        provider.on("chainChanged", (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) });
        });

        provider.on("accountsChanged", (accounts: string[]): void => {
          if (accounts.length === 0) {
            // handle this edge case by disconnecting
            this.actions.resetState();
          } else {
            this.actions.update({ accounts });
          }
        });
        resolve();
        return provider;
      }
    }));
  }

  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    await this.isomorphicInitialize();
    if (!this.provider) return cancelActivation();

    return Promise.all([
      this.provider.request({ method: "eth_chainId" }) as Promise<string>,
      this.provider.request({ method: "eth_accounts" }) as Promise<string[]>,
    ])
      .then(async ([chainId, accounts]) => {
        if (accounts.length) {
          this.actions.update({ chainId: parseChainId(chainId), accounts });
          if (parseChainId(chainId) !== 5) {
            // await (window as any).torus.setProvider({
            //   host: "goerli", // default : 'mainnet'
            // });
            // (window as any).torus.provider._handleChainChanged({
            //   chainId: 5,
            //   networkVersion: 1,
            // });
          }
        } else {
          throw new Error("No accounts returned");
        }
      })
      .catch((error) => {
        console.debug("Could not connect eagerly", error);
        // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
        // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
        // update has occurred, so we reset state instead
        this.actions.resetState();
      });
  }

  public async activate(): Promise<void> {
    await this.isomorphicInitialize();

    this.provider = (window as any).torus.provider;

    if (this.provider) {
      (window as any).torusChecker = setInterval(() => {
        return Promise.all([
          this.provider!.request({ method: "eth_chainId" }) as Promise<string>,
          this.provider!.request({ method: "eth_accounts" }) as Promise<
            string[]
          >,
        ]).then(async ([chainId, accounts]) => {
          if (accounts.length) {
            this.actions.update({ chainId: parseChainId(chainId), accounts });
          }
        });
      }, 1000);
      await Promise.all([
        this.provider.request({ method: "eth_chainId" }) as Promise<string>,
        this.provider.request({ method: "eth_accounts" }) as Promise<string[]>,
      ])
        .then(async ([chainId, accounts]) => {
          this.actions.update({
            chainId: parseChainId(chainId),
            accounts,
          });
          // if (parseChainId(chainId) != 5) {
          //   await (window as any).torus.setProvider({
          //     host: "goerli", // default : 'mainnet'
          //   });
          // }
        })
        .catch((error) => {
          this.actions.resetState();
          console.error(error);
        });
    }
  }
}
