/* eslint-disable @typescript-eslint/naming-convention */

import { ethers } from 'ethers';
import { expandDecimals } from 'src/common/utils';

export enum MISSION {
  CHANNEL = 'CHANNEL',
  COMMUNITY = 'COMMUNITY',
  INVITE = 'INVITE',
}
export const AirdropAmount = {
  CHANNEL: ethers.utils.parseUnits('2500', 18),
  COMMUNITY: ethers.utils.parseUnits('2500', 18),
  INVITE: ethers.utils.parseUnits('1000', 18),
};
export const TotalAirdrop = expandDecimals(100_000_000, 18);
