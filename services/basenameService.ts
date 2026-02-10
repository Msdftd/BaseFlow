/**
 * Basename Resolution Service
 * Resolves Base wallet addresses to human-readable Basenames + avatars
 * Used to satisfy Base Mini App requirement: "Display user profile (avatar + username) instead of raw 0x"
 */

// Cache resolved names to avoid repeated lookups
const nameCache = new Map<string, { name: string | null; avatar: string | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve a wallet address to a Basename (e.g. "alice.base.eth")
 * Uses Base Mainnet ENS reverse resolution
 */
export async function resolveBasename(address: string): Promise<string | null> {
  const lowerAddr = address.toLowerCase();

  // Check cache first
  const cached = nameCache.get(lowerAddr);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.name;
  }

  try {
    // Method 1: Use Base's public ENS-compatible resolver API
    const response = await fetch(
      `https://resolver-api.basename.app/v1/addresses/${lowerAddr}`,
      { signal: AbortSignal.timeout(3000) }
    );

    if (response.ok) {
      const data = await response.json();
      const name = data?.name || data?.basename || null;
      nameCache.set(lowerAddr, { name, avatar: null, timestamp: Date.now() });
      return name;
    }
  } catch {
    // Silent fail - try fallback
  }

  try {
    // Method 2: Direct RPC reverse resolution on Base Mainnet
    // Encode reverse resolver call for addr.reverse
    const reverseName = `${lowerAddr.slice(2)}.addr.reverse`;
    const response = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD', // Base ENS Reverse Registrar
          data: `0x691f3431${reverseName}` // name(bytes32)
        }, 'latest']
      }),
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.result && result.result !== '0x') {
        // Decode the name from the response
        const name = decodeENSName(result.result);
        if (name) {
          nameCache.set(lowerAddr, { name, avatar: null, timestamp: Date.now() });
          return name;
        }
      }
    }
  } catch {
    // Silent fail
  }

  // Cache the miss too
  nameCache.set(lowerAddr, { name: null, avatar: null, timestamp: Date.now() });
  return null;
}

/**
 * Try to decode an ENS name from hex response
 */
function decodeENSName(hex: string): string | null {
  try {
    if (!hex || hex === '0x' || hex.length < 130) return null;
    // Remove 0x prefix and offset/length headers (first 128 chars = 64 bytes)
    const dataHex = hex.slice(130);
    const bytes = new Uint8Array(dataHex.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []);
    const decoded = new TextDecoder().decode(bytes).replace(/\0/g, '').trim();
    return decoded.length > 0 && decoded.includes('.') ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Generate a deterministic avatar gradient from wallet address
 * Creates a unique color combination for each address
 */
export function generateAvatarGradient(address: string): { from: string; to: string } {
  const hash = address.slice(2, 14);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 45 + (parseInt(hash.slice(4, 8), 16) % 60)) % 360;
  const sat1 = 65 + (parseInt(hash.slice(8, 10), 16) % 25);
  const sat2 = 60 + (parseInt(hash.slice(10, 12), 16) % 30);

  return {
    from: `hsl(${hue1}, ${sat1}%, 60%)`,
    to: `hsl(${hue2}, ${sat2}%, 45%)`
  };
}

/**
 * Format address for display - shows shortened version
 */
export function formatDisplayAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * React hook-compatible function to get display info for a wallet
 * Returns: { displayName, avatarGradient, isResolved }
 */
export async function getWalletDisplayInfo(address: string): Promise<{
  displayName: string;
  avatarGradient: { from: string; to: string };
  isBasename: boolean;
}> {
  const gradient = generateAvatarGradient(address);
  const basename = await resolveBasename(address);

  return {
    displayName: basename || formatDisplayAddress(address),
    avatarGradient: gradient,
    isBasename: !!basename
  };
}
