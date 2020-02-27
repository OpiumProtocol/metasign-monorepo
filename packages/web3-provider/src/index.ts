import ProviderEngine from 'web3-provider-engine'
// @ts-ignore
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'

class MetaSignProvider extends ProviderEngine {
  constructor() {
    super()
    this.addProvider(
      new HookedWalletSubprovider({
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
    // TODO: client.connect
    console.log('DEBUG: enable()')
  }

  private async _processTypedMessage(data: string) {
    // TODO: client.create
    console.log('DEBUG: _processTypedMessage(data)', data)
    return '0x12345678'
  }
}

export default MetaSignProvider
