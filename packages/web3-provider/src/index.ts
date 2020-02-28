import ProviderEngine from 'web3-provider-engine'
// @ts-ignore
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'

interface ISignatureResponse {
  id: string
  signature: string
  address: string
}

interface IClient {
  connect: () => Promise<void>
  generateId: () => Promise<string>
  registerSignatureReceiver: (callback: (response: ISignatureResponse) => Promise<void>) => void
}

type ProviderOptions = {
  client: IClient
}

class MetaSignProvider extends ProviderEngine {
  public isMetaSign: boolean = true

  private _client: IClient
  private _pendingSignatures: { [id: string]: (signature: string) => void } = {}
  
  private _accounts: string[] = ['0x0000000000000000000000000000000000000000']

  constructor(options: ProviderOptions) {
    super()

    if (!options.client) {
      throw new Error('MetaSign client is nor provided')
    }

    this._client = options.client

    this.addProvider(
      new HookedWalletSubprovider({
        getAccounts: async (cb: any) => {
          cb(null, this._accounts);
        },
        processTypedMessage: async (msgParams: { data: string }, cb: any) => {
          try {
            const result = await this._processTypedMessage(msgParams.data)
            cb(null, result)
          } catch (error) {
            cb(error)
          }
        }
      })
    )
  }

  public async enable() {
    this._client.registerSignatureReceiver(this._signatureReceiver)
    return this._client.connect()
  }

  private async _processTypedMessage(data: string) {
    const id = await this._client.generateId()
    
    const pending: Promise<string> = new Promise((resolve: (signature: string) => void) => {
      this._pendingSignatures[id] = resolve
    })

    // TODO: showQR(data)
    return pending
  }

  private async _signatureReceiver(response: ISignatureResponse) {
    const resolver = this._pendingSignatures[response.id]
    resolver(response.signature)

    // Set last signer as the only account on provider
    this._accounts = [response.address]
  }
}

export default MetaSignProvider
