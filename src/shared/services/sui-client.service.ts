// import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SuiClientService {
  // client: SuiClient;

  constructor() {
    // this.client = new SuiClient({
    //   url: getFullnodeUrl(process.env.NETWORK as any),
    // });
  }
}
