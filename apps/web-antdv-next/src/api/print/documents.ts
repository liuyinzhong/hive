import { requestClient } from '#/api/request';

import type { PrintDocumentBundle, PrintDocumentData } from './types';

export function getPurchaseInboundPrintDocumentApi(inboundId: string) {
  return requestClient.get<PrintDocumentBundle>(
    `/printDocuments/purchaseInbound/${inboundId}`,
  );
}

export function getPurchaseInboundPrintDataApi(inboundId: string) {
  return requestClient.get<PrintDocumentData>(
    `/printDocuments/purchaseInbound/${inboundId}/data`,
  );
}
