# Account-Specific & Organization Sandbox Management

This dashboard now supports both account-specific and organization-specific sandbox management, where each account maintains its own separate set of sandboxes, and organizations can have sandboxes that mirror their account structure.

## Key Features

### 🏢 Account Isolation
- Each account has its own isolated set of sandboxes
- Switching accounts automatically updates the available sandboxes
- Account sandboxes are stored per account in browser localStorage

### 🏗️ Organization Sandboxes
- Organizations can have sandboxes that automatically mirror their account structure
- When creating an organization sandbox, it includes all accounts that belong to that organization
- Organization sandboxes show all accounts with their avatars and details
- Perfect for testing organization-wide features or configurations

### 🔄 Real-time Updates
- Sandbox lists update automatically when switching accounts
- Live statistics tracking (total sandboxes, recently used, created today)
- Persistent storage across browser sessions
- Automatic UI updates for both account and organization sandboxes

### 📊 Analytics & Tracking
- Track sandbox usage per account and organization
- Monitor recently used sandboxes
- See creation dates and usage statistics
- Separate statistics for account vs organization sandboxes

## Files Updated

### `dashboard.js`
- **Account Tracking**: Monitors active account changes using MutationObserver
- **Sandbox Management**: CRUD operations for both account-specific and organization sandboxes
- **Organization Structure**: Automatic mirroring of organization accounts in organization sandboxes
- **Data Persistence**: localStorage integration for cross-session data (separate storage for account vs organization sandboxes)
- **UI Updates**: Dynamic sandbox list updates when switching accounts, with visual differentiation between sandbox types

### `dashboard.html`
- **Sandbox UI**: New sandbox list container with improved visual design
- **Create Buttons**: Separate buttons for creating account vs organization sandboxes  
- **Organization Display**: Visual representation of organization sandboxes with account avatars
- **Interactive Elements**: Enter and delete buttons for both sandbox types

### `dashboard.css`
- **Sandbox Styling**: Complete styling for the new sandbox list interface
- **Visual Differentiation**: Different colors and icons for account vs organization sandboxes
- **Account Avatars**: Mini account avatars display in organization sandboxes
- **Responsive Design**: Mobile-friendly sandbox interface

## How It Works

### 1. Account Detection
The system automatically detects the current active account by monitoring the `data-account-name` attribute on the `#active-account` element.

```javascript
this.currentActiveAccount = activeAccount.dataset.accountName;
```

### 2. Organization Structure Mirroring
When creating an organization sandbox, the system automatically includes all accounts that belong to that organization:

```javascript
const orgAccounts = this.organizationAccounts[organizationId] || [];
const newOrganizationSandbox = {
    name: sandboxName,
    type: 'organization',
    organizationId: organizationId,
    accounts: orgAccounts.map(acc => ({ ...acc })), // Clone accounts
    created: new Date().toISOString(),
    lastUsed: null
};
```

### 3. Sandbox Storage Structure
Sandboxes are stored in localStorage with separate storage for account and organization sandboxes:

```json
{
  "accountSandboxes": {
    "Acme Corp": [
      {
        "name": "Acme Corp Development",
        "type": "account",
        "organization": null,
        "account": "Acme Corp",
        "created": "2024-01-15T10:30:00.000Z",
        "lastUsed": "2024-01-16T14:22:00.000Z"
      }
    ]
  },
  "organizationSandboxes": {
    "acme-inc": [
      {
        "name": "Acme Inc Development Environment",
        "type": "organization",
        "organizationId": "acme-inc",
        "accounts": [
          { "name": "Acme Eats US", "initials": "AE", "color": "color-1" },
          { "name": "Acme Eats UK", "initials": "AE", "color": "color-2" },
          { "name": "Acme Deliveries US", "initials": "AD", "color": "color-3" }
        ],
        "created": "2024-01-15T10:30:00.000Z",
        "lastUsed": null
      }
    ]
  }
}
```

### 4. Automatic UI Updates
When switching accounts, the system:
- Clears existing sandbox items from the UI
- Loads both account sandboxes and organization sandboxes (if applicable)
- Updates statistics and animations
- Maintains proper visual state with different styling for each type

## API Reference

