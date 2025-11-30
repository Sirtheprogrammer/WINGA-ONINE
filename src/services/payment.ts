// FastLipa Payment Gateway Integration

const FASTLIPA_API_URL = 'https://api.fastlipa.com/api';
const FASTLIPA_API_KEY = 'FastLipa_CDJx4BJVzfagwiskGcJ'; // This should be in .env in production

export interface CreateTransactionRequest {
  number: string;
  amount: number;
  name: string;
}

export interface TransactionResponse {
  status: string;
  message: string;
  data: {
    tranID: string;
    amount: number;
    number: string;
    network: string;
    status: string;
    time: string;
  };
}

export interface TransactionStatusResponse {
  status: string;
  message: string;
  data: {
    tranid: string;
    payment_status: 'COMPLETED' | 'PENDING' | 'FAILED';
    amount: string;
    network: string;
    time: string;
  };
}

export async function createTransaction(
  number: string,
  amount: number,
  name: string
): Promise<TransactionResponse> {
  // Convert amount to integer (smallest currency unit - TZS shillings)
  // Since our prices are already in TZS, we just need to ensure it's an integer
  const amountInSmallestUnit = Math.round(amount);
  
  const response = await fetch(`${FASTLIPA_API_URL}/create-transaction`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FASTLIPA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: number.replace(/\s+/g, ''), // Remove spaces from phone number
      amount: amountInSmallestUnit,
      name,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment request failed' }));
    throw new Error(error.message || 'Failed to create transaction');
  }

  return response.json();
}

export async function checkTransactionStatus(tranid: string): Promise<TransactionStatusResponse> {
  const response = await fetch(
    `${FASTLIPA_API_URL}/status-transaction?tranid=${tranid}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FASTLIPA_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Status check failed' }));
    throw new Error(error.message || 'Failed to check transaction status');
  }

  return response.json();
}

