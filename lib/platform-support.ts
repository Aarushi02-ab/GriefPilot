export type PlatformSupportContact = {
  platformName: string;
  supportEmail: string;
};

const supportContacts: PlatformSupportContact[] = [
  { platformName: "Adobe", supportEmail: "support@adobe.com" },
  { platformName: "Airbnb", supportEmail: "support@airbnb.com" },
  { platformName: "Amazon", supportEmail: "cs-reply@amazon.com" },
  { platformName: "Apple iCloud", supportEmail: "support@apple.com" },
  { platformName: "Apple", supportEmail: "support@apple.com" },
  { platformName: "Bank of America", supportEmail: "abuse@bankofamerica.com" },
  { platformName: "Best Buy", supportEmail: "customercare@bestbuy.com" },
  { platformName: "Cash App", supportEmail: "support@cash.app" },
  { platformName: "Chase", supportEmail: "customer.service@chase.com" },
  { platformName: "Coinbase", supportEmail: "help@coinbase.com" },
  { platformName: "Discord", supportEmail: "support@discord.com" },
  { platformName: "Disney+", supportEmail: "support@disneyplus.com" },
  { platformName: "DoorDash", supportEmail: "support@doordash.com" },
  { platformName: "Dropbox", supportEmail: "support@dropbox.com" },
  { platformName: "eBay", supportEmail: "customerhelp@ebay.com" },
  { platformName: "Etsy", supportEmail: "support@etsy.com" },
  { platformName: "Facebook", supportEmail: "support@fb.com" },
  { platformName: "Fidelity", supportEmail: "webmaster@fidelity.com" },
  { platformName: "GitHub", supportEmail: "support@github.com" },
  { platformName: "Gmail", supportEmail: "support@google.com" },
  { platformName: "Google", supportEmail: "support@google.com" },
  { platformName: "Hulu", supportEmail: "support@hulu.com" },
  { platformName: "Instagram", supportEmail: "support@instagram.com" },
  { platformName: "LinkedIn", supportEmail: "linkedin_support@cs.linkedin.com" },
  { platformName: "Lyft", supportEmail: "support@lyft.com" },
  { platformName: "Meta", supportEmail: "support@fb.com" },
  { platformName: "Microsoft", supportEmail: "support@microsoft.com" },
  { platformName: "Netflix", supportEmail: "info@account.netflix.com" },
  { platformName: "Outlook", supportEmail: "support@microsoft.com" },
  { platformName: "PayPal", supportEmail: "service@paypal.com" },
  { platformName: "Pinterest", supportEmail: "help@pinterest.com" },
  { platformName: "Reddit", supportEmail: "contact@reddit.com" },
  { platformName: "Robinhood", supportEmail: "support@robinhood.com" },
  { platformName: "Salesforce", supportEmail: "support@salesforce.com" },
  { platformName: "Shopify", supportEmail: "support@shopify.com" },
  { platformName: "Slack", supportEmail: "feedback@slack.com" },
  { platformName: "Snapchat", supportEmail: "support@snapchat.com" },
  { platformName: "Spotify", supportEmail: "support@spotify.com" },
  { platformName: "Steam", supportEmail: "support@steampowered.com" },
  { platformName: "Target", supportEmail: "guest.service@target.com" },
  { platformName: "TikTok", supportEmail: "feedback@tiktok.com" },
  { platformName: "Twitch", supportEmail: "help@twitch.tv" },
  { platformName: "Uber", supportEmail: "support@uber.com" },
  { platformName: "Venmo", supportEmail: "support@venmo.com" },
  { platformName: "Walmart", supportEmail: "help@walmart.com" },
  { platformName: "Wells Fargo", supportEmail: "reportphish@wellsfargo.com" },
  { platformName: "X", supportEmail: "support@x.com" },
  { platformName: "Yahoo", supportEmail: "support@yahoo.com" },
  { platformName: "YouTube", supportEmail: "support@google.com" },
  { platformName: "Zoom", supportEmail: "support@zoom.us" }
];

function normalizePlatformName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findSupportContact(platformName: string) {
  const normalizedPlatformName = normalizePlatformName(platformName);

  return (
    supportContacts.find(
      (contact) =>
        normalizePlatformName(contact.platformName) === normalizedPlatformName
    ) ?? null
  );
}

export function getSupportContacts() {
  return supportContacts;
}