### Core Methods

#### `getSandboxesForAccount(accountName)`
Returns the list of account sandboxes for a specific account.

#### `getOrganizationSandboxesForOrganization(organizationId)`
Returns the list of organization sandboxes for a specific organization.

#### `createSandbox(sandboxName, sandboxType = 'account')`
Creates a new sandbox for the current active account. If `sandboxType` is 'organization', creates an organization sandbox that mirrors the organization structure.

#### `createOrganizationSandbox(sandboxName)`
Creates a new organization sandbox with all accounts from the organization automatically included.

#### `deleteSandbox(sandboxName)`
Deletes an account sandbox from the current active account.

#### `deleteOrganizationSandbox(sandboxName, organizationId)`
Deletes an organization sandbox from the specified organization.

#### `enterSandboxMode(sandbox)`
Enters sandbox mode and updates the last used timestamp. Works for both account and organization sandboxes.

#### `getAccountStats(accountName)`
Returns statistics for an account including total sandboxes, recently used count, and sandboxes created today.

#### `getOrganizationStats(organizationId)`
Returns statistics for an organization including total organization sandboxes, recently used count, and sandboxes created today.

### Global Functions

```javascript
// Create a sandbox for the current account
createSandbox('My New Sandbox', 'account');

// Create an organization sandbox (automatically mirrors organization structure)
createSandbox('Org Testing Environment', 'organization');

// Delete a sandbox from the current account
deleteSandbox('Old Sandbox');

// Delete an organization sandbox
deleteOrganizationSandbox('Old Org Sandbox', 'acme-inc');

// Get account statistics
const stats = getAccountStats('Acme Corp');
console.log(stats.totalSandboxes, stats.recentlyUsed, stats.createdToday);

// Get organization statistics
const orgStats = getOrganizationStats('acme-inc');
console.log(orgStats.totalSandboxes, orgStats.recentlyUsed, orgStats.createdToday);
```

## Usage Example

### Testing the Functionality

1. Open `dashboard.html` in your browser
2. Notice each account shows both account sandboxes and organization sandboxes (if applicable)
3. Click "Create Account Sandbox" to create a sandbox specific to the current account
4. Click "Create Organization Sandbox" to create a sandbox that mirrors the organization structure
5. Switch between accounts to see different sandbox lists
6. Organization sandboxes show all accounts with their avatars and colors
7. Check browser localStorage to see separate storage for account vs organization sandboxes

### Integration with Existing Dashboard

The updated `dashboard.js` maintains backward compatibility while adding:
- Organization-specific sandbox management
- Automatic organization structure mirroring
- Visual differentiation between sandbox types
- Automatic UI updates on account switches
- Separate data persistence for different sandbox types
- Real-time statistics tracking for both types

## Benefits

### 🔒 Data Isolation
- Complete separation of sandbox data between accounts
- Separate storage for account vs organization sandboxes
- No cross-account data leakage
- Secure account-specific operations

### 🏗️ Organization Structure Mirroring
- Organization sandboxes automatically include all organization accounts
- Perfect for testing organization-wide features
- Visual representation of organization structure
- Maintains organization hierarchy in sandbox environment

### 🚀 Better UX
- Visual differentiation between account and organization sandboxes
- Relevant sandboxes shown per account
- Automatic context switching
- Persistent data across sessions
- Intuitive creation and management interface

### 📈 Insights
- Per-account and per-organization usage statistics
- Sandbox creation and usage tracking
- Performance monitoring capabilities
- Separate analytics for different sandbox types

## Browser Support

- Modern browsers with localStorage support
- MutationObserver API support
- ES6+ features (arrow functions, const/let)

## Future Enhancements

- Server-side sandbox synchronization
- Sandbox templates and cloning
- Advanced analytics and reporting
- Collaborative sandbox sharing
- Import/export functionality
- Organization structure sync with external systems
- Role-based sandbox permissions
- Sandbox environments with different configurations

---

The enhanced sandbox management system ensures that each account maintains its own isolated set of sandboxes while also supporting organization-level sandboxes that mirror the complete organization structure. This provides better organization and security for multi-account environments while enabling organization-wide testing and configuration scenarios. 